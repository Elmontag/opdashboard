import express from 'express';
import cors from 'cors';
import projectsRouter from './routes/projects';
import { env } from './config/env';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/healthz', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/projects', projectsRouter);

app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  res.status(500).json({ message: error.message });
});

app.listen(env.port, () => {
  console.log(`Server läuft auf Port ${env.port}`);
});
