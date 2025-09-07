import { Express } from 'express';
import documentsRouter from './documents';

export const registerRoutes = (app: Express) => {
  app.use('/api/documents', documentsRouter);
};
