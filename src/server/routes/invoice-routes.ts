import { Router } from 'express';
import { getProjectInvoices, addInvoice, updateInvoice, deleteInvoice } from '../services/invoiceService';

export const invoiceRouter = Router();

invoiceRouter.get('/api/projects/:projectId/invoices', (req, res) => {
  try {
    const invoices = getProjectInvoices(req.params.projectId);
    res.json(invoices);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

invoiceRouter.post('/api/projects/:projectId/invoices', (req, res) => {
  try {
    const { invoiceData, actorName, actorRole } = req.body;
    const result = addInvoice(req.params.projectId, invoiceData, actorName || 'Sam', actorRole || 'ACCOUNTANT');
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

invoiceRouter.put('/api/invoices/:id', (req, res) => {
  try {
    const { updates, actorName, actorRole } = req.body;
    const result = updateInvoice(req.params.id, updates, actorName || 'Sam', actorRole || 'ACCOUNTANT');
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

invoiceRouter.delete('/api/invoices/:id', (req, res) => {
  try {
    const { actorName } = req.body;
    const result = deleteInvoice(req.params.id, actorName || 'Sam');
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});
