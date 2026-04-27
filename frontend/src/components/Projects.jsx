import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Folder, Calendar, ArrowRight, Loader } from 'lucide-react';
import { listProjects, deleteProject } from '../api';

export default function Projects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const data = await listProjects(token);
            setProjects(data.projects);
        } catch (err) {
            setError(err.message || 'Failed to load projects');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this project?')) return;

        try {
            const token = localStorage.getItem('token');
            await deleteProject(token, id);
            setProjects(projects.filter(p => p.id !== id));
        } catch (err) {
            alert(err.message || 'Failed to delete project');
        }
    };

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}><Loader className="animate-spin" size={48} color="var(--primary-color)" /></div>;
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '700' }}>All Projects</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Manage and organize your EEG studies</p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/dashboard/projects/new')}>
                    <Plus size={20} style={{ marginRight: '0.5rem' }} />
                    New Project
                </button>
            </div>

            {error && <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>{error}</div>}

            {projects.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem' }}>
                    <Folder size={64} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <h3>No projects yet</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Create your first project to start uploading EEG data.</p>
                    <button className="btn btn-primary" onClick={() => navigate('/dashboard/projects/new')}>
                        Create First Project
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            className="glass-panel"
                            style={{ cursor: 'pointer', transition: 'var(--transition)', position: 'relative' }}
                            onClick={() => navigate(`/dashboard/projects/${project.id}`)}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div style={{ backgroundColor: 'rgba(108, 92, 231, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
                                    <Folder size={24} color="var(--primary-color)" />
                                </div>
                                <button
                                    onClick={(e) => handleDelete(e, project.id)}
                                    style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '0.5rem' }}
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>

                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{project.name}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '2.7rem' }}>
                                {project.description || 'No description provided.'}
                            </p>

                            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                    <Calendar size={14} style={{ marginRight: '0.25rem' }} />
                                    {new Date(project.created_at).toLocaleDateString()}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', color: 'var(--primary-color)', fontWeight: 600, fontSize: '0.9rem' }}>
                                    Open <ArrowRight size={16} style={{ marginLeft: '0.25rem' }} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
