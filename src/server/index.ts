// GroundUp AI — Backend API & Real-time Server
// Intake-First API with Zero-Hallucination Lineage

import express from 'express';
import cors from 'cors';
import http from 'http';
import { initDatabase } from './db/schema';
import { seedSampleProjects } from './data/seedData';
import { setupWebSocket, broadcastEvent } from './websocket';
import { projectRouter } from './routes/project-routes';
import { intakeRouter } from './routes/intake-routes';
import { drawRouter } from './routes/draw-routes';
import { invoiceRouter } from './routes/invoice-routes';
import { documentRouter } from './routes/document-routes';
import { aiRouter } from './routes/ai-routes';

export { broadcastEvent } from './websocket';

const app = express();
const server = http.createServer(app);

setupWebSocket(server);

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize Database with sample projects
initDatabase();
seedSampleProjects();

// Mount Modular API Routers
app.use(projectRouter);
app.use(intakeRouter);
app.use(drawRouter);
app.use(invoiceRouter);
app.use(documentRouter);
app.use(aiRouter);

// Global Error Handler
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
