// Analytics dashboard: NL query bar + chart grid + preset quick queries
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart2, Loader2 } from 'lucide-react';
import axios from 'axios';
import ChartRenderer from './ChartRenderer';
import { useAuth } from '../../hooks/useAuth';
import {API_BASE} from '../../lib/apiClient';

const PRESET_QUERIES = [
    'Show my quiz scores over time as a line chart',
    'Compare my scores across all roadmaps as a bar chart',
    'Which nodes did I spend the most time on? Show horizontal bars',
    'Show my node completion status breakdown as a pie chart',
];

export default function AnalyticsDashboard() {
    const { session } = useAuth();
    const [query, setQuery] = useState('');
    const [charts, setCharts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const runQuery = async (q) => {
        const activeQuery = q || query;
        if (!activeQuery.trim()) return;
        setLoading(true);
        setError(null);

        try {
            const { data } = await axios.post(
                `${API_BASE}/api/analytics/query`,
                { query: activeQuery },
                { headers: { Authorization: `Bearer ${session.access_token}` } }
            );
            // Prepend new charts at the top
            setCharts(prev => [{ ...data.chart, query: activeQuery }, ...prev]);
            setQuery('');
        } catch (err) {
            setError(err.response?.data?.error || 'Query failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
                <BarChart2 className="text-white/60 w-6 h-6" />
                <h2 className="text-2xl font-bold text-white">Learning Analytics</h2>
            </div>

            {/* NL Query Bar */}
            <div className="flex gap-3 mb-6">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && runQuery()}
                    placeholder='Ask anything... e.g. "Show my progress as a line chart"'
                    className="flex-1 px-5 py-3 bg-black/90 text-white rounded-xl border border-white/10 focus:border-white/10 outline-none placeholder-white/30"
                />
                <button
                    onClick={() => runQuery()}
                    disabled={loading}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-50 
            text-white font-medium rounded-xl transition-all flex items-center gap-2"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate'}
                </button>
            </div>

            {/* Preset quick queries */}
            <div className="flex flex-wrap gap-2 mb-8">
                {PRESET_QUERIES.map((q) => (
                    <button
                        key={q}
                        onClick={() => runQuery(q)}
                        className="text-xs px-3 py-1.5 bg-black/90 hover:bg-white/10 text-white/60 rounded-full border border-white/10 transition-all"
                    >
                        {q}
                    </button>
                ))}
            </div>

            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

            {/* Chart grid */}
            <AnimatePresence>
                {charts.map((chart, i) => (
                    <motion.div
                        key={`${chart.query}-${i}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6"
                    >
                        <p className="text-white/40 text-xs mb-2 italic">"{chart.query}"</p>
                        <ChartRenderer config={chart} />
                    </motion.div>
                ))}
            </AnimatePresence>

            {charts.length === 0 && !loading && (
                <div className="text-center py-20 text-white/50">
                    <BarChart2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>Ask a question above to visualize your learning data.</p>
                </div>
            )}
        </div>
    );
}