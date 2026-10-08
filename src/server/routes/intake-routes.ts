import { Router } from 'express';
import {
  createProjectWithLoan,
  saveMasterBudgetSOV,
  addDirectExpense,
  saveScheduleMilestones,
  createFullUserProjectIntake,
} from '../services/intakeService';

export const intakeRouter = Router();

intakeRouter.post('/api/intake/full-project', (req, res) => {
  try {
    const result = createFullUserProjectIntake(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

intakeRouter.post('/api/intake/project', (req, res) => {
  try {
    const { projectData, loanData } = req.body;
    const result = createProjectWithLoan(projectData, loanData);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

intakeRouter.post('/api/intake/sov', (req, res) => {
  try {
    const { projectId, lines, actorRole } = req.body;
    const result = saveMasterBudgetSOV(projectId, lines, actorRole);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

intakeRouter.post('/api/intake/expense', (req, res) => {
  try {
    const { projectId, expenseData, actorRole } = req.body;
    const result = addDirectExpense(projectId, expenseData, actorRole);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

intakeRouter.post('/api/intake/schedule', (req, res) => {
  try {
    const { projectId, activities, actorRole } = req.body;
    const result = saveScheduleMilestones(projectId, activities, actorRole);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});
