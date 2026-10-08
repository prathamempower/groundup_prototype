import { Router } from 'express';
import { handleAIChatQuery } from '../services/aiChatService';
import { getFigureProvenance } from '../services/provenanceService';
import { getProjectAlerts, resolveAlert } from '../services/alertService';
import { executeAIPipeline } from '../services/pipelineService';
import { seedDatabase } from '../data/seedData';
import { broadcastEvent } from '../websocket';

export const aiRouter = Router();

aiRouter.post('/api/chat/ask', (req, res) => {
  try {
    const { projectId, message, userContext } = req.body;
    const result = handleAIChatQuery(projectId, message, userContext || { name: 'Sam', company: 'ABC Company', role: 'Owner' });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

aiRouter.get('/api/provenance/:figureType/:projectId', (req, res) => {
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

aiRouter.get('/api/projects/:id/alerts', (req, res) => {
  try {
    const alerts = getProjectAlerts(req.params.id);
    res.json(alerts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

aiRouter.post('/api/alerts/:id/resolve', (req, res) => {
  try {
    const { actorName } = req.body;
    const result = resolveAlert(req.params.id, actorName || 'Sam');
    broadcastEvent({ type: 'ALERT_RESOLVED', payload: result });
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

aiRouter.post('/api/pipeline/process', async (req, res) => {
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

aiRouter.post('/api/reset-seed', (req, res) => {
  try {
    seedDatabase();
    broadcastEvent({ type: 'DATABASE_RESET' });
    res.json({ success: true, message: 'Database reset to clean state (no sample projects).' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
