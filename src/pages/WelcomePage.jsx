import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./LoginPage";
import DashboardPage from "./DashboardPage";

function WelcomePage() {
  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? <DashboardPage /> : <Navigate to="/" />
          }
        />
      </Routes>
    </Router>
  );
}

export default WelcomePage;
