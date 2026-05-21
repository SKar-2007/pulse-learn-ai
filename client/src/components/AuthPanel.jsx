import { useState } from 'react';

export default function AuthPanel({ onSignIn, onSignUp, authError }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('signIn');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (mode === 'signIn') {
      await onSignIn(email, password);
    } else {
      await onSignUp(email, password);
    }

    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/20">
      <h1 className="text-3xl font-semibold text-indigo-300">Pulse Learn Auth</h1>
      <p className="mt-2 text-slate-400">Sign in with your Supabase account or create a new user to access the roadmap engine.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <label className="block text-sm text-slate-300">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100"
            placeholder="name@company.com"
            required
          />
        </label>

        <label className="block text-sm text-slate-300">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100"
            placeholder="••••••••"
            required
          />
        </label>

        {authError ? <p className="text-sm text-rose-400">{authError}</p> : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
          >
            {loading ? 'Working…' : mode === 'signIn' ? 'Sign in' : 'Sign up'}
          </button>

          <button
            type="button"
            onClick={() => setMode(mode === 'signIn' ? 'signUp' : 'signIn')}
            className="text-sm text-slate-400 underline underline-offset-4 transition hover:text-slate-100"
          >
            {mode === 'signIn' ? 'Create an account' : 'Already have an account?'}
          </button>
        </div>
      </form>
    </div>
  );
}
