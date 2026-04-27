import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, FolderPlus } from 'lucide-react';
import { createProject } from '../api';

export default function NewProject() {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        subject_id: '',
        session: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            await createProject(token, formData);
            navigate('/dashboard/projects');
        } catch (err) {
            setError(err.message || 'Failed to create project');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <button
                onClick={() => navigate('/dashboard/projects')}
                style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '1.5rem', fontSize: '1rem' }}
            >
                <ChevronLeft size={20} /> Back to Projects
            </button>

            <div className="glass-panel" style={{ padding: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                    <div style={{ backgroundColor: 'rgba(108, 92, 231, 0.1)', padding: '0.75rem', borderRadius: '12px', marginRight: '1rem' }}>
                        <FolderPlus size={32} color="var(--primary-color)" />
                    </div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '700' }}>Create New Project</h2>
                </div>

                {error && <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Project Name *</label>
                        <input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="e.g., Clinical Study A"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="Brief description of the study..."
                            style={{ minHeight: '100px', resize: 'vertical' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label className="form-label">Subject ID</label>
                            <input
                                name="subject_id"
                                value={formData.subject_id}
                                onChange={handleChange}
                                className="form-control"
                                placeholder="SUB001"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Session</label>
                            <input
                                name="session"
                                value={formData.session}
                                onChange={handleChange}
                                className="form-control"
                                placeholder="Session 1"
                            />
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                        <button
                            type="button"
                            className="btn btn-outline"
                            style={{ flex: 1 }}
                            onClick={() => navigate('/dashboard/projects')}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ flex: 2 }}
                            disabled={loading}
                        >
                            {loading ? 'Creating...' : <><Save size={20} style={{ marginRight: '0.5rem' }} /> Create Project</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
