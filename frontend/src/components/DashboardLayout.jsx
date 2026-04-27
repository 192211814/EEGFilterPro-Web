import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Activity, LayoutDashboard, User, Folder, LogOut, Settings, HelpCircle, Bell, Clock } from 'lucide-react';
import { getProfile, API_BASE_URL } from '../api';

export default function DashboardLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchUser = () => {
            getProfile(token).then(data => {
                setUser(data.user);
                localStorage.setItem('user', JSON.stringify(data.user));
            }).catch(() => {
                const cached = localStorage.getItem('user');
                if (cached) setUser(JSON.parse(cached));
            });
        };

        fetchUser();

        // Listen for profile updates from other components
        window.addEventListener('storage', fetchUser);
        return () => window.removeEventListener('storage', fetchUser);
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const menuItems = [
        { path: '/dashboard', label: 'Home', icon: LayoutDashboard },
        { path: '/dashboard/projects', label: 'Projects', icon: Folder },
        { path: '/dashboard/history', label: 'History', icon: Clock },
        { path: '/dashboard/profile', label: 'My Profile', icon: User },
    ];

    const secondaryItems = [
        { path: '/dashboard/settings', label: 'Settings', icon: Settings },
        { path: '/dashboard/help', label: 'Help & Support', icon: HelpCircle },
    ];

    return (
        <div className="app-container">
            {/* Sidebar */}
            <div className="sidebar">
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '3rem', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
                    <div style={{ backgroundColor: 'var(--primary-color)', padding: '0.5rem', borderRadius: '10px', display: 'flex' }}>
                        <Activity size={24} color="white" />
                    </div>
                    <span style={{ fontSize: '1.25rem', fontWeight: 700, marginLeft: '0.75rem', color: 'var(--primary-dark)', letterSpacing: '-0.5px' }}>
                        EEGFilterPro
                    </span>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', paddingLeft: '1rem' }}>Menu</p>
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`nav-link ${isActive ? 'active' : ''}`}
                                    style={{
                                        display: 'flex', alignItems: 'center', padding: '0.75rem 1rem',
                                        borderRadius: '12px',
                                        backgroundColor: isActive ? 'rgba(0, 0, 102, 0.1)' : 'transparent',
                                        color: isActive ? '#000066' : 'var(--text-muted)',
                                        fontWeight: isActive ? 600 : 500,
                                        transition: 'var(--transition)'
                                    }}
                                >
                                    <Icon size={20} style={{ marginRight: '1rem' }} />
                                    {item.label}
                                </Link>
                            )
                        })}
                    </nav>

                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', paddingLeft: '1rem' }}>Support</p>
                        {secondaryItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`nav-link ${isActive ? 'active' : ''}`}
                                    style={{
                                        display: 'flex', alignItems: 'center', padding: '0.75rem 1rem',
                                        borderRadius: '12px',
                                        backgroundColor: isActive ? 'rgba(108, 92, 231, 0.1)' : 'transparent',
                                        color: isActive ? 'var(--primary-color)' : 'var(--text-muted)',
                                        fontWeight: isActive ? 600 : 500
                                    }}
                                >
                                    <Icon size={20} style={{ marginRight: '1rem' }} />
                                    {item.label}
                                </Link>
                            )
                        })}
                    </nav>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
                    <div style={{ padding: '1.25rem', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#000066', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, overflow: 'hidden' }}>
                            {user?.profile_image ? (
                                <img src={`${API_BASE_URL}/static/${user.profile_image}?t=${Date.now()}`} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                user?.name ? user.name.charAt(0).toUpperCase() : <User size={20} />
                            )}
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <p style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'User'}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</p>
                        </div>
                    </div>
                    <button
                        className="btn btn-outline"
                        style={{ width: '100%', display: 'flex', justifyContent: 'center', border: '1px solid #E2E8F0', color: '#EF4444' }}
                        onClick={handleLogout}
                    >
                        <LogOut size={18} style={{ marginRight: '0.5rem' }} />
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="main-content">
                <header style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '2rem', gap: '1.5rem' }}>
                    <div style={{ position: 'relative', cursor: 'pointer' }}>
                        <Bell size={24} color="var(--text-muted)" />
                        <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', background: '#EF4444', borderRadius: '50%', border: '2px solid white' }} />
                    </div>
                    <div style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard/profile')}>
                        <Settings size={24} color="var(--text-muted)" />
                    </div>
                </header>
                <Outlet />
            </div>
        </div>
    );
}
