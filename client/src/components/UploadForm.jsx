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
    <form onSubmit={handleSubmit} className="app-card">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-100">Generate a roadmap</h2>
          <p className="mt-2 text-sm text-slate-400">Upload a syllabus PDF or paste text to create a structured learning path.</p>
        </div>
        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-400">Minimal</span>
      </div>

      <div className="mt-6 grid gap-4">
        <label className="block text-sm text-slate-300">
          Roadmap title
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-base"
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
            className="input-base"
            required
          />
        </label>

        <label className="block text-sm text-slate-300">
          Optional syllabus text
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="textarea-base"
            placeholder="Paste syllabus text here if you are not uploading a PDF"
            rows="5"
          />
        </label>

        <label className="block text-sm text-slate-300">
          Optional syllabus PDF
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="input-base"
          />
        </label>
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Generating…' : 'Generate roadmap'}
        </button>
        <p className="text-sm text-slate-400">{message}</p>
      </div>
    </form>
  );
}
