import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './store/AuthContext';
import { ClubProvider } from './store/ClubContext';

// Layouts
import { DashboardLayout } from './components/layout/DashboardLayout';

// Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ClubRegister } from './pages/auth/ClubRegister';
import { ClubLogin } from './pages/auth/ClubLogin';
import { ClubSelect } from './pages/club/ClubSelect';
import { Landing } from './pages/Landing';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminLogin } from './pages/admin/AdminLogin';

import { Members } from './pages/dashboard/Members';
import { Events } from './pages/dashboard/Events';
import { Documents } from './pages/dashboard/Documents';
import { Finance } from './pages/dashboard/Finance';
import { Teams } from './pages/dashboard/Teams';
import { Projects } from './pages/dashboard/Projects';
import { DashboardHome } from './pages/dashboard/DashboardHome';
import { Profile } from './pages/dashboard/Profile';
import { Meetings } from './pages/dashboard/Meetings';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const AdminProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user || user.role !== 'ROLE_ADMIN') {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/register" element={<Register />} />
      <Route path="/club-login" element={<ClubLogin />} />
      <Route path="/club-register" element={<ClubRegister />} />
      <Route path="/admin" element={
        <AdminProtectedRoute>
          <AdminDashboard />
        </AdminProtectedRoute>
      } />
      
      <Route path="/select-club" element={
        <ProtectedRoute>
          <ClubSelect />
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<DashboardHome />} />
        <Route path="members" element={<Members />} />
        <Route path="events" element={<Events />} />
        <Route path="documents" element={<Documents />} />
        <Route path="finance" element={<Finance />} />
        <Route path="teams" element={<Teams />} />
        <Route path="projects" element={<Projects />} />
        <Route path="profile" element={<Profile />} />
        <Route path="meetings" element={<Meetings />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <ClubProvider>
        <Router>
          <AppRoutes />
        </Router>
      </ClubProvider>
    </AuthProvider>
  );
}

export default App;
