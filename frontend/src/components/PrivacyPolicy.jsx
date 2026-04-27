import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ShieldCheck, Lock, Eye, FileText } from 'lucide-react';

export default function PrivacyPolicy() {
    const navigate = useNavigate();

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ padding: '0.5rem', borderRadius: '50%' }}>
                    <ChevronLeft size={20} />
                </button>
                <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>Privacy Policy</h2>
            </div>

            <div className="glass-panel" style={{ padding: '3rem', lineHeight: 1.8 }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <ShieldCheck size={64} color="var(--primary-color)" style={{ marginBottom: '1.5rem' }} />
                    <h3>Your Data Privacy Matters</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Last Updated: March 2026</p>
                </div>

                <section style={{ marginBottom: '2.5rem' }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-dark)', marginBottom: '1rem' }}>
                        <FileText size={20} /> 1. Information Collection
                    </h4>
                    <p>We collect information you provide directly to us when you create an account, upload EEG files, or contact us for support. This includes your name, institutional email, and the biomedical signal data you process through our platform.</p>
                </section>

                <section style={{ marginBottom: '2.5rem' }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-dark)', marginBottom: '1rem' }}>
                        <Eye size={20} /> 2. Data Usage
                    </h4>
                    <p>The EEG data uploaded to EEGFilterPro Web is used exclusively for the digital signal processing tasks you initiate. We do not sell, share, or use your medical research data for any purpose other than providing the filtering and analysis services requested.</p>
                </section>

                <section style={{ marginBottom: '2.5rem' }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-dark)', marginBottom: '1rem' }}>
                        <Lock size={20} /> 3. Security
                    </h4>
                    <p>We implement industry-standard encryption for data at rest and in transit. Your authentication tokens are stored securely, and all signal processing is performed within an isolated environment to ensure the integrity of your research.</p>
                </section>

                <div style={{ backgroundColor: '#F8FAFC', padding: '2rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                    <h4 style={{ marginBottom: '0.5rem' }}>Questions?</h4>
                    <p style={{ fontSize: '0.95rem' }}>If you have questions about this policy or our data practices, please contact our Data Protection Officer at <strong>privacy@simats.edu</strong>.</p>
                </div>
            </div>
        </div>
    );
}
