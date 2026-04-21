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
import { ClubSelect } from './pages/club/ClubSelect';
import { Landing } from './pages/Landing';

import { Members } from './pages/dashboard/Members';
import { Events } from './pages/dashboard/Events';
import { Documents } from './pages/dashboard/Documents';
import { Finance } from './pages/dashboard/Finance';

const DashboardHome = () => <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100"><h2 className="text-xl font-bold mb-4">Dashboard</h2><p className="text-gray-500">Hoş geldiniz.</p></div>;

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/club-register" element={<ClubRegister />} />
      
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
