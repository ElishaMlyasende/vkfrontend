import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import NotFound from './pages/NotFound';

export default function App() {
  const token = localStorage.getItem("token");

  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={token ? <Navigate to="/" /> : <LoginPage />} />

      {/* Protected Routes */}
      <Route path="/*" element={token ? <DashboardPage /> : <Navigate to="/login" />} />

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
