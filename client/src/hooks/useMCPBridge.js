import { useState, useEffect } from 'react';
import axios from 'axios';

export default function useMCPBridge(roadmapId, session) {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!roadmapId || !session?.access_token) return;
    setLoading(true);

    axios.get(`${import.meta.env.VITE_API_URL?.replace(/\/\$/, '') || ''}/api/mcp/${roadmapId}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    }).then(({ data }) => {
      setConnections(data.connections || []);
    }).catch((error) => {
      console.error('Failed to load MCP connections', error);
    }).finally(() => setLoading(false));
  }, [roadmapId, session]);

  const saveConnection = async (service, connectionConfig) => {
    const { data } = await axios.post(
      `${import.meta.env.VITE_API_URL?.replace(/\/\$/, '') || ''}/api/mcp/${roadmapId}`,
      { service, connection_config: connectionConfig },
      { headers: { Authorization: `Bearer ${session.access_token}` } }
    );
    setConnections((prev) => [...prev.filter((c) => c.service !== service), data.connection]);
    return data.connection;
  };

  const removeConnection = async (connectionId) => {
    await axios.delete(`${import.meta.env.VITE_API_URL?.replace(/\/\$/, '') || ''}/api/mcp/${connectionId}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    setConnections((prev) => prev.filter((c) => c.id !== connectionId));
  };

  return { connections, loading, saveConnection, removeConnection };
}
