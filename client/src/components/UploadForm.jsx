import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function UploadForm({ token, onCreated }) {
  const [title, setTitle] = useState('');
  const [hours, setHours] = useState(10);
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('Generating roadmap...');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('timeBudgetHours', hours);
    if (file) {
      formData.append('syllabus', file);
    } else {
      formData.append('text', text);
    }

    try {
      const response = await fetch(`${API_URL}/api/roadmap/generate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Unable to generate roadmap');
      }

      setMessage(`Roadmap created with ${data.nodes.length} nodes.`);
      onCreated(data.roadmap);
      setTitle('');
      setText('');
      setFile(null);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-slate-950/10">
      <h2 className="text-xl font-semibold text-slate-100">Generate a roadmap</h2>
      <p className="mt-2 text-sm text-slate-400">Upload a syllabus PDF or paste text to build a personalized learning path.</p>

      <div className="mt-6 grid gap-4">
        <label className="block text-sm text-slate-300">
          Roadmap title
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100"
            placeholder="AI fundamentals roadmap"
            required
          />
        </label>

        <label className="block text-sm text-slate-300">
          Time budget (hours)
          <input
            type="number"
            min="1"
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100"
            required
          />
        </label>

        <label className="block text-sm text-slate-300">
          Optional syllabus text
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="mt-2 h-32 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100"
            placeholder="Paste syllabus text here if you are not uploading a PDF"
          />
        </label>

        <label className="block text-sm text-slate-300">
          Optional syllabus PDF
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100"
          />
        </label>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-slate-600"
        >
          {loading ? 'Generating…' : 'Generate roadmap'}
        </button>
        <p className="text-sm text-slate-400">{message}</p>
      </div>
    </form>
  );
}
