import 'dotenv/config';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import requestLogger from './middleware/requestLogger.js';
import errorHandler from './middleware/errorHandler.js';
import roadmapRouter from './routes/roadmap.js';
import nodeRouter from './routes/node.js';

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

app.use('/api/roadmap', roadmapRouter);
app.use('/api/node', nodeRouter);

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath, { maxAge: '1d' }));
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  console.warn('[PulseLearn][WARN] Client build directory not found at', clientDistPath);
}

app.use(errorHandler);

const port = normalizePort(process.env.PORT || '3001');
app.listen(port, () => console.log(`Pulse-Learn server running on port ${port}`));

function normalizePort(value) {
  const portNumber = Number(value);
  if (Number.isNaN(portNumber)) {
    return value;
  }
  if (portNumber >= 0) {
    return portNumber;
  }
  throw new Error('Invalid port value: ' + value);
}
