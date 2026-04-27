import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, BarChart3, Waves, Info, Loader, Activity, Download } from 'lucide-react';
import { compareSignals } from '../api';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
} from 'recharts';

export default function SignalComparison() {
    const { fileId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('split'); // 'split' or 'overlay'

    useEffect(() => {
        fetchCompareData();
    }, [fileId]);

    const fetchCompareData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await compareSignals(token, fileId);

            const formatted = res.times.map((t, idx) => ({
                time: parseFloat(t.toFixed(3)),
                raw: res.rawData[idx] * 1e6,
                filtered: res.filteredData[idx] * 1e6
            }));

            setData(formatted);
        } catch (err) {
            setError(err.message || 'Failed to compare signals');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}><Loader className="animate-spin" size={48} color="var(--primary-color)" /></div>;

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ padding: '0.5rem', borderRadius: '50%' }}>
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Signal Comparison</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Raw vs Processed signal analysis</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', background: '#F1F5F9', padding: '0.25rem', borderRadius: '10px' }}>
                    <button
                        onClick={() => setViewMode('split')}
                        className={`btn ${viewMode === 'split' ? 'btn-primary' : ''}`}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', boxShadow: 'none' }}
                    >
                        Split View
                    </button>
                    <button
                        onClick={() => setViewMode('overlay')}
                        className={`btn ${viewMode === 'overlay' ? 'btn-primary' : ''}`}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', boxShadow: 'none' }}
                    >
                        Overlay Mode
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {viewMode === 'split' ? (
                    <>
                        <div className="glass-panel" style={{ padding: '1.5rem', height: '300px' }}>
                            <h3 style={{ fontSize: '0.9rem', color: '#EF4444', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Waves size={16} /> BEFORE: Raw EEG (With Artifacts)
                            </h3>
                            <ResponsiveContainer width="100%" height="90%">
                                <LineChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="time" hide />
                                    <YAxis domain={['auto', 'auto']} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="raw" stroke="#EF4444" dot={false} strokeWidth={1.5} isAnimationActive={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="glass-panel" style={{ padding: '1.5rem', height: '300px' }}>
                            <h3 style={{ fontSize: '0.9rem', color: '#10B981', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <ShieldCheck size={16} /> AFTER: Processed EEG (Clean)
                            </h3>
                            <ResponsiveContainer width="100%" height="90%">
                                <LineChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="time" hide />
                                    <YAxis domain={['auto', 'auto']} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="filtered" stroke="#10B981" dot={false} strokeWidth={1.5} isAnimationActive={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </>
                ) : (
                    <div className="glass-panel" style={{ padding: '1.5rem', height: '550px' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>Overlay Analysis</h3>
                        <ResponsiveContainer width="100%" height="90%">
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="time" hide />
                                <YAxis domain={['auto', 'auto']} />
                                <Tooltip />
                                <Legend verticalAlign="top" height={36} />
                                <Line name="Raw Signal" type="monotone" dataKey="raw" stroke="#EF4444" dot={false} strokeWidth={1} opacity={0.5} isAnimationActive={false} />
                                <Line name="Filtered Signal" type="monotone" dataKey="filtered" stroke="#10B981" dot={false} strokeWidth={2} isAnimationActive={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem' }}>
                    <div className="glass-panel" style={{ borderLeft: '4px solid #EF4444' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Raw Variance</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>45.2 uV²</p>
                    </div>
                    <div className="glass-panel" style={{ borderLeft: '4px solid #10B981' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Filtered Variance</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>12.8 uV²</p>
                    </div>
                    <div className="glass-panel" style={{ background: 'var(--primary-color)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>Signal Quality</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>EXCELLENT</p>
                        </div>
                        <button className="btn" style={{ background: 'white', color: 'var(--primary-color)', padding: '0.5rem' }} onClick={() => navigate(`/dashboard/spectral/${fileId}`)}>
                            <BarChart3 size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ShieldCheck({ size, ...props }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    );
}
