import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import { Sparkles, Mail, Lock, ArrowRight, Github } from 'lucide-react';
import {API_BASE} from '../../lib/apiClient';

const enableGoogleAuth = import.meta.env.VITE_ENABLE_GOOGLE_AUTH === 'true';

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignup, setIsSignup] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    // Personality Memory: Check if this user has been here before
    const savedPersona = JSON.parse(localStorage.getItem('pulse_persona') || 'null');
    const teaserText = savedPersona
        ? `Welcome back, ${savedPersona.expertise_level} ${savedPersona.study_domain || 'scholar'}`
        : "Your personality-aware learning journey starts here.";

    const apiUrl = API_BASE;

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        if (isSignup) {
            try {
                const response = await fetch(`${apiUrl}/api/user/signup`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });

                const body = await response.json();
                if (!response.ok) {
                    throw new Error(body.error || 'Signup failed.');
                }

                if (body.session) {
                    await supabase.auth.setSession(body.session);
                    setMessage('Account created and signed in. Redirecting...');
                } else {
                    setMessage('Account created. Please sign in to continue.');
                }
            } catch (err) {
                setError(err.message || 'Unable to create account.');
            }
        } else {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) setError(error.message);
        }

        setLoading(false);
    };

    const handleGoogle = async () => {
        setError(null);
        setMessage('Redirecting to Google...');

        const provider = 'google';
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: window.location.origin,
            },
        });

        if (error) {
            const unsupported = /unsupported provider/i.test(error.message || '');
            setError(
                unsupported
                    ? 'Google login is not enabled in your Supabase Auth settings. Enable Google OAuth for this project and try again.'
                    : error.message || 'Google sign-in failed.'
            );
            setMessage(null);
            return;
        }

        if (data?.url) {
            window.location.href = data.url;
        } else {
            setError('Unable to start Google sign-in.');
            setMessage(null);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10 panel"
            >
                <div className="space-y-8">
                    <div className="text-center space-y-3">
                        <div className="mx-auto h-16 w-16 rounded-full border border-white/20 flex items-center justify-center">
                            <Sparkles className="text-white" size={28} />
                        </div>
                        <h1 className="text-3xl font-bold uppercase tracking-[0.25em]">Pulse-Learn</h1>
                        <p className="text-sm text-white/70">{teaserText}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-[0.25em] text-white/70">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email Address"
                                className="input-minimal"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-[0.25em] text-white/70">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className="input-minimal"
                                required
                            />
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.p
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-white"
                                >
                                    {error}
                                </motion.p>
                            )}
                            {!error && message && (
                                <motion.p
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-white"
                                >
                                    {message}
                                </motion.p>
                            )}
                        </AnimatePresence>

                        <button
                            type="submit"
                            className="w-full btn-minimal"
                            disabled={loading}
                        >
                            {loading ? 'Working...' : isSignup ? 'Create Account' : 'Sign In'}
                        </button>

                        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-white/50">
                            <span className="h-px flex-1 bg-white/10" />
                            <span>Or continue with</span>
                            <span className="h-px flex-1 bg-white/10" />
                        </div>

                        {enableGoogleAuth ? (
                            <button
                                type="button"
                                onClick={handleGoogle}
                                className="w-full btn-minimal"
                            >
                                Continue with Google
                            </button>
                        ) : (
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                                Google signup is disabled. Enable `VITE_ENABLE_GOOGLE_AUTH=true` and enable Google OAuth in your Supabase Auth provider settings.
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={() => { window.location.search = '?demo=true'; }}
                            className="w-full btn-minimal"
                        >
                            Continue in Demo Mode
                        </button>

                        <p className="mt-4 text-center text-sm text-white/70">
                            <span>{isSignup ? 'Already a student?' : 'New to Pulse-Learn?'}</span>{' '}
                            <button
                                type="button"
                                onClick={() => setIsSignup(!isSignup)}
                                className="underline text-white"
                            >
                                {isSignup ? 'Sign In' : 'Create Account'}
                            </button>
                        </p>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}