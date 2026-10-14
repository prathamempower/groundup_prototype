import { api } from "@/lib/api";

export interface PresignedUploadUrlResult {
  document_id: string;
  upload_url: string;
  key: string;
  expires_in: number;
}

export interface UploadFileOptions {
  onProgress?: (progressPercent: number) => void;
}

export interface UploadAdapter {
  getUploadUrl(filename: string, mimeType: string): Promise<PresignedUploadUrlResult>;
  uploadFile(uploadUrl: string, file: File | Blob, options?: UploadFileOptions): Promise<void>;
  confirmUpload(documentId: string): Promise<{ id: string; status: string; sha256: string; job_id: string }>;
}

export class MockUploadAdapter implements UploadAdapter {
  async getUploadUrl(filename: string, mimeType: string): Promise<PresignedUploadUrlResult> {
    const res = await api.documents.getUploadUrl(filename, mimeType);
    return res.data;
  }

  async uploadFile(_uploadUrl: string, _file: File | Blob, options?: UploadFileOptions): Promise<void> {
    if (options?.onProgress) {
      options.onProgress(50);
      await new Promise((r) => setTimeout(r, 50));
      options.onProgress(100);
    }
  }

  async confirmUpload(documentId: string): Promise<{ id: string; status: string; sha256: string; job_id: string }> {
    const res = await api.documents.confirmUpload(documentId);
    return res.data;
  }
}

export const uploadAdapter: UploadAdapter = new MockUploadAdapter();
export const S3UploadAdapter = MockUploadAdapter;
