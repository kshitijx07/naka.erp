import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#0f172a', '#334155', '#64748b', '#94a3b8', '#cbd5e1'];

const DynamicRenderer = ({ config }) => {
    if (!config || !config.type) return null;

    try {
        // Render Bar Chart
        if (config.type === 'bar-chart' && config.data) {
            return (
                <div className="dynamic-renderer-container" style={{ width: '100%', height: 250, padding: 10 }}>
                    <h4 style={{ textAlign: 'center', marginBottom: 10, fontSize: '0.9rem', color: '#1e293b' }}>
                        {config.title || 'Chart Data'}
                    </h4>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={config.data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey={config.xAxisKey || 'name'} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                            />
                            {config.series ? (
                                config.series.map((s, idx) => (
                                    <Bar key={s.dataKey} dataKey={s.dataKey} name={s.name || s.dataKey} fill={COLORS[idx % COLORS.length]} radius={[4, 4, 0, 0]} />
                                ))
                            ) : (
                                <Bar dataKey={config.yAxisKey || 'value'} fill="#0f172a" radius={[4, 4, 0, 0]} />
                            )}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            );
        }

        // Render Table
        if (config.type === 'table' && config.data && config.columns) {
            return (
                <div className="dynamic-renderer-container" style={{ overflowX: 'auto', fontSize: '0.85rem' }}>
                    {config.title && (
                        <div style={{ padding: '8px 12px', fontWeight: 600, borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                            {config.title}
                        </div>
                    )}
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                                {config.columns.map((col, i) => (
                                    <th key={i} style={{ padding: '8px 12px', color: '#64748b', fontWeight: 500 }}>{col.header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {config.data.map((row, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    {config.columns.map((col, j) => (
                                        <td key={j} style={{ padding: '8px 12px', color: '#1e293b' }}>{row[col.key]}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }

    } catch (error) {
        console.error("Dynamic rendering failed:", error);
        return <div style={{ color: 'red', fontSize: '12px' }}>Failed to render visual data.</div>;
    }

    return null;
};

export default DynamicRenderer;
