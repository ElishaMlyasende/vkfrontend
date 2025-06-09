import React, { useEffect, useState } from "react";
import {jwtDecode} from "jwt-decode"; // ✅ Remove curly braces: use `jwtDecode` not `{ jwtDecode }`

function DashboardPage() {
  const [username, setUsername] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token"); // ✅ Use the string "token"
    if (token) {
      try {
        const decoded = jwtDecode(token); // ✅ Decode safely inside useEffect
        setUsername(decoded.sub || decoded.name); // fallback name
      } catch (error) {
        console.error("Invalid token:", error);
      }
    }
  }, []); // ✅ Only run once on component mount

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/"; // redirect to login
  };

  return (
    <>
      {/* Top Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <a className="navbar-brand fw-bold" href="#">
            Dashboard
          </a>
          <span className="text-white me-3 fw-bold">Hi, {username}</span>
          <button
            className="btn btn-outline-light fw-bold"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main container */}
      <div className="container-fluid">
        <div className="row min-vh-100">
          {/* Sidebar */}
          <nav className="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse border-end">
            <div className="position-sticky pt-3">
              <ul className="nav flex-column fw-bold">
                <li className="nav-item">
                  <a className="nav-link active" href="#">
                    <i className="bi bi-house-door-fill me-2"></i> Home
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#">
                    <i className="bi bi-person-fill me-2"></i> Profile
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#">
                    <i className="bi bi-gear-fill me-2"></i> Settings
                  </a>
                </li>
              </ul>
            </div>
          </nav>

          {/* Main content */}
          <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4">
            <h1 className="h2 mb-4">Welcome to the Dashboard, {username}</h1>

            <div className="card shadow-lg">
              <div className="card-body">
                <h5 className="card-title">Dashboard Overview</h5>
                <p className="card-text">
                  This is your main dashboard area where you can display
                  reports, stats, or anything you like.
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

export default DashboardPage;
