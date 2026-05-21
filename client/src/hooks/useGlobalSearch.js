import { useState, useEffect } from 'react';
import axios from 'axios';

export default function useGlobalSearch(session, query) {
  const [results, setResults] = useState({ pages: [], nodes: [], notes: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults({ pages: [], nodes: [], notes: [] });
      return;
    }

    let active = true;
    setLoading(true);

    axios.get(`${import.meta.env.VITE_API_URL?.replace(/\/\$/, '') || ''}/api/search?q=${encodeURIComponent(query)}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    }).then(({ data }) => {
      if (active) {
        setResults(data.results || { pages: [], nodes: [], notes: [] });
      }
    }).catch((err) => {
      console.error('Search failed', err);
    }).finally(() => {
      if (active) setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [query, session]);

  return { results, loading };
}
