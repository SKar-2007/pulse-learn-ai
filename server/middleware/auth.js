import { getUserFromAccessToken } from '../services/supabaseService.js';
import { HttpError } from '../utils/httpError.js';

export default async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return next(new HttpError('Missing Authorization header.', 401, 'missing_authorization'));
  }

  try {
    const user = await getUserFromAccessToken(token);
    req.user = user;
    next();
  } catch (error) {
    next(new HttpError('Invalid authorization token.', 401, 'invalid_authorization'));
  }
}
