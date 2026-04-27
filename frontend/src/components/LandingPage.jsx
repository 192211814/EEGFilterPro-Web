import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, ShieldCheck, Zap, Globe, Cpu, ArrowRight } from 'lucide-react';

export default function LandingPage() {
    const navigate = useNavigate();

    React.useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) navigate('/dashboard');
    }, [navigate]);

    return (
        <div style={{ minHeight: '100vh', background: 'white', overflow: 'hidden' }}>
            {/* Navbar */}
            <nav style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '1.5rem 5%', backgroundColor: 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(10px)', position: 'fixed', top: 0, width: '100%', zIndex: 1000,
                borderBottom: '1px solid rgba(0,0,0,0.05)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Activity size={32} color="var(--primary-color)" />
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-dark)', letterSpacing: '-1px' }}>EEGFilterPro</span>
                </div>
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <Link to="/login" style={{ fontWeight: 600, color: 'var(--text-main)', textDecoration: 'none' }}>Sign In</Link>
                    <button className="btn btn-primary" onClick={() => navigate('/register')}>Get Started Free</button>
                </div>
            </nav>

            {/* Hero Section */}
            <section style={{
                padding: '10rem 5% 5rem', textAlign: 'center',
                background: 'radial-gradient(circle at top right, rgba(108, 92, 231, 0.05), transparent), radial-gradient(circle at bottom left, rgba(16, 185, 129, 0.05), transparent)'
            }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.5rem 1rem', background: 'rgba(108, 92, 231, 0.1)',
                        borderRadius: '50px', color: 'var(--primary-color)', fontWeight: 700, fontSize: '0.85rem',
                        marginBottom: '2rem'
                    }}>
                        <Zap size={14} /> NEW: DIGITAL SIGNAL VIEWER V2.0
                    </div>
                    <h1 style={{ fontSize: '4.5rem', fontWeight: 900, color: 'var(--primary-dark)', lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-2px' }}>
                        The Future of <span style={{ color: 'var(--primary-color)' }}>EEG Processing</span> is Web-Based.
                    </h1>
                    <p style={{ fontSize: '1.4rem', color: 'var(--text-muted)', marginBottom: '3rem', lineHeight: 1.6 }}>
                        The most advanced filtering pipeline for neuroscientific research. <br />
                        Real-time IIR/FIR filters, FFT analysis, and multi-channel visualization in your browser.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
                        <button className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.2rem' }} onClick={() => navigate('/register')}>
                            Start Analyzing Now <ArrowRight size={20} style={{ marginLeft: '0.75rem' }} />
                        </button>
                    </div>
                </div>
            </section>

            {/* Feature Grids */}
            <section style={{ padding: '5rem 5%' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
                    <div className="glass-panel" style={{ padding: '2.5rem', border: 'none', background: '#F8FAFC' }}>
                        <div style={{ backgroundColor: 'var(--primary-color)', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                            <Cpu color="white" size={28} />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Advanced DSP Engine</h3>
                        <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>Apply zero-phase FIR or high-order IIR filters with pinpoint precision. Perfect for Artifact rejection.</p>
                    </div>
                    <div className="glass-panel" style={{ padding: '2.5rem', border: 'none', background: '#F8FAFC' }}>
                        <div style={{ backgroundColor: '#10B981', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                            <Globe color="white" size={28} />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Cloud Collaboration</h3>
                        <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>Share projects with your research team across the globe. Secure, encrypted, and fast.</p>
                    </div>
                    <div className="glass-panel" style={{ padding: '2.5rem', border: 'none', background: '#F8FAFC' }}>
                        <div style={{ backgroundColor: '#3B82F6', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                            <ShieldCheck color="white" size={28} />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Certified Integrity</h3>
                        <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>Automated signal quality checks and EDF integrity verification processes build clinical trust.</p>
                    </div>
                </div>
            </section>

            {/* Floating Design Elements */}
            <div style={{
                position: 'absolute', top: '20%', left: '-10%', width: '400px', height: '400px',
                background: 'var(--primary-color)', opacity: 0.03, borderRadius: '50%', filter: 'blur(100px)', zIndex: -1
            }} />
            <div style={{
                position: 'absolute', bottom: '10%', right: '-10%', width: '600px', height: '600px',
                background: '#10B981', opacity: 0.03, borderRadius: '50%', filter: 'blur(120px)', zIndex: -1
            }} />
        </div>
    );
}
