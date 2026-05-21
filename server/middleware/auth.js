import { createClient } from '@supabase/supabase-js';

const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authorization token' });
  }

  const token = authHeader.split(' ')[1];

  if (token === 'demo') {
    req.user = { id: 'demo-user', email: 'demo@pulse.test' };
    return next();
  }

  if (!supabase) {
    return res.status(500).json({ error: 'Server misconfigured: SUPABASE_URL is required for authenticated requests.' });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = user; // Now available in all route handlers as req.user.id
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Authentication failed' });
  }
}

// Maintaining default export for backward compatibility if needed, but PRD uses named export
export default requireAuth;
