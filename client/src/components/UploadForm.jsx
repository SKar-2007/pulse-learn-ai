import { useState } from 'react';
import axios from 'axios';
import { Upload, FileText, Clock, Sparkles, Loader2 } from 'lucide-react';
import {API_BASE} from '../lib/apiClient';

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
        `${API_BASE}/api/roadmap/generate`,
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
    <div className="panel-simple relative overflow-hidden">
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white">
            <Upload size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Generate Skill Tree</h3>
            <p className="text-sm text-white/60">Transform your materials into a learning journey</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/50 uppercase tracking-widest pl-1">Course Material</label>
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
                className="flex items-center gap-3 w-full px-5 py-4 bg-white/5 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-white/20 hover:bg-white/10 transition-all"
              >
                <FileText size={18} className="text-white/70 transition-colors" />
                <span className="text-sm text-white/60 truncate">
                  {file ? file.name : 'Select PDF or Text file'}
                </span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-white/50 uppercase tracking-widest pl-1">Study Hours</label>
            <div className="relative">
              <Clock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/50" />
              <input
                type="number"
                min="1"
                max="200"
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                className="w-full pl-12 pr-5 py-4 input-minimal"
              />
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-white/80 bg-white/5 p-4 rounded-xl border border-white/10">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full btn-minimal flex items-center justify-center gap-2 disabled:opacity-50"
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