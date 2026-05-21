import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import roadmapRouter from './routes/roadmap.js';
import nodeRouter from './routes/node.js';

dotenv.config();
const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/roadmap', roadmapRouter);
app.use('/api/node', nodeRouter);

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Pulse-Learn server running on port ${port}`));
