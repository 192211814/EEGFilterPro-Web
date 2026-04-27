import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Activity, CheckCircle } from 'lucide-react';
import { registerUser } from '../api';

export default function Registration() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [agree, setAgree] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) navigate('/dashboard');
    }, [navigate]);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(null);

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!agree) {
            setError('You must agree to the terms and conditions');
            return;
        }

        setLoading(true);
        try {
            const resp = await registerUser({
                name: formData.name,
                email: formData.email,
                password: formData.password
            });
            localStorage.setItem('token', resp.token);
            localStorage.setItem('user', JSON.stringify(resp.user));
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card glass-panel" style={{ maxWidth: '500px' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <Activity size={40} color="var(--primary-color)" />
                    <h2 className="title-main mt-4" style={{ fontSize: '1.75rem' }}>Create Account</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Join EEGFilterPro Web Platform</p>
                </div>

                {error && (
                    <div style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input
                            name="name"
                            className="form-control"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Institutional Email</label>
                        <input
                            type="email"
                            name="email"
                            className="form-control"
                            placeholder="name@university.edu"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                name="password"
                                className="form-control"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                className="form-control"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', cursor: 'pointer' }} onClick={() => setAgree(!agree)}>
                        <div style={{
                            width: '20px', height: '20px', borderRadius: '4px', border: '2px solid var(--primary-color)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', background: agree ? 'var(--primary-color)' : 'white',
                            transition: 'all 0.2s'
                        }}>
                            {agree && <CheckCircle size={14} color="white" />}
                        </div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
                            I agree to the <a href="#" style={{ color: 'var(--primary-color)', fontWeight: 600 }}>Terms of Service</a> and <a href="#" style={{ color: 'var(--primary-color)', fontWeight: 600 }}>Privacy Policy</a>
                        </span>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-full"
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : <><UserPlus size={20} style={{ marginRight: '0.5rem' }} /> Create Account</>}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: 600 }}>Sign In</Link>
                </div>
            </div>
        </div>
    );
}
