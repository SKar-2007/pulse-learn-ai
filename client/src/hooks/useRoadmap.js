import { useState, useEffect } from 'react';

export default function useRoadmap() {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Placeholder for roadmap fetch logic.
  }, []);

  return { roadmap, setRoadmap, loading, setLoading };
}
