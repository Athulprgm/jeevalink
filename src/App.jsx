import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore.js';
import { useAppStore } from './store/appStore.js';
import Toast from './components/Toast.jsx';

// Layouts
import PublicLayout from './layouts/PublicLayout.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';

// Pages
import Splash from './pages/Splash.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import DonorDashboard from './pages/DonorDashboard.jsx';
import VolunteerDashboard from './pages/VolunteerDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import HospitalDashboard from './pages/HospitalDashboard.jsx';
import DonorSearch from './pages/DonorSearch.jsx';
import BloodRequests from './pages/BloodRequests.jsx';
import Profile from './pages/Profile.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import Notifications from './pages/Notifications.jsx';
import Settings from './pages/Settings.jsx';

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

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

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
            </Route>

            {/* Auth pages — no Navbar/Footer */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Dashboard layout — Sidebar + top bar */}
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
              <Route path="/volunteer/dashboard" element={
                <ProtectedRoute roles={['volunteer']}>
                  <VolunteerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/dashboard" element={
                <ProtectedRoute roles={['admin']}>
                  <AdminDashboard />
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
