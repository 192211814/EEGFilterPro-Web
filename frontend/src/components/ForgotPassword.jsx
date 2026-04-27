import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader } from 'lucide-react';
import { forgotPassword } from '../api';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await forgotPassword(email);
            // On success, redirect to verify OTP screen
            navigate('/verify-otp', { state: { email } });
        } catch (err) {
            setError(err.message || 'Failed to send reset code');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card glass-panel">
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ backgroundColor: 'rgba(108, 92, 231, 0.1)', padding: '1rem', borderRadius: '50%', width: 'fit-content', margin: '0 auto' }}>
                        <Mail size={40} color="var(--primary-color)" />
                    </div>
                    <h2 className="title-main mt-4" style={{ fontSize: '1.75rem' }}>Forgot Password?</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Enter your email to receive a 6-digit verification code.</p>
                </div>

                {error && (
                    <div style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
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

                    <button
                        type="submit"
                        className="btn btn-primary w-full"
                        disabled={loading}
                        style={{ marginTop: '1rem' }}
                    >
                        {loading ? <Loader className="animate-spin" /> : 'Send Reset Code'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <Link to="/login" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                        <ArrowLeft size={16} /> Back to Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
}
