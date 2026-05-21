// Supabase email/password login with OAuth Google button
import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignup, setIsSignup] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        const { error } = isSignup
            ? await supabase.auth.signUp({ email, password })
            : await supabase.auth.signInWithPassword({ email, password });
        if (error) setError(error.message);
        setLoading(false);
    };

    const handleGoogle = async () => {
        await supabase.auth.signInWithOAuth({ provider: 'google' });
    };

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-10 w-full max-w-sm space-y-5">
                <h1 className="text-3xl font-bold text-white text-center">Pulse-Learn AI</h1>
                <p className="text-gray-400 text-center text-sm">Your personalized learning engine</p>

                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl border border-gray-600 outline-none focus:border-indigo-500"
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl border border-gray-600 outline-none focus:border-indigo-500"
                />
                {error && <p className="text-red-400 text-sm">{error}</p>}

                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
                >
                    {loading ? 'Loading...' : isSignup ? 'Create Account' : 'Sign In'}
                </button>

                <button
                    onClick={handleGoogle}
                    className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-all"
                >
                    Continue with Google
                </button>

                <p
                    onClick={() => setIsSignup(!isSignup)}
                    className="text-center text-gray-400 text-sm cursor-pointer hover:text-indigo-400"
                >
                    {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                </p>
            </div>
        </div>
    );
}
