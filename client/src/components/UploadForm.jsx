import { useState } from 'react';
import axios from 'axios';

export default function UploadForm() {
  const [title, setTitle] = useState('');
  const [hours, setHours] = useState(10);
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('Generating roadmap...');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('timeBudgetHours', hours);
    formData.append('userId', '00000000-0000-0000-0000-000000000000');
    formData.append('text', 'Sample syllabus text for initial proof of concept.');

    try {
      const result = await axios.post('http://localhost:3001/api/roadmap/generate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage(`Roadmap created with ${result.data.nodes.length} nodes.`);
    } catch (error) {
      setMessage(error?.response?.data?.error || error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6 rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm text-slate-300">
          Roadmap Title
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100"
            placeholder="AI fundamentals"
          />
        </label>

        <label className="block text-sm text-slate-300">
          Time Budget (hours)
          <input
            type="number"
            min="1"
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100"
          />
        </label>
      </div>

      <button type="submit" className="inline-flex items-center justify-center rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400">
        Create Roadmap
      </button>

      <p className="text-sm text-slate-400">{message}</p>
    </form>
  );
}
