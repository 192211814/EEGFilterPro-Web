import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, FileText, Upload, Filter, BarChart3, Clock, Database, Loader } from 'lucide-react';
import { listProjects, listFiles, uploadFile } from '../api';

export default function ProjectDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProjectData();
    }, [id]);

    const fetchProjectData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const projectsData = await listProjects(token);
            const currentProject = projectsData.projects.find(p => p.id === parseInt(id));

            if (!currentProject) throw new Error('Project not found');

            setProject(currentProject);

            const filesData = await listFiles(token, id);
            setFiles(filesData.files);
        } catch (err) {
            setError(err.message || 'Failed to load project details');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        if (!e.target.files?.[0]) return;

        setUploading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await uploadFile(token, id, e.target.files[0]);

            // Navigate to the Unified EEG Processing Dashboard
            if (res && res.file_id) {
                navigate(`/dashboard/process/${res.file_id}`);
            } else {
                // Refresh files list as fallback
                const filesData = await listFiles(token, id);
                setFiles(filesData.files);
            }
        } catch (err) {
            alert(err.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}><Loader className="animate-spin" size={48} color="var(--primary-color)" /></div>;
    }

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    onClick={() => navigate('/dashboard/projects')}
                    style={{ padding: '0.5rem', borderRadius: '50%', background: 'white', border: '1px solid #E2E8F0', cursor: 'pointer', display: 'flex' }}
                >
                    <ChevronLeft size={24} color="var(--text-main)" />
                </button>
                <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '700' }}>{project?.name}</h2>
                    <p style={{ color: 'var(--text-muted)' }}>{project?.description || 'Project details and signal overview'}</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                {/* Files List */}
                <div className="glass-panel">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Database size={20} color="var(--primary-color)" />
                            Uploaded EEG Files
                        </h3>
                        <label className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                            {uploading ? 'Uploading...' : <><Upload size={16} style={{ marginRight: '0.5rem' }} /> Add File</>}
                            <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} disabled={uploading} />
                        </label>
                    </div>

                    {files.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                            <FileText size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                            <p>No files uploaded to this project yet.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {files.map(file => (
                                <div
                                    key={file.id}
                                    className="file-card"
                                    style={{
                                        display: 'flex', alignItems: 'center', padding: '1rem',
                                        background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0',
                                        transition: 'var(--transition)'
                                    }}
                                >
                                    <div style={{ backgroundColor: '#fff', padding: '0.75rem', borderRadius: '8px', marginRight: '1rem' }}>
                                        <FileText size={24} color="var(--primary-light)" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{file.filename}</h4>
                                        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                <Clock size={12} /> {new Date(file.uploaded_at).toLocaleDateString()}
                                            </span>
                                            <span>{file.size_mb} MB</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            className="btn btn-outline"
                                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                            onClick={() => navigate(`/dashboard/process/${file.id}`)}
                                        >
                                            <Filter size={14} style={{ marginRight: '0.4rem' }} /> Process
                                        </button>
                                        <button
                                            className="btn btn-primary"
                                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                            onClick={() => navigate(`/dashboard/process/${file.id}`)}
                                        >
                                            <BarChart3 size={14} style={{ marginRight: '0.4rem' }} /> View
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Project Context Sidebar */}
                <div>
                    <div className="glass-panel" style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Project Details</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Subject ID</label>
                                <p style={{ fontWeight: 600 }}>{project?.subject_id || 'Not specified'}</p>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Session</label>
                                <p style={{ fontWeight: 600 }}>{project?.session || 'Not specified'}</p>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Created</label>
                                <p style={{ fontWeight: 600 }}>{new Date(project?.created_at).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel" style={{ background: 'linear-gradient(135deg, var(--primary-color), var(--primary-dark))', color: 'white' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'white' }}>Quick Insights</h3>
                        <p style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '1rem' }}>
                            Analysis tools are ready for your data. Select a file to begin processing.
                        </p>
                        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '8px' }}>
                            <p style={{ fontSize: '0.8rem' }}>Files Count</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{files.length}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
