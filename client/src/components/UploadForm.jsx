import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function UploadForm({ token, onRoadmapGenerated }) {
  const [file, setFile] = useState(null);
  const [hours, setHours] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!file) {
      setError('Please upload a file.');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('syllabus', file);
    formData.append('timeBudgetHours', hours);

    try {
      const response = await axios.post(`${API_URL}/api/roadmap/generate`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      onRoadmapGenerated(response.data.roadmap);
      setFile(null);
      setHours(10);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="app-card">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-100">Upload Your Syllabus</h2>
          <p className="mt-2 text-sm text-slate-400">Upload a syllabus PDF to create a structured learning path.</p>
        </div>
        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-400">Rapid</span>
      </div>

      <div className="mt-6 space-y-4">
        <label className="block text-sm text-slate-300">
          Course Material (PDF or TXT, max 15MB)
          <input
            type="file"
            accept=".pdf,.txt"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="mt-2 block w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 focus:border-indigo-500 focus:outline-none"
          />
        </label>

        <label className="block text-sm text-slate-300">
          Total Study Hours
          <input
            type="number"
            min="1"
            max="200"
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="mt-2 block w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 focus:border-indigo-500 focus:outline-none"
          />
        </label>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-3xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Generating Skill Tree...' : 'Generate Learning Path ✨'}
        </button>
      </div>
    </form>
  );
}
