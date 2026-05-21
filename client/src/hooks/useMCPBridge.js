import { useState, useEffect } from 'react';
import axios from 'axios';
import { apiUrl, authHeaders } from '../lib/apiClient';

export default function useMCPBridge(roadmapId, session) {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!roadmapId || !session?.access_token) return;
    setLoading(true);

    axios.get(apiUrl(`/api/mcp/${roadmapId}`), {
      headers: authHeaders(session.access_token),
    }).then(({ data }) => {
      setConnections(data.connections || []);
    }).catch((error) => {
      console.error('Failed to load MCP connections', error);
    }).finally(() => setLoading(false));
  }, [roadmapId, session]);

  const saveConnection = async (service, connectionConfig) => {
    const { data } = await axios.post(
      apiUrl(`/api/mcp/${roadmapId}`),
      { service, connection_config: connectionConfig },
      { headers: authHeaders(session.access_token) }
    );
    setConnections((prev) => [...prev.filter((c) => c.service !== service), data.connection]);
    return data.connection;
  };

  const removeConnection = async (connectionId) => {
    await axios.delete(apiUrl(`/api/mcp/${connectionId}`), {
      headers: authHeaders(session.access_token),
    });
    setConnections((prev) => prev.filter((c) => c.id !== connectionId));
  };

  return { connections, loading, saveConnection, removeConnection };
}
