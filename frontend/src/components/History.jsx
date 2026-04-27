import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, FileText, Search, ChevronRight } from 'lucide-react';
import { listFiles } from '../api';

export default function History() {
    const navigate = useNavigate();
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }
                const data = await listFiles(token);
                setFiles(data.files || []);
            } catch (err) {
                console.error('Failed to load history:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [navigate]);

    const filteredFiles = files.filter(f =>
        f.filename?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="animate-fade-in" style={{ padding: '0 1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-dark)' }}>Session History</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Access your previously processed and raw EEG files.</p>
                </div>
                <div style={{ position: 'relative', width: '300px' }}>
                    <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="text"
                        placeholder="Search files..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="form-control"
                        style={{ paddingLeft: '2.5rem', borderRadius: '100px' }}
                    />
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                    <div className="animate-spin" style={{ width: '40px', height: '40px', border: '3px solid #E2E8F0', borderTopColor: 'var(--primary-color)', borderRadius: '50%', margin: '0 auto 1rem' }} />
                    <p style={{ color: 'var(--text-muted)' }}>Loading history records...</p>
                </div>
            ) : filteredFiles.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <div style={{ background: '#F1F5F9', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                        <Clock size={32} color="var(--text-muted)" />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No History Found</h3>
                    <p style={{ color: 'var(--text-muted)' }}>You haven't uploaded or processed any EEG files yet.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {filteredFiles.map(file => {
                        // Dynamically replace .edf with .report to match mobile app UI
                        let displayFileName = file.filename || 'EEG_Recording.edf';
                        displayFileName = displayFileName.replace(/\.edf$/i, '.report');

                        const dateStr = file.uploaded_at ? file.uploaded_at.substring(0, 10) : 'Unknown Date';

                        return (
                            <div
                                key={file.id}
                                className="glass-panel"
                                style={{
                                    padding: '1.5rem',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '1rem'
                                }}
                                onClick={() => navigate(`/dashboard/process/${file.id}?history=true`)}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                    <div style={{ background: 'rgba(108, 92, 231, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
                                        <FileText size={24} color="var(--primary-color)" />
                                    </div>
                                    <div style={{ flex: 1, overflow: 'hidden' }}>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '0.25rem' }}>
                                            {displayFileName}
                                        </h3>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {dateStr}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #F1F5F9' }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                        Size: {file.size_mb} MB
                                    </span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary-color)', fontSize: '0.85rem', fontWeight: 600 }}>
                                        View Report <ChevronRight size={16} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
