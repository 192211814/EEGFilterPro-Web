import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage.jsx';
import Login from './components/Login.jsx';
import Registration from './components/Registration.jsx';
import DashboardLayout from './components/DashboardLayout.jsx';
import DashboardHome from './components/DashboardHome.jsx';
import Profile from './components/Profile.jsx';
import Projects from './components/Projects.jsx';
import History from './components/History.jsx';
import NewProject from './components/NewProject.jsx';
import ProjectDetail from './components/ProjectDetail.jsx';
import SignalViewer from './components/SignalViewer.jsx';
import Analysis from './components/Analysis.jsx';
import Settings from './components/Settings.jsx';
import HelpSupport from './components/HelpSupport.jsx';
import PrivacyPolicy from './components/PrivacyPolicy.jsx';
import EEGDashboard from './components/EEGDashboard.jsx';
import ResetPassword from './components/ResetPassword.jsx';
import ForgotPassword from './components/ForgotPassword.jsx';
import VerifyOTP from './components/VerifyOTP.jsx';
import FilteredResult from './components/FilteredResult.jsx';
import SignalComparison from './components/SignalComparison.jsx';
import SpectralAnalysis from './components/SpectralAnalysis.jsx';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Registration />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/verify-otp" element={<VerifyOTP />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/dashboard" element={<DashboardLayout />}>
                    <Route index element={<DashboardHome />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="projects" element={<Projects />} />
                    <Route path="history" element={<History />} />
                    <Route path="projects/new" element={<NewProject />} />
                    <Route path="projects/:id" element={<ProjectDetail />} />
                    <Route path="viewer/:fileId" element={<SignalViewer />} />
                    <Route path="analysis/:fileId" element={<Analysis />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="help" element={<HelpSupport />} />
                    <Route path="privacy" element={<PrivacyPolicy />} />
                    <Route path="process/:fileId" element={<EEGDashboard />} />
                    <Route path="result/:fileId" element={<FilteredResult />} />
                    <Route path="compare/:fileId" element={<SignalComparison />} />
                    <Route path="spectral/:fileId" element={<SpectralAnalysis />} />
                </Route>
                {/* Fallback for any other path */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
