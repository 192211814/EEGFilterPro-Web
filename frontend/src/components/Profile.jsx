import React, { useEffect, useState } from 'react';
import { getProfile, updateProfile, API_BASE_URL } from '../api';
import { User, Save, Upload, Loader } from 'lucide-react';

export default function Profile() {
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phone: '',
        institution: '',
        department: '',
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [file, setFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const data = await getProfile(token);
            setProfile({
                name: data.user.name || '',
                email: data.user.email || '',
                phone: data.user.phone || '',
                institution: data.user.institution || '',
                department: data.user.department || '',
            });
            if (data.user.profile_image) {
                setImagePreview(`${API_BASE_URL}/static/${data.user.profile_image}`);
            }
        } catch (err) {
            setError(err.message || 'Error loading profile');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];

            // Check for file size (2MB limit)
            if (selectedFile.size > 2 * 1024 * 1024) {
                setError('File size exceeds 2MB limit. Please choose a smaller image.');
                return;
            }

            setFile(selectedFile);
            setImagePreview(URL.createObjectURL(selectedFile));
            setError(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(false);

        try {
            const token = localStorage.getItem('token');

            const formData = new FormData();
            // More robust string cleaning: handle potential nulls and extra quotes
            const cleanStr = (val) => (val || '').toString().trim().replace(/^"(.*)"$/, '$1');

            formData.append('first_name', cleanStr(profile.name));
            formData.append('phone', cleanStr(profile.phone));
            formData.append('institution', cleanStr(profile.institution));
            formData.append('department', cleanStr(profile.department));

            if (file) {
                formData.append('profile_image', file);
            }

            const response = await updateProfile(token, formData);

            // Sync with backend response to ensure frontend matches database exactly
            if (response.user) {
                setProfile({
                    name: response.user.name || '',
                    email: response.user.email || '',
                    phone: response.user.phone || '',
                    institution: response.user.institution || '',
                    department: response.user.department || '',
                });

                // Sync local storage so header/sidebar update immediately
                const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                const updatedUser = { ...currentUser, ...response.user };
                localStorage.setItem('user', JSON.stringify(updatedUser));

                // Dispatch custom event to notify DashboardLayout to refresh
                window.dispatchEvent(new Event('storage'));

                setSuccess(response.message || 'Profile updated successfully!');

                if (response.user.profile_image) {
                    const newPreview = `${API_BASE_URL}/static/${response.user.profile_image}?t=${Date.now()}`;
                    setImagePreview(newPreview);
                }
            }

            setFile(null); // Clear selected file after success

        } catch (err) {
            console.error(err);
            setError(err.message || 'Update Failed');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Loader className="animate-spin" /></div>;
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="glass-panel" style={{ padding: '2rem' }}>
                <h2 style={{ fontSize: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', color: '#000066' }}>
                    <User size={28} color="#000066" />
                    My Profile
                </h2>

                {error && <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}
                {success && <div style={{ background: '#D1FAE5', color: '#059669', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>{success}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '2rem' }}>

                    <div style={{ flex: 1 }}>
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input name="name" value={profile.name} onChange={handleInputChange} className="form-control" required />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email Context (Read-only)</label>
                            <input name="email" value={profile.email} disabled className="form-control" style={{ backgroundColor: '#F3F4F6', color: '#9CA3AF' }} />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Phone Number</label>
                            <input name="phone" value={profile.phone} onChange={handleInputChange} className="form-control" />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">Institution</label>
                                <input name="institution" value={profile.institution} onChange={handleInputChange} className="form-control" />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Department</label>
                                <input name="department" value={profile.department} onChange={handleInputChange} className="form-control" />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={saving} style={{ marginTop: '1rem', background: '#000066' }}>
                            {saving ? 'Synchronizing...' : <><Save size={18} style={{ marginRight: '0.5rem' }} /> Save Clinical Profile</>}
                        </button>
                    </div>

                    <div style={{ width: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '150px', height: '150px', borderRadius: '50%', background: '#E2E8F0', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                            {imagePreview ? (
                                <img src={imagePreview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <User size={64} color="#94A3B8" />
                            )}
                        </div>

                        <label className="btn btn-outline" style={{ cursor: 'pointer', padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                            <Upload size={16} style={{ marginRight: '0.5rem' }} />
                            Upload Photo
                            <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                        </label>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>JPG or PNG. Max size of 2MB.</p>
                    </div>

                </form>
            </div>
        </div>
    );
}
