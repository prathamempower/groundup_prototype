// GroundUp AI — Backend API & Real-time Server
// Intake-First API with Zero-Hallucination Lineage

import express from 'express';
import cors from 'cors';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { initDatabase, db } from './db/schema';
import { seedDatabase, seedSampleProjects } from './data/seedData';
import { getAllProjects, getProjectFourTruths, updateProject, deleteProject } from './services/projectService';
import {
  addDirectExpense,
  createProjectWithLoan,
  saveMasterBudgetSOV,
  saveScheduleMilestones,
  createFullUserProjectIntake,
} from './services/intakeService';
import {
  createDrawRevision,
  createDrawSubmission,
  getProjectDraws,
  recordLenderReview,
  recordWireDisbursement,
} from './services/drawService';
import { getFigureProvenance } from './services/provenanceService';
import { getProjectInvoices, addInvoice, updateInvoice, deleteInvoice } from './services/invoiceService';
import { handleAIChatQuery } from './services/aiChatService';


const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize Database with sample projects
initDatabase();
seedSampleProjects();

// WebSocket connection handling for real-time reactivity
const clients = new Set<WebSocket>();

wss.on('connection', (ws) => {
  clients.add(ws);
  ws.send(JSON.stringify({ type: 'CONNECTED', timestamp: new Date().toISOString() }));

  ws.on('close', () => {
    clients.delete(ws);
  });
});

export function broadcastEvent(event: { type: string; project_id?: string; payload?: any }) {
  const message = JSON.stringify({ ...event, timestamp: new Date().toISOString() });
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

// Projects & Calculations
app.get('/api/projects', (req, res) => {
  try {
    const projects = getAllProjects();
    res.json(projects);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/projects/:id', (req, res) => {
  try {
    const summary = getProjectFourTruths(req.params.id);
    res.json(summary);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

app.put('/api/projects/:id', (req, res) => {
  try {
    const updated = updateProject(req.params.id, req.body);
    broadcastEvent({ type: 'PROJECT_UPDATED', project_id: req.params.id, payload: updated });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/projects/:id', (req, res) => {
  try {
    const result = deleteProject(req.params.id);
    broadcastEvent({ type: 'PROJECT_DELETED', project_id: req.params.id });
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Dynamic Invoices Endpoints
app.get('/api/projects/:projectId/invoices', (req, res) => {
  try {
    const invoices = getProjectInvoices(req.params.projectId);
    res.json(invoices);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/projects/:projectId/invoices', (req, res) => {
  try {
    const { invoiceData, actorName, actorRole } = req.body;
    const result = addInvoice(req.params.projectId, invoiceData, actorName || 'Sam', actorRole || 'ACCOUNTANT');
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/invoices/:id', (req, res) => {
  try {
    const { updates, actorName, actorRole } = req.body;
    const result = updateInvoice(req.params.id, updates, actorName || 'Sam', actorRole || 'ACCOUNTANT');
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/invoices/:id', (req, res) => {
  try {
    const { actorName } = req.body;
    const result = deleteInvoice(req.params.id, actorName || 'Sam');
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Financial AI Chat Assistant Endpoint
app.post('/api/chat/ask', (req, res) => {
  try {
    const { projectId, message, userContext } = req.body;
    const result = handleAIChatQuery(projectId, message, userContext || { name: 'Sam', company: 'ABC Company', role: 'Owner' });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});



// Intake Wizard Endpoints
app.post('/api/intake/full-project', (req, res) => {
  try {
    const result = createFullUserProjectIntake(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/intake/project', (req, res) => {
  try {
    const { projectData, loanData } = req.body;
    const result = createProjectWithLoan(projectData, loanData);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/intake/sov', (req, res) => {
  try {
    const { projectId, lines, actorRole } = req.body;
    const result = saveMasterBudgetSOV(projectId, lines, actorRole);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/intake/expense', (req, res) => {
  try {
    const { projectId, expenseData, actorRole } = req.body;
    const result = addDirectExpense(projectId, expenseData, actorRole);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/intake/schedule', (req, res) => {
  try {
    const { projectId, activities, actorRole } = req.body;
    const result = saveScheduleMilestones(projectId, activities, actorRole);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Draws & Rejection State Machine
app.get('/api/projects/:id/draws', (req, res) => {
  try {
    const draws = getProjectDraws(req.params.id);
    res.json(draws);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/draws/submit', (req, res) => {
  try {
    const { projectId, drawNumber, lines, actorRole } = req.body;
    const result = createDrawSubmission(projectId, drawNumber, lines, actorRole);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/draws/:drawId/lender-review', (req, res) => {
  try {
    const { response, actorRole } = req.body;
    const result = recordLenderReview(req.params.drawId, response, actorRole);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/draws/:drawId/revision', (req, res) => {
  try {
    const { correctiveLines, actorRole } = req.body;
    const result = createDrawRevision(req.params.drawId, correctiveLines, actorRole);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/draws/:drawId/disburse', (req, res) => {
  try {
    const { disbursedAmount, actorRole } = req.body;
    const result = recordWireDisbursement(req.params.drawId, disbursedAmount, actorRole);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Financial Risk Alerts & Checks Endpoints
import { getProjectAlerts, resolveAlert } from './services/alertService';

app.get('/api/projects/:id/alerts', (req, res) => {
  try {
    const alerts = getProjectAlerts(req.params.id);
    res.json(alerts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/alerts/:id/resolve', (req, res) => {
  try {
    const { actorName } = req.body;
    const result = resolveAlert(req.params.id, actorName || 'Sam');
    broadcastEvent({ type: 'ALERT_RESOLVED', payload: result });
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Document Intelligence & Multi-Document Parsing Endpoints
import { parseDocumentContent, parseMultipleDocuments } from './services/documentParsingService';

app.post('/api/documents/parse', async (req, res) => {
  try {
    const { fileName, content, projectId, bufferBase64 } = req.body;
    if (!fileName) {
      res.status(400).json({ error: 'fileName is required' });
      return;
    }
    const result = await parseDocumentContent(fileName, content || '', projectId || 'proj-212-maple', bufferBase64);
    broadcastEvent({ type: 'DOCUMENT_PARSED', project_id: projectId, payload: result });
    // Envelope supports both direct property access (data.lineItems) and nested (data.result.lineItems)
    res.json({
      success: true,
      result,
      ...result,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/documents/parse-batch', async (req, res) => {
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

app.post('/api/documents/apply-batch', (req, res) => {
  try {
    const { projectId, sovLines, invoices, actorName = 'Sam', actorRole = 'ACCOUNTANT' } = req.body;
    if (!projectId) {
      res.status(400).json({ error: 'projectId is required' });
      return;
    }

    // 1. Apply SOV Lines if provided
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

    // 2. Apply Invoices if provided
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

app.get('/api/projects/:id/documents', (req, res) => {
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

// Click-to-Source Provenance Lineage
app.get('/api/provenance/:figureType/:projectId', (req, res) => {
  try {
    const figureType = req.params.figureType as any;
    const projectId = req.params.projectId;
    const category = req.query.category as string | undefined;
    const provenance = getFigureProvenance(figureType, projectId, category);
    res.json(provenance);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Database Seed Reset
app.post('/api/reset-seed', (req, res) => {
  try {
    seedDatabase();
    broadcastEvent({ type: 'DATABASE_RESET' });
    res.json({ success: true, message: 'Database reset to clean state (no sample projects).' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// End-to-End AI Processing Pipeline (10 Steps matching Architecture Spec)
import { executeAIPipeline, generateFinalReport, getPortfolioSummary } from './services/pipelineService';

app.post('/api/pipeline/process', async (req, res) => {
  try {
    const { sourceType, projectName, projectAddress, targetBudget, units, squareFeet, files, userContext, humanApprovedOverride } = req.body;
    const result = await executeAIPipeline({
      sourceType: sourceType || 'FILE_UPLOAD',
      projectName,
      projectAddress,
      targetBudget,
      units,
      squareFeet,
      files: files || [],
      userContext: userContext || { name: 'Harrison Reed', company: 'Acme Builders LLC', email: 'user@groundup.ai' },
      humanApprovedOverride: Boolean(humanApprovedOverride),
    });
    res.json(result);
  } catch (err: any) {
    console.error('Pipeline Processing Error:', err);
    res.status(500).json({ error: err.message || 'Pipeline processing failed' });
  }
});

// Dynamic Live Portfolio Summary computed from Database
app.get('/api/portfolio/summary', (req, res) => {
  try {
    const summary = getPortfolioSummary();
    res.json(summary);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Certified Final Audit & Reconciliation Report
app.get('/api/projects/:id/final-report', (req, res) => {
  try {
    const report = generateFinalReport(req.params.id);
    res.json(report);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

// Global Error Handler — ensures all errors return JSON instead of HTML <!DOCTYPE>
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Express Error:', err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    error: err.type === 'entity.too.large' 
      ? `Uploaded document payload too large (${(err.length / 1024 / 1024).toFixed(1)}MB). Maximum allowed is 50MB.`
      : err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 3001;
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`🚀 GroundUp AI API Server running on http://localhost:${PORT}`);
  });
}

