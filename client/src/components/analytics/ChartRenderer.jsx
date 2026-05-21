// Dynamic Recharts renderer: maps Gemini's chartType string to the correct Recharts component
import {
    LineChart, BarChart, PieChart, RadarChart, AreaChart,
    Line, Bar, Pie, Radar, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    PolarGrid, PolarAngleAxis, ResponsiveContainer, Cell,
} from 'recharts';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#a855f7'];

// Transform Gemini's generic data format to Recharts' expected format
function transformData(data) {
    return data.map(d => ({
        name: d.label,
        value: d.value,
        secondary: d.secondaryValue,
    }));
}

export default function ChartRenderer({ config }) {
    if (!config || !config.data || config.data.length === 0) {
        return (
            <div className="flex items-center justify-center h-48 text-white/40 text-sm">
                {config?.description || 'No data available for this query.'}
            </div>
        );
    }

    const data = transformData(config.data);
    const color = config.color || '#6366f1';

    const commonProps = {
        data,
        margin: { top: 5, right: 20, left: 0, bottom: 5 },
    };

    const renderChart = () => {
        switch (config.chartType) {
            case 'line':
                return (
                    <LineChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                        <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={{ fill: color }} />
                    </LineChart>
                );

            case 'bar':
                return (
                    <BarChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                        <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                        <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
                    </BarChart>
                );

            case 'horizontalBar':
                return (
                    <BarChart {...commonProps} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                        <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} width={120} />
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                        <Bar dataKey="value" fill={color} radius={[0, 4, 4, 0]} />
                    </BarChart>
                );

            case 'area':
                return (
                    <AreaChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                        <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                        <Area type="monotone" dataKey="value" stroke={color} fill={color} fillOpacity={0.2} />
                    </AreaChart>
                );

            case 'pie':
                return (
                    <PieChart>
                        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                            {data.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                        <Legend />
                    </PieChart>
                );

            case 'radar':
                return (
                    <RadarChart cx="50%" cy="50%" outerRadius={100} data={data}>
                        <PolarGrid stroke="#374151" />
                        <PolarAngleAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                        <Radar name="Score" dataKey="value" stroke={color} fill={color} fillOpacity={0.3} />
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                    </RadarChart>
                );

            default:
                return <p className="text-white/50 text-sm">Unknown chart type: {config.chartType}</p>;
        }
    };

    return (
        <div className="bg-black/90 rounded-2xl p-6 border border-white/10">
            <h3 className="text-white font-semibold mb-1">{config.title}</h3>
            <p className="text-white/50 text-xs mb-6">{config.description}</p>
            <ResponsiveContainer width="100%" height={280}>
                {renderChart()}
            </ResponsiveContainer>
        </div>
    );
}
