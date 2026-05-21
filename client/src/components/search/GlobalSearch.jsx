import { useState, useEffect } from 'react';
import axios from 'axios';
import SearchResults from './SearchResults';
import {API_BASE} from '../../lib/apiClient';

export default function GlobalSearch({ session, onNavigate }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ pages: [], nodes: [], notes: [] });
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (!open || query.length < 2) {
      setResults({ pages: [], nodes: [], notes: [] });
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const { data } = await axios.get(
          `${API_BASE}/api/search?q=${encodeURIComponent(query)}`,
          { headers: { Authorization: `Bearer ${session.access_token}` } }
        );
        setResults(data.results || { pages: [], nodes: [], notes: [] });
      } catch (error) {
        console.error('Search failed', error);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [open, query, session]);

  return (
    <div>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-6">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-black/95/95 shadow-2xl backdrop-blur-xl">
            <div className="p-5 border-b border-white/10">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pages, nodes, notes..."
                className="w-full rounded-2xl border border-white/10 bg-black/90 px-4 py-3 text-sm text-white outline-none focus:border-white/10"
              />
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-4">
              <SearchResults
                results={results}
                onNavigate={onNavigate}
                selectedIndex={selectedIndex}
                setSelectedIndex={setSelectedIndex}
              />
            </div>
          </div>
          <button className="absolute right-8 top-8 text-white/50 hover:text-white" onClick={() => setOpen(false)}>
            Close
          </button>
        </div>
      )}
    </div>
  );
}