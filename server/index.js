import 'dotenv/config';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import requestLogger from './middleware/requestLogger.js';
import errorHandler from './middleware/errorHandler.js';

import userRouter from './routes/user.js';
import roadmapRouter from './routes/roadmap.js';
import nodeRouter from './routes/node.js';
import analyticsRouter from './routes/analytics.js';
import collabRouter from './routes/collab.js';
import workspaceRouter from './routes/workspace.js';
import loopComponentRouter from './routes/loopComponent.js';
import searchRouter from './routes/search.js';
import recapRouter from './routes/recap.js';
import aiAssistantRouter from './routes/aiAssistant.js';
import automationRouter from './routes/automation.js';
import mcpRouter from './routes/mcp.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, process.env.CLIENT_DIST_PATH || '../client/dist');

app.use(requestLogger);
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', environment: process.env.NODE_ENV || 'development', timestamp: new Date().toISOString() });
});

app.use('/api/user', userRouter);
app.use('/api/roadmap', roadmapRouter);
app.use('/api/node', nodeRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/collab', collabRouter);
app.use('/api/workspace', workspaceRouter);
app.use('/api/loop-component', loopComponentRouter);
app.use('/api/search', searchRouter);
app.use('/api/recap', recapRouter);
app.use('/api/ai-assistant', aiAssistantRouter);
app.use('/api/automation', automationRouter);
app.use('/api/mcp', mcpRouter);

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath, { maxAge: '1d' }));
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  console.warn('[PulseLearn][WARN] Client build directory not found at', clientDistPath);
}

app.use(errorHandler);

const port = process.env.PORT || '3001';
app.listen(port, () => console.log(`Pulse-Learn server running on port ${port}`));
