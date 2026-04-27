import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User,
    Lock,
    ShieldCheck,
    LogOut,
    Trash2,
    ChevronRight,
    Bell,
    Smartphone,
    Activity
} from 'lucide-react';

export default function Settings() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState(true);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const menuSections = [
        {
            title: 'Account Settings',
            items: [
                { label: 'Edit Profile', icon: User, action: () => navigate('/dashboard/profile'), color: 'var(--primary-color)' },
                { label: 'Change Password', icon: Lock, action: () => { }, color: '#F59E0B' },
                { label: 'Privacy & Security', icon: ShieldCheck, action: () => navigate('/dashboard/privacy'), color: '#10B981' },
            ]
        },
        {
            title: 'Preferences',
            items: [
                {
                    label: 'Desktop Notifications',
                    icon: Bell,
                    type: 'toggle',
                    value: notifications,
                    onChange: () => setNotifications(!notifications),
                    color: '#3B82F6'
                },
            ]
        },
        {
            title: 'Danger Zone',
            items: [
                { label: 'Sign Out', icon: LogOut, action: handleLogout, color: '#EF4444' },
                { label: 'Delete Account', icon: Trash2, action: () => { }, color: '#EF4444', danger: true },
            ]
        }
    ];

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', animation: 'fadeIn 0.4s ease-out' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>Settings</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {menuSections.map((section, idx) => (
                    <div key={idx}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', paddingLeft: '0.5rem' }}>
                            {section.title}
                        </h3>
                        <div className="glass-panel" style={{ padding: '0.5rem' }}>
                            {section.items.map((item, i) => (
                                <div
                                    key={i}
                                    onClick={item.type === 'toggle' ? item.onChange : item.action}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '1rem', borderRadius: '12px', cursor: 'pointer',
                                        transition: 'background 0.2s',
                                        borderBottom: i === section.items.length - 1 ? 'none' : '1px solid #F1F5F9'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{
                                            backgroundColor: `${item.color}15`,
                                            padding: '0.6rem',
                                            borderRadius: '10px',
                                            display: 'flex'
                                        }}>
                                            <item.icon size={20} color={item.color} />
                                        </div>
                                        <span style={{ fontWeight: 500, color: item.danger ? '#EF4444' : 'var(--text-main)' }}>{item.label}</span>
                                    </div>

                                    {item.type === 'toggle' ? (
                                        <div style={{
                                            width: '44px', height: '24px', borderRadius: '12px',
                                            backgroundColor: item.value ? 'var(--primary-color)' : '#E2E8F0',
                                            position: 'relative', transition: '0.2s'
                                        }}>
                                            <div style={{
                                                width: '18px', height: '18px', borderRadius: '50%', backgroundColor: 'white',
                                                position: 'absolute', top: '3px', left: item.value ? '23px' : '3px',
                                                transition: '0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                            }} />
                                        </div>
                                    ) : (
                                        <ChevronRight size={18} color="#94A3B8" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '3rem', textAlign: 'center', opacity: 0.5, fontSize: '0.85rem' }}>
                <Activity size={16} color="var(--primary-color)" style={{ marginBottom: '0.5rem' }} />
                <p>EEGFilterPro Web Client v0.1.0-alpha</p>
                <p>© 2026 Simats Medical Systems</p>
            </div>
        </div>
    );
}
