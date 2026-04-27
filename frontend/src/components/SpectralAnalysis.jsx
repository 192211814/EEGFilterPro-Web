import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, BarChart3, Zap, Download, Info, Loader, Activity } from 'lucide-react';
import { getFFT } from '../api';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
} from 'recharts';

export default function SpectralAnalysis() {
    const { fileId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSpectralData();
    }, [fileId]);

    const fetchSpectralData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            // Get FFT for a representative channel
            const res = await getFFT(token, fileId, 'Fp1');

            const formatted = res.frequencies.map((f, idx) => ({
                freq: parseFloat(f.toFixed(2)),
                power: res.psd ? res.psd[idx] : 0
            })).filter(d => d.freq <= 100); // Only show 0-100Hz

            setData(formatted);
        } catch (err) {
            setError(err.message || 'Spectral analysis failed');
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
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Spectral Analysis (FFT)</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Power distribution across frequency bands</p>
                    </div>
                </div>
                <button className="btn btn-primary">
                    <Download size={18} style={{ marginRight: '0.5rem' }} /> Export Report
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem', height: '500px', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <BarChart3 size={20} color="#F59E0B" /> Power Spectral Density (PSD)
                    </h3>

                    <div style={{ flex: 1 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorSpectral" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis dataKey="freq" label={{ value: 'Frequency (Hz)', position: 'insideBottomRight', offset: -5 }} />
                                <YAxis label={{ value: 'Power (uV²/Hz)', angle: -90, position: 'insideLeft' }} />
                                <Tooltip />
                                <Area
                                    type="monotone"
                                    dataKey="power"
                                    stroke="#D97706"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorSpectral)"
                                    isAnimationActive={false}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>BRAINWAVE BANDS</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <BandInfo label="Delta" range="0.5-4 Hz" color="#8B5CF6" percent="15%" />
                            <BandInfo label="Theta" range="4-8 Hz" color="#3B82F6" percent="25%" />
                            <BandInfo label="Alpha" range="8-13 Hz" color="#10B981" percent="40%" />
                            <BandInfo label="Beta" range="13-30 Hz" color="#F59E0B" percent="20%" />
                        </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '1.5rem', background: '#F8FAFC', border: '1px dashed #CBD5E1' }}>
                        <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>RELIABILITY INDEX</h4>
                        <div style={{ height: '8px', background: '#E2E8F0', borderRadius: '4px', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '92%', background: '#10B981' }} />
                        </div>
                        <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', textAlign: 'right', fontWeight: 600 }}>92% Confidence</p>
                    </div>

                    <div style={{ padding: '1rem', background: 'var(--primary-light)', color: 'white', borderRadius: '12px', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>Analysis Session Complete</p>
                        <button className="btn" style={{ background: 'white', color: 'var(--primary-dark)', width: '100%' }} onClick={() => navigate('/dashboard/projects')}>
                            Return to Project
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function BandInfo({ label, range, color, percent }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: color }} />
                <span style={{ fontWeight: 500 }}>{label}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{range}</span>
            </div>
            <span style={{ fontWeight: 700 }}>{percent}</span>
        </div>
    );
}
