import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Loader } from 'lucide-react';
import { verifyOTP } from '../api';

export default function VerifyOTP() {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    useEffect(() => {
        if (!email) {
            navigate('/forgot-password');
        }
    }, [email, navigate]);

    const handleVerify = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await verifyOTP(email, otp);
            // On success, redirect to reset password screen
            navigate('/reset-password', { state: { email, otp } });
        } catch (err) {
            setError(err.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card glass-panel">
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '50%', width: 'fit-content', margin: '0 auto' }}>
                        <ShieldCheck size={40} color="#10B981" />
                    </div>
                    <h2 className="title-main mt-4" style={{ fontSize: '1.75rem' }}>Verify Code</h2>
                    <p style={{ color: 'var(--text-muted)' }}>We sent a 6-digit verification code to <strong>{email}</strong>.</p>
                </div>

                {error && (
                    <div style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleVerify}>
                    <div className="form-group">
                        <label className="form-label">6-Digit Verification Code</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="123456"
                            maxLength="6"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                            style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.25rem' }}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-full"
                        disabled={loading}
                        style={{ marginTop: '1rem' }}
                    >
                        {loading ? <Loader className="animate-spin" /> : 'Verify Code'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <Link to="/forgot-password" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                        <ArrowLeft size={16} /> Edit Email
                    </Link>
                </div>
            </div>
        </div>
    );
}
