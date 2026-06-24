import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore.js';
import { useAppStore } from './store/appStore.js';
import Toast from './components/Toast.jsx';

// Layouts
import PublicLayout from './layouts/PublicLayout.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';

// Pages
import Splash from './pages/Splash.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import CompleteProfile from './pages/CompleteProfile.jsx';
import DonorDashboard from './pages/DonorDashboard.jsx';
import DonorEligibility from './pages/DonorEligibility.jsx';
import VolunteerDashboard from './pages/VolunteerDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import HospitalDashboard from './pages/HospitalDashboard.jsx';
import DonorSearch from './pages/DonorSearch.jsx';
import BloodRequests from './pages/BloodRequests.jsx';
import Profile from './pages/Profile.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import Privacy from './pages/Privacy.jsx';
import Terms from './pages/Terms.jsx';
import Notifications from './pages/Notifications.jsx';
import Settings from './pages/Settings.jsx';
import EmergencyDashboard from './pages/EmergencyDashboard.jsx';

// Admin Module Pages
import VolunteerManagement from './pages/admin/VolunteerManagement.jsx';
import AdminBloodRequests from './pages/admin/AdminBloodRequests.jsx';
import FeedbackManagement from './pages/admin/FeedbackManagement.jsx';
import SupportCenter from './pages/admin/SupportCenter.jsx';
import ReportsAnalytics from './pages/admin/ReportsAnalytics.jsx';
import NotificationCenter from './pages/admin/NotificationCenter.jsx';
import ActivityLogs from './pages/admin/ActivityLogs.jsx';
import SystemSettings from './pages/admin/SystemSettings.jsx';

// Protected route — redirects to login if not authenticated
function ProtectedRoute({ children, roles }) {
  const { user, token, logout } = useAuthStore();
  const { allUsers, triggerToast } = useAppStore();

  if (!token) return <Navigate to="/login" replace />;

  // Real-time check if user de-activated
  const currentDbUser = allUsers.find(u => u._id === user?._id || u.email === user?.email);
  
  if (currentDbUser && currentDbUser.status !== user.status) {
    setTimeout(() => {
      useAuthStore.setState({
        user: { ...user, status: currentDbUser.status }
      });
      localStorage.setItem('jeevalink_user', JSON.stringify({ ...user, status: currentDbUser.status }));
    }, 0);
  }

  if (currentDbUser && (currentDbUser.status === 'Inactive' || currentDbUser.status === 'Suspended' || currentDbUser.status === 'Rejected')) {
    setTimeout(() => {
      logout();
      triggerToast('Your account is deactivated or suspended.', 'error');
    }, 0);
    return <Navigate to="/login" replace />;
  }

  // Check for profile completion
  const isVolunteer = user.role === 'volunteer';
  const isHospitalOrAdmin = ['hospital', 'admin'].includes(user.role);
  const basicComplete = !!(user.city && user.district);
  const isComplete = isVolunteer || isHospitalOrAdmin 
    ? basicComplete 
    : basicComplete && !!user.bloodGroup && user.bloodGroup !== 'N/A';

  if (!isComplete && window.location.pathname !== '/complete-profile') {
    return <Navigate to="/complete-profile" replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    // Redirect to correct dashboard
    const redirect =
      user.role === 'admin' ? '/admin/dashboard' :
      user.role === 'volunteer' ? '/volunteer/dashboard' :
      user.role === 'hospital' ? '/hospital/dashboard' :
      '/donor/dashboard';
    return <Navigate to={redirect} replace />;
  }
  return children;
}

// Admin-only protected route wrapper
function AdminRoute({ children }) {
  const { user, token } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const { token, loadProfile } = useAuthStore();

  useEffect(() => {
    if (token) {
      loadProfile();
    }
  }, [token, loadProfile]);

  return (
    <BrowserRouter>
      {showSplash ? (
        <Splash onComplete={() => setShowSplash(false)} />
      ) : (
        <>

          <Toast />
          <Routes>
            {/* Splash screen route for manual/direct access */}
            <Route path="/splash" element={<Splash />} />

            {/* Public layout — Navbar + Footer */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Landing />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
            </Route>

            {/* Auth pages — no Navbar/Footer */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/complete-profile" element={<CompleteProfile />} />

            {/* ═══ Admin Panel Routes (Dark theme, AdminLayout) ═══ */}
            <Route element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/volunteers" element={<VolunteerManagement />} />
              <Route path="/admin/blood-requests" element={<AdminBloodRequests />} />
              <Route path="/admin/feedback" element={<FeedbackManagement />} />
              <Route path="/admin/support" element={<SupportCenter />} />
              <Route path="/admin/reports" element={<ReportsAnalytics />} />
              <Route path="/admin/notifications" element={<NotificationCenter />} />
              <Route path="/admin/activity-logs" element={<ActivityLogs />} />
              <Route path="/admin/settings" element={<SystemSettings />} />
            </Route>

            {/* Dashboard layout — Sidebar + top bar (non-admin users) */}
            <Route element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route path="/donor/dashboard" element={
                <ProtectedRoute roles={['donor']}>
                  <DonorDashboard />
                </ProtectedRoute>
              } />
              <Route path="/donor/eligibility" element={
                <ProtectedRoute roles={['donor']}>
                  <DonorEligibility />
                </ProtectedRoute>
              } />
              <Route path="/volunteer/dashboard" element={
                <ProtectedRoute roles={['volunteer']}>
                  <VolunteerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/emergency" element={
                <ProtectedRoute roles={['admin']}>
                  <EmergencyDashboard />
                </ProtectedRoute>
              } />
              <Route path="/hospital/dashboard" element={
                <ProtectedRoute roles={['hospital']}>
                  <HospitalDashboard />
                </ProtectedRoute>
              } />
              <Route path="/donor/search" element={<DonorSearch />} />
              <Route path="/requests" element={<BloodRequests />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </>
      )}
    </BrowserRouter>
  );
}
