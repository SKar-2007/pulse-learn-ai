import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import { Sparkles, Mail, Lock, ArrowRight, Github } from 'lucide-react';

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignup, setIsSignup] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // Personality Memory: Check if this user has been here before
    const savedPersona = JSON.parse(localStorage.getItem('pulse_persona') || 'null');
    const teaserText = savedPersona
        ? `Welcome back, ${savedPersona.expertise_level} ${savedPersona.study_domain || 'scholar'}`
        : "Your personality-aware learning journey starts here.";

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
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
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-[2.5rem] p-10 shadow-2xl shadow-indigo-500/10">
                    <div className="flex flex-col items-center mb-10 text-center">
                        <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-6">
                            <Sparkles className="text-white" size={32} />
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tight mb-2">Pulse-Learn <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">AI</span></h1>
                        <p className="text-gray-400 text-sm font-medium">{teaserText}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email Address"
                                className="w-full pl-12 pr-4 py-4 bg-gray-950/50 border border-gray-800 text-white rounded-2xl outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-gray-600"
                                required
                            />
                        </div>

                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className="w-full pl-12 pr-4 py-4 bg-gray-950/50 border border-gray-800 text-white rounded-2xl outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-gray-600"
                                required
                            />
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.p
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="text-red-400 text-xs font-medium bg-red-400/10 p-3 rounded-xl border border-red-400/20"
                                >
                                    {error}
                                </motion.p>
                            )}
                        </AnimatePresence>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-900/40 disabled:opacity-50 flex items-center justify-center gap-2 group"
                        >
                            {loading ? 'Authenticating...' : (
                                <>
                                    {isSignup ? 'Create Engine' : 'Sign In'}
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-800" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase tracking-widest">
                            <span className="bg-gray-900 px-3 text-gray-500 font-bold">Or continue with</span>
                        </div>
                    </div>

                    <button
                        onClick={handleGoogle}
                        className="w-full py-4 bg-gray-950 border border-gray-800 hover:bg-gray-800 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-3"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Google
                    </button>

                    <p className="mt-8 text-center text-sm font-medium">
                        <span className="text-gray-500">
                            {isSignup ? 'Already a student?' : "New to Pulse-Learn?"}
                        </span>{' '}
                        <button
                            onClick={() => setIsSignup(!isSignup)}
                            className="text-indigo-400 hover:text-indigo-300 transition-colors font-bold"
                        >
                            {isSignup ? 'Sign In' : 'Create Account'}
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
