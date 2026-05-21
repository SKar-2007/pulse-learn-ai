import { useState } from 'react';
import axios from 'axios';
import { Upload, FileText, Clock, Sparkles, Loader2 } from 'lucide-react';

export default function UploadForm({ token, onRoadmapGenerated }) {
  const [file, setFile] = useState(null);
  const [hours, setHours] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    if (!file) {
      setError('Please select a syllabus file.');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('syllabus', file);
    formData.append('timeBudgetHours', hours);
    formData.append('title', file.name.split('.')[0]);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/roadmap/generate`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      onRoadmapGenerated();
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <Sparkles size={120} className="text-indigo-500" />
      </div>

      <div className="relative z-10 space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center">
            <Upload size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Generate Skill Tree</h3>
            <p className="text-sm text-gray-500">Transform your materials into a learning journey</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Course Material</label>
            <div className="relative">
              <input
                type="file"
                accept=".pdf,.txt"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="flex items-center gap-3 w-full px-5 py-4 bg-gray-950 border-2 border-dashed border-gray-800 rounded-2xl cursor-pointer hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group/label"
              >
                <FileText size={18} className="text-gray-500 group-hover/label:text-indigo-400 transition-colors" />
                <span className="text-sm text-gray-400 truncate">
                  {file ? file.name : 'Select PDF or Text file'}
                </span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Study Hours</label>
            <div className="relative">
              <Clock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="number"
                min="1"
                max="200"
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                className="w-full pl-12 pr-5 py-4 bg-gray-950 border border-gray-800 rounded-2xl text-sm text-white focus:border-indigo-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {error && <p className="text-red-400 text-xs font-medium bg-red-400/10 p-4 rounded-xl border border-red-400/20">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg shadow-indigo-900/40 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          {loading ? (
            <><Loader2 size={18} className="animate-spin" /> Analyzing Content...</>
          ) : (
            <><Sparkles size={18} /> Initialize Learning Path</>
          )}
        </button>
      </div>
    </div>
  );
}
