import uuid

import pytest
from httpx import ASGITransport, AsyncClient

from app.db.models import DocumentExtraction, ExtractionField
from app.db.session import SessionLocal
from app.main import app


@pytest.mark.asyncio
async def test_document_upload_deduplication_and_download():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Owner signup
        owner_email = f"owner_{uuid.uuid4().hex[:6]}@example.com"
        await client.post(
            "/api/v1/auth/signup",
            json={
                "organization_name": "Metro Heights Dev",
                "email": owner_email,
                "password": "Password123!",
                "first_name": "Diana",
                "last_name": "Prince",
            },
        )

        # Create project
        proj_resp = await client.post(
            "/api/v1/projects",
            json={
                "name": "Metro Tower",
                "project_entity": "Metro LLC",
                "address": "500 Main St, NY",
            },
        )
        project_id = proj_resp.json()["data"]["id"]

        # 1. Authorize presigned upload URL
        url_resp = await client.post(
            "/api/v1/documents/upload-url",
            json={
                "filename": "invoice_001.pdf",
                "content_type": "application/pdf",
                "size_bytes": 1024,
                "project_id": project_id,
            },
        )
        assert url_resp.status_code == 200
        assert url_resp.json()["data"]["upload_url"] is not None

        # 2. Reject executable or macro-enabled upload
        bad_upload = await client.post(
            "/api/v1/documents/upload-url",
            json={
                "filename": "malicious_script.sh",
                "content_type": "application/x-sh",
                "size_bytes": 500,
            },
        )
        assert bad_upload.status_code == 400
        assert bad_upload.json()["error"]["code"] == "VALIDATION_FAILED"

        # 3. Direct multipart upload
        sample_pdf_bytes = b"%PDF-1.4 sample invoice content for GroundUp AI"
        files = {"file": ("invoice_001.pdf", sample_pdf_bytes, "application/pdf")}
        upload_resp = await client.post(
            "/api/v1/documents/upload",
            files=files,
            data={"project_id": project_id},
        )
        assert upload_resp.status_code == 200, upload_resp.text
        doc_data = upload_resp.json()["data"]
        doc1_id = doc_data["id"]
        assert doc_data["duplicate_of_document_id"] is None
        assert doc_data["ingestion_status"] == "READY_FOR_REVIEW"

        # 4. Exact duplicate upload with identical content
        files_dup = {"file": ("invoice_001_copy.pdf", sample_pdf_bytes, "application/pdf")}
        upload_dup_resp = await client.post(
            "/api/v1/documents/upload",
            files=files_dup,
            data={"project_id": project_id},
        )
        assert upload_dup_resp.status_code == 200
        dup_data = upload_dup_resp.json()["data"]
        # Deduplication must reference original doc1_id!
        assert dup_data["duplicate_of_document_id"] == doc1_id

        # 5. Download URL & download content
        dl_url_resp = await client.get(f"/api/v1/documents/{doc1_id}/download-url")
        assert dl_url_resp.status_code == 200
        assert dl_url_resp.json()["data"]["download_url"] is not None

        content_resp = await client.get(f"/api/v1/documents/{doc1_id}/download")
        assert content_resp.status_code == 200
        assert content_resp.content == sample_pdf_bytes

        # 6. Mark document as DUPLICATE or MISFILED
        mark_resp = await client.post(
            f"/api/v1/documents/{doc1_id}/mark",
            json={
                "mark": "MISFILED",
                "rationale": "Belongs to adjacent lot, misfiled in folder",
            },
        )
        assert mark_resp.status_code == 200
        assert mark_resp.json()["data"]["ingestion_status"] == "REVIEWED"

        # 7. Manual entry linked to document
        manual_resp = await client.post(
            f"/api/v1/documents/{doc1_id}/manual-entry",
            json={
                "field_name": "InvoiceTotal",
                "value": "125000",
                "notes": "Verified by invoice stamp",
            },
        )
        assert manual_resp.status_code == 200
        assert manual_resp.json()["data"]["status"] == "recorded"


@pytest.mark.asyncio
async def test_extraction_fields_and_review_decision():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Owner signup
        owner_email = f"owner_{uuid.uuid4().hex[:6]}@example.com"
        await client.post(
            "/api/v1/auth/signup",
            json={
                "organization_name": "Pinnacle Dev",
                "email": owner_email,
                "password": "Password123!",
                "first_name": "Clark",
                "last_name": "Kent",
            },
        )

        # Upload doc
        sample_bytes = b"Contract text"
        files = {"file": ("contract.pdf", sample_bytes, "application/pdf")}
        upload_resp = await client.post("/api/v1/documents/upload", files=files)
        doc_id = upload_resp.json()["data"]["id"]

        # Seed an extraction field directly in db
        db = SessionLocal()
        try:
            extraction = DocumentExtraction(
                document_id=uuid.UUID(doc_id),
                model_version="v1.0",
                status="COMPLETED",
            )
            db.add(extraction)
            db.flush()

            field = ExtractionField(
                extraction_id=extraction.id,
                field_name="ContractorFee",
                proposed_value="45000",
                confidence=0.98,
                status="PROPOSED",
            )
            db.add(field)
            db.commit()
            field_id = str(field.id)
        finally:
            db.close()

        # List extractions via API
        list_resp = await client.get(f"/api/v1/documents/{doc_id}/extractions")
        assert list_resp.status_code == 200
        assert len(list_resp.json()["data"]) == 1

        # Accept / edit extraction decision
        dec_resp = await client.post(
            f"/api/v1/extraction-fields/{field_id}/decision",
            json={
                "decision": "EDIT",
                "accepted_value": "48000",
                "rationale": "Includes amendment #1 fee",
            },
        )
        assert dec_resp.status_code == 200
        data = dec_resp.json()["data"]
        assert data["status"] == "EDIT"
        assert data["accepted_value"] == "48000"


@pytest.mark.asyncio
async def test_document_project_scope_isolation():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Owner signup
        owner_email = f"owner_{uuid.uuid4().hex[:6]}@example.com"
        await client.post(
            "/api/v1/auth/signup",
            json={
                "organization_name": "Horizon Dev",
                "email": owner_email,
                "password": "Password123!",
                "first_name": "Bruce",
                "last_name": "Wayne",
            },
        )

        # Create Project A
        proj_a_resp = await client.post(
            "/api/v1/projects",
            json={
                "name": "Project Alpha",
                "project_entity": "Alpha LLC",
                "address": "100 Gotham Way, NY",
            },
        )
        assert proj_a_resp.status_code == 200, proj_a_resp.text
        proj_a_id = proj_a_resp.json()["data"]["id"]

        # Upload doc assigned to Project A
        files = {"file": ("alpha_doc.pdf", b"Alpha secret plan", "application/pdf")}
        upload_resp = await client.post(
            "/api/v1/documents/upload",
            files=files,
            data={"project_id": proj_a_id},
        )
        alpha_doc_id = upload_resp.json()["data"]["id"]

        # Invite GC user (scoped to non-alpha project or unassigned)
        gc_email = f"gc_{uuid.uuid4().hex[:6]}@example.com"
        inv_resp = await client.post(
            "/api/v1/invitations",
            json={
                "email": gc_email,
                "role": "GC",
                "scope": "PROJECT",
            },
        )
        assert inv_resp.status_code == 200
        inv_data = inv_resp.json()["data"]
        token = inv_data["invitation_url"].split("token=")[1]

        # GC accepts invitation
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as gc_client:
            accept_resp = await gc_client.post(
                f"/api/v1/invitations/{token}/accept",
                json={
                    "first_name": "Bob",
                    "last_name": "Builder",
                    "password": "Password123!",
                },
            )
            assert accept_resp.status_code == 200

            # GC attempts to access Alpha's document without membership -> returns 404
            dl_resp = await gc_client.get(f"/api/v1/documents/{alpha_doc_id}/download")
            assert dl_resp.status_code == 404
            assert dl_resp.json()["error"]["code"] == "NOT_FOUND"
