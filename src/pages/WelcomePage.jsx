import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DashboardPage from "./DashboardPage";

function WelcomePage() {
  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <Routes>
      <Route
        path="dashboard"
        element={
          isAuthenticated ? <DashboardPage /> : <Navigate to="/" />
        }
      />
      {/* Optionally handle unknown subroutes */}
      <Route path="*" element={<Navigate to="dashboard" />} />
    </Routes>
  );
}

export default WelcomePage;
