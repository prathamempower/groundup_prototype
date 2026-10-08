import { Router } from 'express';
import {
  getProjectDraws,
  createDrawSubmission,
  recordLenderReview,
  createDrawRevision,
  recordWireDisbursement,
} from '../services/drawService';

export const drawRouter = Router();

drawRouter.get('/api/projects/:id/draws', (req, res) => {
  try {
    const draws = getProjectDraws(req.params.id);
    res.json(draws);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

drawRouter.post('/api/draws/submit', (req, res) => {
  try {
    const { projectId, drawNumber, lines, actorRole } = req.body;
    const result = createDrawSubmission(projectId, drawNumber, lines, actorRole);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

drawRouter.post('/api/draws/:drawId/lender-review', (req, res) => {
  try {
    const { response, actorRole } = req.body;
    const result = recordLenderReview(req.params.drawId, response, actorRole);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

drawRouter.post('/api/draws/:drawId/revision', (req, res) => {
  try {
    const { correctiveLines, actorRole } = req.body;
    const result = createDrawRevision(req.params.drawId, correctiveLines, actorRole);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

drawRouter.post('/api/draws/:drawId/disburse', (req, res) => {
  try {
    const { disbursedAmount, actorRole } = req.body;
    const result = recordWireDisbursement(req.params.drawId, disbursedAmount, actorRole);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});
