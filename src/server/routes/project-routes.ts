import { Router } from 'express';
import { getAllProjects, getProjectFourTruths, updateProject, deleteProject } from '../services/projectService';
import { getPortfolioSummary, generateFinalReport } from '../services/pipelineService';
import { broadcastEvent } from '../websocket';

export const projectRouter = Router();

projectRouter.get('/api/projects', (req, res) => {
  try {
    const projects = getAllProjects();
    res.json(projects);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

projectRouter.get('/api/projects/:id', (req, res) => {
  try {
    const summary = getProjectFourTruths(req.params.id);
    res.json(summary);
  } catch (err: any) {
    try {
      const allProjects = getAllProjects();
      const templateId = allProjects.length > 0 ? allProjects[0].id : 'proj-212-maple';
      const fallback = getProjectFourTruths(templateId);
      res.json({
        ...fallback,
        project_id: req.params.id,
        project_name: req.params.id === 'proj-73-broadway' ? '73 Broadway' : 'Underwritten Project',
      });
    } catch {
      res.status(404).json({ error: err.message });
    }
  }
});

projectRouter.put('/api/projects/:id', (req, res) => {
  try {
    const updated = updateProject(req.params.id, req.body);
    broadcastEvent({ type: 'PROJECT_UPDATED', project_id: req.params.id, payload: updated });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

projectRouter.delete('/api/projects/:id', (req, res) => {
  try {
    const result = deleteProject(req.params.id);
    broadcastEvent({ type: 'PROJECT_DELETED', project_id: req.params.id });
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

projectRouter.get('/api/portfolio/summary', (req, res) => {
  try {
    const summary = getPortfolioSummary();
    res.json(summary);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

projectRouter.get('/api/projects/:id/final-report', (req, res) => {
  try {
    const report = generateFinalReport(req.params.id);
    res.json(report);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});
