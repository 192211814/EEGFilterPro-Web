const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
export const API_BASE_URL = isLocalhost ? `http://localhost:8062` : `http://180.235.121.245:8062`;

export async function loginUser(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
    }

    return response.json();
}

export async function registerUser(userData) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
    }

    return response.json();
}

export async function getProfile(token) {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch profile');
    }

    return response.json();
}

export async function updateProfile(token, formData) {
    const response = await fetch(`${API_BASE_URL}/auth/update-profile`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData // sending as FormData allows file uploads
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update profile');
    }

    return response.json();
}

export async function listProjects(token) {
    const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch projects');
    }

    return response.json();
}

export async function createProject(token, projectData) {
    const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(projectData)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create project');
    }

    return response.json();
}

export async function deleteProject(token, projectId) {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to delete project');
    }

    return response.json();
}

export async function uploadFile(token, projectId, file) {
    const formData = new FormData();
    formData.append('file', file);
    if (projectId) formData.append('project_id', projectId);

    const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to upload file');
    }

    return response.json();
}

export async function listFiles(token, projectId = null) {
    let url = `${API_BASE_URL}/files`;
    if (projectId) url += `?project_id=${projectId}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch files');
    }

    return response.json();
}

export async function getMultiChannel(token, fileId) {
    const response = await fetch(`${API_BASE_URL}/multi-channel?file_id=${fileId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch multi-channel data');
    }

    return response.json();
}

export async function applyFilter(token, filterParams) {
    const response = await fetch(`${API_BASE_URL}/apply-filter`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(filterParams)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to apply filter');
    }

    return response.json();
}

export async function getFFT(token, fileId, channel) {
    const response = await fetch(`${API_BASE_URL}/fft?file_id=${fileId}&channel=${channel}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to compute FFT');
    }

    return response.json();
}

export async function compareSignals(token, fileId) {
    const response = await fetch(`${API_BASE_URL}/compare?file_id=${fileId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch comparison data');
    }

    return response.json();
}

export async function downloadFile(token, fileId, format = 'edf') {
    const response = await fetch(`${API_BASE_URL}/download?file_id=${fileId}&format=${format}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Download failed');
    }

    return response.blob();
}

export async function getRawPreview(token, fileId, channel = null) {
    let url = `${API_BASE_URL}/raw-preview?file_id=${fileId}`;
    if (channel) url += `&channel=${channel}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch raw preview data');
    }

    return response.json();
}

export async function getSystemStatus(token) {
    const response = await fetch(`${API_BASE_URL}/system/status`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch system status');
    }

    return response.json();
}

export async function forgotPassword(email) {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to request reset');
    }

    return response.json();
}

export async function verifyOTP(email, otp) {
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Invalid or expired OTP');
    }

    return response.json();
}

export async function resetPassword(email, otp, new_password) {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp, new_password }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to reset password');
    }

    return response.json();
}

export async function saveProcessedFile(token, fileId, filterSettings, format = 'edf') {
    const response = await fetch(`${API_BASE_URL}/save-processed`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            file_id: parseInt(fileId),
            filter_settings: filterSettings,
            format: format
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to save processed file');
    }

    return response.json();
}

export async function getAnalysisResult(token, fileId) {
    const response = await fetch(`${API_BASE_URL}/final-analysis?file_id=${fileId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch analysis result');
    }

    return response.json();
}

