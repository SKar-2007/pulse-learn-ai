import { getUserFromAccessToken } from '../services/supabaseService.js';

export default async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Missing Authorization header.' });
  }

  try {
    const user = await getUserFromAccessToken(token);
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid authorization token.' });
  }
}
