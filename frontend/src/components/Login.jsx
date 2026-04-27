import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, ShieldCheck, Zap } from 'lucide-react';
import { loginUser } from '../api';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    React.useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) navigate('/dashboard');
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const resp = await loginUser(email, password);
            localStorage.setItem('token', resp.token);
            localStorage.setItem('user', JSON.stringify(resp.user));
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Error occurred during login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card glass-panel">
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <Activity size={48} color="var(--primary-color)" />
                    <h2 className="title-main mt-4" style={{ fontSize: '2rem' }}>Welcome Back</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Login to EEGFilterPro Web</p>
                </div>

                {error && (
                    <div style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            className="form-control"
                            placeholder="you@school.edu"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                            <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--primary-color)', textDecoration: 'none' }}>
                                Forgot Password?
                            </Link>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-full"
                        disabled={loading}
                    >
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
                    Don't have an account? <Link to="/register" style={{ color: 'var(--primary-color)', fontWeight: 600 }}>Create Account</Link>
                </div>
            </div>
        </div>
    );
}
