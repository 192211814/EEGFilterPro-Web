import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Filter, Zap, Activity, BarChart3, Save, Download, Loader } from 'lucide-react';
import { applyFilter, getFFT, downloadFile } from '../api';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts';

export default function Analysis() {
    const { fileId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);

    const [filterParams, setFilterParams] = useState({
        file_id: parseInt(fileId),
        filter_type: 'notch',
        implementation: 'IIR',
        l_freq: 1.0,
        h_freq: 30.0,
        notch_freq: 50.0,
        order: 4
    });

    const [results, setResults] = useState(null);
    const [fftData, setFftData] = useState(null);

    const handleApplyFilter = async () => {
        setProcessing(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const res = await applyFilter(token, filterParams);

            const chartData = res.preview.times.map((t, idx) => ({
                time: parseFloat(t.toFixed(3)),
                value: res.preview.data[idx]
            }));

            const freqData = res.preview.freq_response.freqs.map((f, idx) => ({
                freq: parseFloat(f.toFixed(1)),
                magnitude: res.preview.freq_response.magnitude[idx]
            }));

            // navigate to result screen
            navigate(`/dashboard/result/${fileId}`);

        } catch (err) {
            setError(err.message || 'Processing failed');
        } finally {
            setProcessing(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilterParams(prev => ({
            ...prev,
            [name]: name === 'filter_type' || name === 'implementation' ? value : parseFloat(value)
        }));
    };

    const handleDownloadFiltered = async () => {
        try {
            const token = localStorage.getItem('token');
            const blob = await downloadFile(token, fileId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `filtered_eeg_${fileId}.edf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (err) {
            alert('Download failed: ' + err.message);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ padding: '0.5rem', borderRadius: '50%' }}>
                    <ChevronLeft size={20} />
                </button>
                <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Signal Processing Pipeline</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Configure and apply digital filters to your EEG data</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                {/* Controls */}
                <div className="glass-panel" style={{ height: 'fit-content' }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Filter size={20} color="var(--primary-color)" /> Filter Settings
                    </h3>

                    <div className="form-group">
                        <label className="form-label">Filter Type</label>
                        <select name="filter_type" value={filterParams.filter_type} onChange={handleChange} className="form-control">
                            <Option value="notch">Notch Filter (Power Line)</Option>
                            <Option value="bandpass">Bandpass Filter</Option>
                            <Option value="highpass">Highpass Filter</Option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Implementation</label>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <label style={{ flex: 1, cursor: 'pointer' }}>
                                <input type="radio" name="implementation" value="IIR" checked={filterParams.implementation === 'IIR'} onChange={handleChange} />
                                <span style={{ marginLeft: '0.5rem' }}>IIR (Butterworth)</span>
                            </label>
                            <label style={{ flex: 1, cursor: 'pointer' }}>
                                <input type="radio" name="implementation" value="FIR" checked={filterParams.implementation === 'FIR'} onChange={handleChange} />
                                <span style={{ marginLeft: '0.5rem' }}>FIR (Window)</span>
                            </label>
                        </div>
                    </div>

                    {filterParams.filter_type === 'notch' ? (
                        <div className="form-group">
                            <label className="form-label">Notch Frequency (Hz)</label>
                            <input type="number" name="notch_freq" value={filterParams.notch_freq} onChange={handleChange} className="form-control" />
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">Low (Hz)</label>
                                <input type="number" name="l_freq" value={filterParams.l_freq} onChange={handleChange} className="form-control" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">High (Hz)</label>
                                <input type="number" name="h_freq" value={filterParams.h_freq} onChange={handleChange} className="form-control" />
                            </div>
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Filter Order</label>
                        <input type="range" name="order" min="1" max="8" value={filterParams.order} onChange={handleChange} style={{ width: '100%', accentColor: 'var(--primary-color)' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <span>1</span> <span>{filterParams.order}</span> <span>8</span>
                        </div>
                    </div>

                    <button
                        className="btn btn-primary w-full"
                        style={{ marginTop: '1rem' }}
                        onClick={handleApplyFilter}
                        disabled={processing}
                    >
                        {processing ? <Loader className="animate-spin" size={20} /> : <><Zap size={18} style={{ marginRight: '0.5rem' }} /> Process Signal</>}
                    </button>
                </div>

                {/* Results */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {error && <div className="glass-panel" style={{ background: '#FEE2E2', color: '#DC2626' }}>{error}</div>}

                    {!results ? (
                        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem', opacity: 0.6 }}>
                            <Activity size={64} style={{ marginBottom: '1.5rem' }} />
                            <h3>Ready to Process</h3>
                            <p>Configure the filter on the left and click "Process Signal" to see results.</p>
                        </div>
                    ) : (
                        <>
                            <div className="glass-panel">
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                    <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Activity size={18} color="var(--primary-color)" /> Filtered Preview</h3>
                                    <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={handleDownloadFiltered}>
                                        <Download size={14} style={{ marginRight: '0.4rem' }} /> Export Filtered (.edf)
                                    </button>
                                </div>
                                <div style={{ height: '250px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={results.chartData}>
                                            <defs>
                                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="time" hide />
                                            <YAxis hide domain={['auto', 'auto']} />
                                            <Tooltip />
                                            <Area type="monotone" dataKey="value" stroke="var(--primary-color)" fillOpacity={1} fill="url(#colorValue)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                <div className="glass-panel">
                                    <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Filter size={16} /> Frequency Response</h3>
                                    <div style={{ height: '200px' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={results.freqData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="freq" label={{ value: 'Hz', position: 'insideBottomRight', offset: -5 }} />
                                                <YAxis label={{ value: 'dB', angle: -90, position: 'insideLeft' }} />
                                                <Tooltip />
                                                <Line type="stepAfter" dataKey="magnitude" stroke="#10B981" dot={false} strokeWidth={2} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="glass-panel">
                                    <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><BarChart3 size={16} /> Power Spectrum (FFT)</h3>
                                    <div style={{ height: '200px' }}>
                                        {fftData ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={fftData}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="freq" label={{ value: 'Hz', position: 'insideBottomRight', offset: -5 }} />
                                                    <YAxis hide />
                                                    <Tooltip />
                                                    <Area type="monotone" dataKey="power" stroke="#F59E0B" fill="#F59E0B33" dot={false} />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                                Calculating FFT...
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function Option({ children, value }) {
    return <option value={value}>{children}</option>;
}
