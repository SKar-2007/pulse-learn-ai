import UploadForm from './components/UploadForm.jsx';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="mx-auto max-w-4xl rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl shadow-slate-900/30">
        <h1 className="text-4xl font-semibold text-indigo-300">Pulse Learn AI</h1>
        <p className="mt-3 text-slate-400">Upload a syllabus and generate a personalized learning roadmap with active recall workflows.</p>
        <UploadForm />
      </div>
    </div>
  );
}
