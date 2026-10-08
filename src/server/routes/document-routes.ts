import { Router } from 'express';
import { db } from '../db/schema';
import { parseDocumentContent, parseMultipleDocuments } from '../services/documentParsingService';
import { saveMasterBudgetSOV } from '../services/intakeService';
import { addInvoice } from '../services/invoiceService';
import { broadcastEvent } from '../websocket';

export const documentRouter = Router();

documentRouter.post('/api/documents/parse', async (req, res) => {
  try {
    const { fileName, content, projectId, bufferBase64 } = req.body;
    if (!fileName) {
      res.status(400).json({ error: 'fileName is required' });
      return;
    }
    const result = await parseDocumentContent(fileName, content || '', projectId || 'proj-212-maple', bufferBase64);
    broadcastEvent({ type: 'DOCUMENT_PARSED', project_id: projectId, payload: result });
    res.json({
      success: true,
      result,
      ...result,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

documentRouter.post('/api/documents/parse-batch', async (req, res) => {
  try {
    const { files, projectId } = req.body;
    if (!files || !Array.isArray(files) || files.length === 0) {
      res.status(400).json({ error: 'files array is required and must not be empty' });
      return;
    }
    const batchResult = await parseMultipleDocuments(files, projectId || 'proj-user-active');
    broadcastEvent({ type: 'DOCUMENTS_BATCH_PARSED', project_id: projectId, payload: batchResult });
    res.json({
      success: true,
      result: batchResult,
      ...batchResult,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

documentRouter.post('/api/documents/apply-batch', (req, res) => {
  try {
    const { projectId, sovLines, invoices, actorName = 'Sam', actorRole = 'ACCOUNTANT' } = req.body;
    if (!projectId) {
      res.status(400).json({ error: 'projectId is required' });
      return;
    }

    if (sovLines && Array.isArray(sovLines) && sovLines.length > 0) {
      saveMasterBudgetSOV(
        projectId,
        sovLines.map((l: any) => ({
          category: l.category,
          cost_code: l.cost_code || l.costCode,
          amount: Number(l.amount) || 0,
        })),
        'CFO'
      );
    }

    if (invoices && Array.isArray(invoices) && invoices.length > 0) {
      for (const inv of invoices) {
        addInvoice(
          projectId,
          {
            category: inv.category,
            vendor_name: inv.vendor || inv.vendor_name,
            amount: Number(inv.amount) || 0,
            invoice_id: inv.invoice_id || inv.invoiceNumber || `INV-${Math.floor(1000 + Math.random() * 9000)}`,
            description: inv.description,
            expense_date: inv.expense_date || inv.documentDate,
            lien_waiver_received: inv.lien_waiver_received ?? inv.lienWaiver ?? true,
          },
          actorName,
          actorRole as any
        );
      }
    }

    broadcastEvent({ type: 'PROJECT_UPDATED', project_id: projectId });
    res.json({ success: true, message: 'Extracted batch documents successfully committed to project.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

documentRouter.get('/api/projects/:id/documents', (req, res) => {
  try {
    const docs = db
      .prepare(
        `SELECT d.*, de.extracted_data, de.overall_confidence 
         FROM documents d 
         LEFT JOIN document_extractions de ON d.id = de.document_id 
         WHERE d.project_id = ? 
         ORDER BY d.uploaded_at DESC`
      )
      .all(req.params.id);
    res.json(docs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
