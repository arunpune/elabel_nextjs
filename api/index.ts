import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { registerRoutes } from '../server/routes';
import { ensureSchema } from '../server/migrate';

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

let isReady = false;
let initPromise: Promise<void> | null = null;

async function init() {
  if (isReady) return;
  if (!initPromise) {
    initPromise = (async () => {
      try {
        if (process.env.DATABASE_URL) {
          await ensureSchema().catch((err) =>
            console.error('Database schema update failed:', err.message),
          );
        }
        await registerRoutes(app);
        isReady = true;
      } catch (err) {
        console.error('Failed to initialize API routes:', err);
        throw err;
      }
    })();
  }
  await initPromise;
}

export default async function handler(req: Request, res: Response) {
  await init();
  return app(req, res);
}
