import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Key, ArrowLeft, Loader, CheckCircle } from 'lucide-react';
import { resetPassword } from '../api';

export default function ResetPassword() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { email, otp } = location.state || {};

    useEffect(() => {
        if (!email || !otp) {
            navigate('/forgot-password');
        }
    }, [email, otp, navigate]);

    const handleReset = async (e) => {
        e.preventDefault();
        setError(null);

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            await resetPassword(email, otp, newPassword);
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.message || 'Reset failed');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="auth-wrapper">
                <div className="auth-card glass-panel" style={{ textAlign: 'center' }}>
                    <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '50%', width: 'fit-content', margin: '0 auto' }}>
                        <CheckCircle size={40} color="#10B981" />
                    </div>
                    <h2 className="title-main mt-4" style={{ fontSize: '1.75rem' }}>Password Reset!</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Your password has been updated successfully.</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '1rem' }}>Redirecting to login...</p>
                    <Link to="/login" className="btn btn-primary w-full" style={{ marginTop: '2rem' }}>Sign In Now</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-wrapper">
            <div className="auth-card glass-panel">
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '1rem', borderRadius: '50%', width: 'fit-content', margin: '0 auto' }}>
                        <Key size={40} color="#F59E0B" />
                    </div>
                    <h2 className="title-main mt-4" style={{ fontSize: '1.75rem' }}>Create New Password</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Keep it strong and secure.</p>
                </div>

                {error && (
                    <div style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleReset}>
                    <div className="form-group">
                        <label className="form-label">New Password</label>
                        <input
                            type="password"
                            className="form-control"
                            placeholder="••••••••"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Confirm New Password</label>
                        <input
                            type="password"
                            className="form-control"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-full"
                        disabled={loading}
                        style={{ marginTop: '1rem' }}
                    >
                        {loading ? <Loader className="animate-spin" /> : 'Update Password'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <Link to="/login" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                        <ArrowLeft size={16} /> Cancel and Back
                    </Link>
                </div>
            </div>
        </div>
    );
}
