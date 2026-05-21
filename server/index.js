import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import roadmapRouter from './routes/roadmap.js';
import nodeRouter from './routes/node.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.join(__dirname, '../client/dist');

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/roadmap', roadmapRouter);
app.use('/api/node', nodeRouter);

app.use(express.static(clientDistPath));
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Pulse-Learn server running on port ${port}`));
