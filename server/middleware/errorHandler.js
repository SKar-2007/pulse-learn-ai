import { logError } from '../utils/logger.js';

export default function errorHandler(err, req, res, next) {
  logError(err, {
    path: req.originalUrl,
    method: req.method,
    userId: req.user?.id,
    body: req.body,
  });

  const status = err.status || 500;
  const response = {
    error: err.message || 'Internal Server Error',
  };

  if (err.code) {
    response.code = err.code;
  }

  if (process.env.NODE_ENV === 'development') {
    response.details = err.stack;
  }

  res.status(status).json(response);
}
