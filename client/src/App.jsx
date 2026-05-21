import { useEffect, useState } from 'react';
import { supabase } from './lib/supabaseClient';
import LoginForm from './components/auth/LoginForm';
import PersonalityOnboarding from './components/auth/PersonalityOnboarding';
import Dashboard from './components/Dashboard';

export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(undefined); // undefined = loading, null = needs onboarding
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user/profile`, {
        headers: { Authorization: `Bearer ${sess.access_token}` },
      });
      const data = await res.json();
      setProfile(data.profile); // null means onboarding needed
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium animate-pulse">Initializing Pulse-Learn...</p>
        </div>
      </div>
    );
  }

  if (!session) return <LoginForm />;

  if (profile === null) {
    return <PersonalityOnboarding session={session} onComplete={setProfile} />;
  }

  return <Dashboard session={session} profile={profile} />;
}
