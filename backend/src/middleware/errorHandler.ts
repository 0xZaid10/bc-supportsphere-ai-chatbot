import { Request, Response, NextFunction } from 'express';

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
};

export default errorHandler;
