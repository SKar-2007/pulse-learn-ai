import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './lib/supabaseClient';
import { apiUrl, authHeaders } from './lib/apiClient';
import LoginForm from './components/auth/LoginForm';
import PersonalityOnboarding from './components/auth/PersonalityOnboarding';
import Dashboard from './components/Dashboard';
import LoadingScreen from './components/LoadingScreen';

const DEMO_SESSION = {
  access_token: 'demo',
  user: { id: 'demo-user', email: 'demo@pulse.test' },
};

const MIN_LOADER_MS = 1800;

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
  const [minLoaderVisible, setMinLoaderVisible] = useState(startDemo ? false : true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('pulse_theme');
    document.documentElement.dataset.theme = savedTheme || 'dark';
  }, []);

  useEffect(() => {
    if (startDemo) return;

    const timer = setTimeout(() => setMinLoaderVisible(false), MIN_LOADER_MS);
    return () => clearTimeout(timer);
  }, [startDemo]);

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
      setLoading(false);
    }
  };

  if (loading || minLoaderVisible) {
    return <LoadingScreen />;
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
