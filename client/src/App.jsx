import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './lib/supabaseClient';
import { apiUrl, authHeaders } from './lib/apiClient';
import LoginForm from './components/auth/LoginForm';
import PersonalityOnboarding from './components/auth/PersonalityOnboarding';
import Dashboard from './components/Dashboard';

const DEMO_SESSION = {
  access_token: 'demo',
  user: { id: 'demo-user', email: 'demo@pulse.test' },
};

const DEMO_PROFILE = {
  mbti_type: 'INTJ',
  study_domain: 'AI Strategy',
  expertise_level: 'Intermediate',
};

export default function App() {
  const queryParams = new URLSearchParams(window.location.search);
  const startDemo = queryParams.get('demo') === 'true' || import.meta.env.VITE_DEMO_MODE === 'true';
  const [session, setSession] = useState(startDemo ? DEMO_SESSION : null);
  const [profile, setProfile] = useState(startDemo ? DEMO_PROFILE : undefined); // undefined = loading, null = needs onboarding
  const [loading, setLoading] = useState(startDemo ? false : true);

  useEffect(() => {
    if (startDemo) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session);
      else setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session);
      else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => listener?.subscription?.unsubscribe();
  }, []);

  const fetchProfile = async (sess) => {
    if (sess?.access_token === 'demo') {
      setProfile(DEMO_PROFILE);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(apiUrl('/api/user/profile'), {
        headers: authHeaders(sess.access_token),
      });
      const data = await res.json();
      setProfile(data.profile); // null means onboarding needed

      // Update local persona memory if profile exists
      if (data.profile) {
        localStorage.setItem('pulse_persona', JSON.stringify(data.profile));
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setProfile(null);
    } finally {
      // Small artificial delay to show off the premium loader
      setTimeout(() => setLoading(false), 800);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[30%] left-[20%] w-64 h-64 bg-indigo-500 rounded-full blur-[100px] animate-pulse" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 flex flex-col items-center gap-6"
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-800 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0 shadow-[0_0_20px_rgba(99,102,241,0.4)]"></div>
          </div>
          <div className="text-center">
            <h2 className="text-white font-bold tracking-widest uppercase text-xs mb-1">Pulse-Learn AI</h2>
            <p className="text-gray-500 text-[10px] font-medium animate-pulse">Syncing your learning engine...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {!session ? (
        <motion.div
          key="login"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="w-full"
        >
          <LoginForm />
        </motion.div>
      ) : (profile === null || !profile.mbti_type) ? (
        <motion.div
          key="onboarding"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="w-full"
        >
          <PersonalityOnboarding session={session} onComplete={setProfile} />
        </motion.div>
      ) : (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full"
        >
          <Dashboard session={session} profile={profile} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
