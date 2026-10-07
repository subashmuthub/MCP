import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import SiteHeader from './components/SiteHeader.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import DashboardLayout from './components/DashboardLayout.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import EquipmentPage from './pages/EquipmentPage.jsx';
import RecordsPage from './pages/RecordsPage.jsx';
import AlertsPage from './pages/AlertsPage.jsx';
import TicketsPage from './pages/TicketsPage.jsx';
import MaintenancePage from './pages/MaintenancePage.jsx';
import UsageLogsPage from './pages/UsageLogsPage.jsx';
import RiskPage from './pages/RiskPage.jsx';
import FeedbackPage from './pages/FeedbackPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

function PublicRoute({ children }) {
  const { isAuthenticated, ready } = useAuth();
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner w-10 h-10" />
      </div>
    );
  }
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <SiteHeader />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<DashboardPage />} />
            <Route path="equipment" element={<EquipmentPage />} />
            <Route path="records" element={<RecordsPage />} />
            <Route path="alerts" element={<AlertsPage />} />
            <Route path="tickets" element={<TicketsPage />} />
            <Route path="maintenance" element={<MaintenancePage />} />
            <Route path="usage-logs" element={<UsageLogsPage />} />
            <Route path="risk" element={
              <ProtectedRoute roles={['admin', 'technician']}><RiskPage /></ProtectedRoute>
            } />
            <Route path="feedback" element={<FeedbackPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="users" element={
              <ProtectedRoute roles={['admin']}><UsersPage /></ProtectedRoute>
            } />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
