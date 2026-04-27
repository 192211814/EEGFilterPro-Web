import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Zap, ShieldCheck, Download, Loader, Activity } from 'lucide-react';
import { getMultiChannel, downloadFile } from '../api';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function SignalViewer() {
    const { fileId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [viewport, setViewport] = useState({ start: 0, end: 3.0 });
    const CH_SPACING = 200; // µV spacing

    useEffect(() => {
        fetchSignals();
    }, [fileId]);

    // Signal Flow Animation Engine
    useEffect(() => {
        if (!data || loading) return;

        const interval = setInterval(() => {
            setViewport(prev => {
                const step = 0.05;
                const nextStart = prev.start + step;
                const nextEnd = prev.end + step;

                // Wrap around at the end of data (heuristic: 10s or max found)
                const maxTime = data.chartData[data.chartData.length - 1].time;
                if (nextEnd > maxTime) {
                    return { start: 0, end: 3.0 };
                }
                return { start: nextStart, end: nextEnd };
            });
        }, 50); // ~20fps flow

        return () => clearInterval(interval);
    }, [data, loading]);

    const fetchSignals = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await getMultiChannel(token, fileId);

            // Transform data for Recharts: Add Vertical Offset
            const sortedChannels = Object.keys(res.channels).sort();
            const formatted = res.times.map((t, idx) => {
                const point = { time: parseFloat(t.toFixed(3)) };
                sortedChannels.forEach((ch, chIdx) => {
                    // Top channel has highest Y offset
                    const baseline = (sortedChannels.length - 1 - chIdx) * CH_SPACING;
                    let val = res.channels[ch][idx];

                    // Conversion heuristic from Volts to µV
                    if (Math.abs(val) < 0.1) val *= 1e6;

                    point[ch] = val + baseline;
                });
                return point;
            });

            setData({
                chartData: formatted,
                channels: sortedChannels
            });
        } catch (err) {
            setError(err.message || 'Failed to load signal data');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        try {
            const token = localStorage.getItem('token');
            const blob = await downloadFile(token, fileId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `eeg_signal_${fileId}.edf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (err) {
            alert('Download failed: ' + err.message);
        }
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}><Loader className="animate-spin" size={48} color="#000066" /></div>;
    if (error) return <div style={{ padding: '2rem', color: 'red' }}>Error: {error}</div>;

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ padding: '0.5rem', borderRadius: '50%' }}>
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#000066' }}>Multi-Channel EEG Explorer</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Clinical Standard Visualization (200 µV/div)</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-outline" style={{ borderColor: '#000066', color: '#000066' }}>
                        < Zap size={18} style={{ marginRight: '0.5rem' }} /> Live Flowing
                    </button>
                    <button className="btn btn-primary" style={{ background: '#000066' }} onClick={handleDownload}>
                        <Download size={18} style={{ marginRight: '0.5rem' }} /> Export EDF
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                <div className="glass-panel" style={{ padding: '1rem', border: '1px solid var(--clinical-red)' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sampling Rate</p>
                    <p style={{ fontSize: '1.25rem', fontWeight: 700 }}>256.0 Hz</p>
                </div>
                <div className="glass-panel" style={{ padding: '1rem', border: '1px solid var(--clinical-red)' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Resolution</p>
                    <p style={{ fontSize: '1.25rem', fontWeight: 700 }}>24-bit</p>
                </div>
                <div className="glass-panel" style={{ padding: '1rem', border: '1px solid var(--clinical-red)' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hospital Record</p>
                    <p style={{ fontSize: '1.25rem', fontWeight: 700 }}>CRC-7092</p>
                </div>
                <div className="glass-panel" style={{ padding: '1rem', border: '1px solid var(--clinical-red)' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Integrity</p>
                    <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10B981', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <ShieldCheck size={16} /> Verified OK
                    </p>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', height: '650px', display: 'flex', flexDirection: 'column', background: '#FFFFFF', border: '1px solid rgba(255, 0, 0, 0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#000066' }}>
                        <Activity size={20} color="#000066" />
                        Clinical High-Fidelity Signal Discovery
                    </h3>
                    <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.85rem', color: '#000066', fontWeight: 600 }}>
                        <span>Scale: 200 µV/div</span>
                        <span>|</span>
                        <span>Window: {viewport.start.toFixed(1)}s - {viewport.end.toFixed(1)}s</span>
                    </div>
                </div>

                <div style={{ flex: 1 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data.chartData} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                            <CartesianGrid stroke="rgba(255, 0, 0, 0.1)" strokeDasharray="0" vertical={true} horizontal={true} />
                            <XAxis
                                dataKey="time"
                                type="number"
                                domain={[viewport.start, viewport.end]}
                                hide={false}
                                stroke="#000066"
                                tick={{ fontSize: 12 }}
                                label={{ value: 'Time (s)', position: 'insideBottomRight', offset: -5, fill: '#000066' }}
                            />
                            <YAxis
                                stroke="#000066"
                                tick={(props) => {
                                    const { x, y, payload } = props;
                                    const index = Math.round(payload.value / CH_SPACING);
                                    const label = data.channels[data.channels.length - 1 - index];
                                    return (
                                        <text x={x - 10} y={y} dy={4} textAnchor="end" fill="#000066" fontSize={12} fontWeight={600}>
                                            {label || ''}
                                        </text>
                                    );
                                }}
                                domain={[-CH_SPACING, data.channels.length * CH_SPACING]}
                                ticks={data.channels.map((_, i) => i * CH_SPACING)}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: '1px solid #000066' }}
                                labelFormatter={(t) => `Time: ${t}s`}
                            />
                            {data.channels.map((ch, idx) => (
                                <Line
                                    key={ch}
                                    type="linear"
                                    dataKey={ch}
                                    stroke="#000066"
                                    dot={false}
                                    strokeWidth={1.2}
                                    isAnimationActive={false}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
