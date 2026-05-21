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
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-indigo-300/80">Welcome back</p>
        <h1 className="text-3xl font-semibold text-white">Pulse Learn AI</h1>
        <p className="text-slate-400">Sign in or create an account to access your learning roadmaps and active recall practice.</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <label className="block text-sm text-slate-300">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-base"
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
            className="input-base"
            placeholder="••••••••"
            required
          />
        </label>

        {authError ? <p className="text-sm text-rose-400">{authError}</p> : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <button type="submit" className="btn-primary">
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
