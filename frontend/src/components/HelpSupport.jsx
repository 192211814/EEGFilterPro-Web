import React, { useState } from 'react';
import {
    HelpCircle,
    ChevronRight,
    ChevronDown,
    BookOpen,
    MessageSquare,
    Mail,
    PhoneCall,
    Zap,
    Activity,
    Database,
    Cpu,
    BarChart3
} from 'lucide-react';

export default function HelpSupport() {
    const [openItems, setOpenItems] = useState([0]); // First one open by default

    const toggleAccordion = (index) => {
        if (openItems.includes(index)) {
            setOpenItems(openItems.filter(i => i !== index));
        } else {
            setOpenItems([...openItems, index]);
        }
    };

    const helpTopics = [
        {
            title: 'Detailed EEG Guide',
            icon: BookOpen,
            color: 'var(--primary-color)',
            content: (
                <div style={{ lineHeight: 1.6, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                    <h4 style={{ color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>1. Introduction to EEG</h4>
                    <p style={{ marginBottom: '1rem' }}>Electroencephalography (EEG) is a non-invasive method to record electrical activity of the brain. It measures voltage fluctuations resulting from ionic current within the neurons of the brain.</p>

                    <h4 style={{ color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>2. Why Filtering is Needed</h4>
                    <p style={{ marginBottom: '1rem' }}>EEG signals are very low in amplitude (microvolts) and are easily contaminated by noise such as power line interference (50/60 Hz), muscle movements (EMG), and eye blinks (EOG). Filtering is essential to extract clean brainwave data for analysis.</p>

                    <h4 style={{ color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>3. Types of Filters</h4>
                    <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                        <li><strong>High Pass:</strong> Removes low-frequency drifts and DC offsets.</li>
                        <li><strong>Low Pass:</strong> Removes high-frequency noise and prevents aliasing.</li>
                        <li><strong>Bandpass:</strong> Allows a specific range of frequencies (e.g., 0.5 - 50 Hz).</li>
                        <li><strong>Notch Filter:</strong> Specifically removes a single frequency, usually 50Hz or 60Hz power line noise.</li>
                    </ul>

                    <h4 style={{ color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>4. FFT (Fast Fourier Transform)</h4>
                    <p style={{ marginBottom: '1rem' }}>FFT is an algorithm that computes the discrete Fourier transform of a sequence. It converts the EEG signal from the time domain to the frequency domain, allowing us to see which brainwave frequencies are dominant.</p>

                    <h4 style={{ color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>5. Brainwave Bands</h4>
                    <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                        <li><strong>Delta (0.5 - 4 Hz):</strong> Deep sleep, restorative power.</li>
                        <li><strong>Theta (4 - 8 Hz):</strong> Drowsiness, meditation, light sleep.</li>
                        <li><strong>Alpha (8 - 13 Hz):</strong> Relaxed alertness, eyes closed.</li>
                        <li><strong>Beta (13 - 30 Hz):</strong> Active thinking, focus, high alertness.</li>
                    </ul>
                </div>
            )
        },
        {
            title: 'Getting Started',
            icon: Zap,
            color: '#F59E0B',
            content: (
                <div style={{ lineHeight: 1.6 }}>
                    <p>This application is designed to perform digital filtering of EEG signals to remove power line interference (50/60 Hz noise).</p>
                    <ul style={{ paddingLeft: '1.5rem', marginTop: '1rem', listStyleType: 'decimal' }}>
                        <li>Navigate to the <strong>Projects</strong> section and create a new analysis session.</li>
                        <li>Upload the EEG dataset in supported formats (EDF, BDF, SET, or CSV).</li>
                        <li>Verify the signal preview in the <strong>Detailed View</strong>.</li>
                        <li>Proceed to <strong>Filter Configuration</strong> to select appropriate parameters for noise removal.</li>
                    </ul>
                </div>
            )
        },
        {
            title: 'Importing Data',
            icon: Database,
            color: '#10B981',
            content: (
                <div style={{ lineHeight: 1.6 }}>
                    <p>The <strong>Import Data</strong> section allows users to load raw EEG recordings into the application. Supported file formats include standard biomedical signal formats such as EDF, BDF, SET, and CSV.</p>
                    <p style={{ marginTop: '1rem' }}>After selecting a file, the system validates the sampling frequency and signal structure. A preview of the raw EEG waveform is displayed to confirm successful loading.</p>
                </div>
            )
        },
        {
            title: 'Filter Configuration',
            icon: Cpu,
            color: '#3B82F6',
            content: (
                <div style={{ lineHeight: 1.6 }}>
                    <p>In the <strong>Filter Configuration</strong> section, users can select the appropriate digital filter type such as FIR or IIR. Specify parameters including cutoff frequency, filter order, and noise frequency (50 Hz or 60 Hz). The application provides guidance to help choose optimal values based on signal characteristics.</p>
                </div>
            )
        },
        {
            title: 'Interpreting Results',
            icon: BarChart3,
            color: '#8B5CF6',
            content: (
                <div style={{ lineHeight: 1.6 }}>
                    <p>The <strong>Interpreting Results</strong> section presents both raw and filtered EEG signals for comparison. Users can visually analyze the effectiveness of noise removal through waveform visualization. Reduction in power line interference should be observed without distortion of the underlying brain signal.</p>
                </div>
            )
        }
    ];

    return (
        <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>Help & Support</h2>

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {/* Help Topics Accordion */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {helpTopics.map((topic, index) => {
                        const isOpen = openItems.includes(index);
                        const Icon = topic.icon;
                        return (
                            <div key={index} className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                                <div
                                    onClick={() => toggleAccordion(index)}
                                    style={{
                                        padding: '1.25rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        cursor: 'pointer',
                                        background: isOpen ? `${topic.color}05` : 'transparent',
                                        transition: 'var(--transition)'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ backgroundColor: `${topic.color}15`, padding: '0.6rem', borderRadius: '10px', display: 'flex' }}>
                                            <Icon size={20} color={topic.color} />
                                        </div>
                                        <span style={{ fontWeight: 600, fontSize: '1.05rem', color: isOpen ? topic.color : 'inherit' }}>{topic.title}</span>
                                    </div>
                                    {isOpen ? <ChevronDown size={20} color={topic.color} /> : <ChevronRight size={20} color="#94A3B8" />}
                                </div>

                                {isOpen && (
                                    <div style={{
                                        padding: '0 1.25rem 1.25rem 4.1rem',
                                        animation: 'slideIn 0.3s ease-out',
                                        borderTop: '1px solid #F1F5F9',
                                        marginTop: '0.5rem',
                                        paddingTop: '1.5rem'
                                    }}>
                                        {topic.content}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
}
