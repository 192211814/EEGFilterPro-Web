import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, Zap, ShieldAlert, Cpu, Folder, ArrowRight, Plus, Loader, Database, Clock, Monitor } from 'lucide-react';
import { listProjects, getSystemStatus, listFiles } from '../api';

export default function DashboardHome() {
    const [userData, setUserData] = useState(null);
    const [recentProjects, setRecentProjects] = useState([]);
    const [recentFiles, setRecentFiles] = useState([]);
    const [systemStatus, setSystemStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filesLoading, setFilesLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setUserData(JSON.parse(userStr));
        }
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const [projectsData, statusData, filesData] = await Promise.all([
                listProjects(token),
                getSystemStatus(token),
                listFiles(token)
            ]);
            setRecentProjects(projectsData.projects.slice(0, 5));
            setSystemStatus(statusData);
            setRecentFiles(filesData.files || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setFilesLoading(false);
        }
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

            {/* Hero Welcome Section */}
            <div className="glass-panel" style={{
                padding: '2.5rem',
                marginBottom: '2rem',
                background: 'linear-gradient(135deg, rgba(108, 92, 231, 0.05), rgba(255, 255, 255, 0.7))',
                border: '1px solid rgba(108, 92, 231, 0.1)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '2.25rem', fontWeight: '700', color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>
                            Welcome back, {userData?.name || 'Researcher'}
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                            Your digital EEG laboratory is active and synchronized.
                        </p>
                    </div>
                    <button
                        className="btn btn-primary"
                        style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}
                        onClick={() => navigate('/dashboard/projects/new')}
                    >
                        <Plus size={22} style={{ marginRight: '0.75rem' }} /> Create New Project
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>

                {/* Left Column: Recent Projects */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="glass-panel">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Clock size={24} color="var(--primary-color)" /> Recent Activity
                            </h3>
                            <Link to="/dashboard/projects" style={{ fontSize: '0.9rem', color: 'var(--primary-color)', fontWeight: 600 }}>See All Projects</Link>
                        </div>

                        {loading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Loader className="animate-spin" /></div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {recentProjects.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '3rem', background: '#F8FAFC', borderRadius: '12px', border: '1px dashed #E2E8F0' }}>
                                        <p style={{ color: 'var(--text-muted)' }}>No projects found. Start by creating your first analysis study.</p>
                                    </div>
                                ) : recentProjects.map(project => (
                                    <div
                                        key={project.id}
                                        onClick={() => navigate(`/dashboard/projects/${project.id}`)}
                                        style={{
                                            padding: '1.25rem', background: 'white', borderRadius: '16px',
                                            cursor: 'pointer', transition: 'var(--transition)', border: '1px solid #E2E8F0',
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.transform = 'translateX(5px)';
                                            e.currentTarget.style.borderColor = 'var(--primary-color)';
                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(108, 92, 231, 0.1)';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.transform = 'translateX(0)';
                                            e.currentTarget.style.borderColor = '#E2E8F0';
                                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ backgroundColor: 'rgba(108, 92, 231, 0.08)', padding: '0.75rem', borderRadius: '10px' }}>
                                                <Folder size={20} color="var(--primary-color)" />
                                            </div>
                                            <div>
                                                <h4 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{project.name}</h4>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                    {project.subject_id ? `Subject: ${project.subject_id}` : 'No subject ID'} • {new Date(project.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <ArrowRight size={18} color="var(--primary-color)" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="glass-panel">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Database size={24} color="var(--primary-color)" /> Files
                            </h3>
                        </div>

                        {filesLoading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Loader className="animate-spin" /></div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {recentFiles.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '3rem', background: '#F8FAFC', borderRadius: '12px', border: '1px dashed #E2E8F0' }}>
                                        <p style={{ color: 'var(--text-muted)' }}>No data files yet.</p>
                                    </div>
                                ) : (
                                    recentFiles.slice(0, 20).map(file => (
                                        <div
                                            key={file.id}
                                            style={{
                                                padding: '1rem', background: 'white', borderRadius: '12px',
                                                border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <Activity size={18} color="var(--primary-color)" />
                                                <div>
                                                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{file.filename}</h4>
                                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                        {file.size_mb} MB • {new Date(file.uploaded_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                className="btn btn-outline"
                                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                                                onClick={() => navigate(`/dashboard/process/${file.id}`)}
                                            >
                                                View Details & Process
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* System Visualizer Call-to-action */}
                    <div className="glass-panel" style={{
                        background: 'linear-gradient(135deg, var(--primary-dark), var(--primary-color))',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2rem'
                    }}>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white', marginBottom: '0.75rem' }}>Digital Signal Viewer</h3>
                            <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '1.5rem' }}>
                                Visualize raw EEG samples across multiple channels with real-time scaling and filter previews.
                            </p>
                            <button
                                className="btn"
                                style={{ backgroundColor: 'white', color: 'var(--primary-dark)' }}
                                onClick={() => navigate('/dashboard/projects')}
                            >
                                <Monitor size={18} style={{ marginRight: '0.5rem' }} /> Open Digital Viewer
                            </button>
                        </div>
                        <div style={{ opacity: 0.2 }}>
                            <Activity size={120} color="white" />
                        </div>
                    </div>
                </div>

                {/* Right Column: System Status */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginLeft: '0.5rem' }}>System Status</h3>

                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '10px' }}>
                                <ShieldAlert size={24} color="#10B981" />
                            </div>
                            <div>
                                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Signal Processing</h4>
                                <p style={{ fontWeight: 700, color: '#10B981' }}>{systemStatus?.processing?.status || 'Operational'}</p>
                            </div>
                        </div>
                        <div style={{ height: '4px', background: '#F1F5F9', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ width: '100%', height: '100%', background: '#10B981' }} />
                        </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{ backgroundColor: 'rgba(108, 92, 231, 0.1)', padding: '0.75rem', borderRadius: '10px' }}>
                                <Database size={24} color="var(--primary-color)" />
                            </div>
                            <div>
                                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Cloud Storage</h4>
                                <p style={{ fontWeight: 700 }}>
                                    {systemStatus?.storage?.used_gb || '0'} GB / {systemStatus?.storage?.total_gb || '5'} GB used
                                </p>
                            </div>
                        </div>
                        <div style={{ height: '4px', background: '#F1F5F9', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ width: `${systemStatus?.storage?.percent || 0}%`, height: '100%', background: 'var(--primary-color)' }} />
                        </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '0.75rem', borderRadius: '10px' }}>
                                <Zap size={24} color="#F59E0B" />
                            </div>
                            <div>
                                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Inference Engine</h4>
                                <p style={{ fontWeight: 700 }}>{systemStatus?.engine?.version || 'v2.4.0'} ({systemStatus?.engine?.status || 'Active'})</p>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', border: '1px dashed var(--primary-light)' }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Need help with signal processing?</p>
                        <button className="btn btn-outline w-full" style={{ padding: '0.5rem' }}>Visit Guide Detail</button>
                    </div>
                </div>

            </div>
        </div>
    );
}
