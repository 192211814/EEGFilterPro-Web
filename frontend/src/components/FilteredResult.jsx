import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Download, GitCompare, Zap, Info, Loader, Activity } from 'lucide-react';
import { applyFilter, downloadFile } from '../api';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Brush
} from 'recharts';

export default function FilteredResult() {
    const { fileId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // In a real flow, we'd pass the settings or re-apply default notch
        fetchResult();
    }, [fileId]);

    const fetchResult = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            // Default to Notch 50Hz for the summary view
            const res = await applyFilter(token, {
                file_id: parseInt(fileId),
                filter_type: 'notch',
                implementation: 'IIR',
                notch_freq: 50.0,
                order: 4
            });

            const formatted = res.preview.times.map((t, idx) => ({
                time: parseFloat(t.toFixed(3)),
                val: res.preview.data[idx] * 1e6 // uV
            }));

            setData(formatted);
        } catch (err) {
            setError(err.message || 'Failed to process signal');
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
            a.download = `filtered_signal_${fileId}.edf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (err) {
            alert('Download failed');
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
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Filtered Waveform</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Verified noise-free output signal</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-outline" onClick={handleDownload}>
                        <Download size={18} style={{ marginRight: '0.5rem' }} /> Export EDF
                    </button>
                    <button className="btn btn-primary" onClick={() => navigate(`/dashboard/compare/${fileId}`)}>
                        <GitCompare size={18} style={{ marginRight: '0.5rem' }} /> View Comparison
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem', height: '500px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Activity size={20} color="#10B981" /> Clean Signal Trace
                        </h3>
                    </div>

                    <div style={{ flex: 1 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorFilt" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis dataKey="time" hide />
                                <YAxis domain={['auto', 'auto']} label={{ value: 'µV', angle: -90, position: 'insideLeft' }} />
                                <Tooltip />
                                <Area
                                    type="monotone"
                                    dataKey="val"
                                    stroke="#059669"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorFilt)"
                                    isAnimationActive={false}
                                />
                                <Brush dataKey="time" height={30} stroke="#10B981" fill="#F0FDF4" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>FILTER STATUS</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.5rem' }}>
                                <span>Algorithm</span>
                                <span style={{ fontWeight: 600 }}>IIR Butterworth</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.5rem' }}>
                                <span>Target Noise</span>
                                <span style={{ fontWeight: 600 }}>50 Hz (Mains)</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.5rem' }}>
                                <span>Phase Integrity</span>
                                <span style={{ fontWeight: 600, color: '#10B981' }}>Phase-Preserved</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '1.5rem', background: 'var(--primary-dark)', color: 'white', border: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <Zap size={20} color="white" />
                            <h4 style={{ color: 'white' }}>Final Step</h4>
                        </div>
                        <p style={{ fontSize: '0.85rem', marginBottom: '1.5rem', opacity: 0.9 }}>
                            Perform a Side-by-Side comparison to quantify the dB reduction in artifact power.
                        </p>
                        <button className="btn w-full" style={{ background: 'white', color: 'var(--primary-dark)' }} onClick={() => navigate(`/dashboard/compare/${fileId}`)}>
                            Compare Signals
                        </button>
                    </div>

                    <div style={{ padding: '1rem', background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', display: 'flex', gap: '0.75rem' }}>
                        <Info size={18} color="var(--primary-color)" />
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Filtered results are generated using the zero-phase shift forward-backward filtering technique.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
