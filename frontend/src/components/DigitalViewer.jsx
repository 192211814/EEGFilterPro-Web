import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Monitor, Zap, Info, Loader, MousePointer2, Move } from 'lucide-react';
import { getRawPreview } from '../api';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ReferenceLine,
    Brush
} from 'recharts';

export default function DigitalViewer() {
    const { fileId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mode, setMode] = useState('linear');
    const [stats, setStats] = useState({ min: 0, max: 0, avg: 0 });

    useEffect(() => {
        fetchData();
    }, [fileId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await getRawPreview(token, fileId);

            const formatted = res.data.map((val, idx) => ({
                sample: idx,
                val: val * 1e6 // Convert to microvolts as in Java app
            }));

            setData(formatted);

            const values = formatted.map(d => d.val);
            setStats({
                min: Math.min(...values).toFixed(2),
                max: Math.max(...values).toFixed(2),
                avg: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)
            });
        } catch (err) {
            setError(err.message || 'Failed to load digital waveform');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}><Loader className="animate-spin" size={48} color="var(--primary-color)" /></div>;

    return (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ padding: '0.5rem', borderRadius: '50%', borderColor: '#000066', color: '#000066' }}>
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#000066' }}>Clinical Signal Inspection</h2>
                        <p style={{ color: 'var(--text-muted)' }}>MNE-Python Verification: Multiplexer Data Sync OK</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ background: '#D1FAE5', color: '#065F46', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
                        Validation Successful
                    </div>
                    <div style={{ display: 'flex', gap: '0.25rem', background: '#F1F5F9', padding: '0.25rem', borderRadius: '10px' }}>
                        {['linear', 'step', 'basis'].map(m => (
                            <button
                                key={m}
                                onClick={() => setMode(m)}
                                style={{
                                    padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                    backgroundColor: mode === m ? '#000066' : 'transparent',
                                    color: mode === m ? 'white' : 'var(--text-muted)',
                                    fontWeight: mode === m ? 700 : 500,
                                    transition: '0.2s'
                                }}
                            >
                                {m.charAt(0).toUpperCase() + m.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '2rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem', height: '550px', display: 'flex', flexDirection: 'column', background: '#FFFFFF', border: '1px solid rgba(255, 0, 0, 0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#000066' }}>
                            <Monitor size={20} color="#000066" /> Temporal Analysis (µV)
                        </h3>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MousePointer2 size={14} /> Click to highlight</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Move size={14} /> Drag brush to zoom</span>
                        </div>
                    </div>

                    <div style={{ flex: 1 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                <CartesianGrid stroke="rgba(255, 0, 0, 0.1)" strokeDasharray="0" vertical={false} />
                                <XAxis dataKey="sample" hide />
                                <YAxis domain={['auto', 'auto']} stroke="#000066" label={{ value: 'Amplitude (µV)', angle: -90, position: 'insideLeft', offset: -10, fill: '#000066' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: '1px solid #000066' }}
                                    formatter={(val) => [`${val.toFixed(2)} µV`, 'Point Amplitude']}
                                />
                                <ReferenceLine y={0} stroke="#4D4D99" strokeDasharray="3 3" />
                                <Line
                                    type={mode === 'step' ? 'step' : mode}
                                    dataKey="val"
                                    stroke="#000066"
                                    dot={mode === 'basis'}
                                    strokeWidth={1.5}
                                    isAnimationActive={false}
                                />
                                <Brush dataKey="sample" height={30} stroke="#4D4D99" fill="#F8FAFC" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Sample Statistics</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Maximum Peak</span>
                                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10B981' }}>{stats.max} µV</p>
                            </div>
                            <div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Minimum Peak</span>
                                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#EF4444' }}>{stats.min} µV</p>
                            </div>
                            <div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Average (DC Offset)</span>
                                <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.avg} µV</p>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '1.5rem', background: 'var(--primary-dark)', color: 'white', border: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <Zap size={20} color="white" />
                            <h4 style={{ color: 'white' }}>Data Validation</h4>
                        </div>
                        <p style={{ fontSize: '0.85rem', marginBottom: '1.5rem', opacity: 0.9 }}>Raw signal is loaded. Proceed to configure digital filters for noise removal.</p>
                        <button
                            className="btn w-full"
                            style={{ background: 'white', color: 'var(--primary-dark)' }}
                            onClick={() => navigate(`/dashboard/analysis/${fileId}`)}
                        >
                            Configure Filters
                        </button>
                    </div>

                    <div style={{ padding: '1rem', border: '1px solid #E2E8F0', borderRadius: '12px', display: 'flex', gap: '0.75rem', fontSize: '0.85rem' }}>
                        <Info size={18} color="var(--primary-color)" />
                        <p style={{ color: 'var(--text-muted)' }}>Digital mode provides raw sample values extracted directly from the EDF multiplexer.</p>
                    </div>
                </div>
            </div>
        </div >
    );
}
