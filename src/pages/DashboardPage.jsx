import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { Link } from "react-router-dom";
import DynamicRoutes from "./DynamicRoutes";

export default function DashboardPage() {
  const [username, setUsername] = useState("");
  const [roles, setRoles] = useState("");
  const [menus, setMenus] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUsername(decoded.sub || decoded.name);
        setRoles(decoded.Roles?.[0] || "");
        setMenus(decoded.menus || []);
      } catch (error) {
        console.error("Invalid token", error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <>
      {/* Navbar */}
      <nav className="navbar navbar-dark bg-black sticky-top shadow-sm bg">
        <div className="container-fluid">
          <span className="navbar-brand fw-bold">Dashboard</span>
          <div className="d-flex align-items-center gap-3">
            <span className="text-white small">
              <i className="bi bi-person-circle me-1"></i>
              {roles} - {username}
            </span>
            <button className="btn btn-light btn-sm" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right me-1"></i> Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Body */}
      <div className="container-fluid bg-white">
        <div className="row">
          {/* Sidebar */}
          <nav
            id="sidebarMenu"
            className="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse border-end"
          >
            <div className="position-sticky pt-4">
              <ul className="nav flex-column small px-3">
                {menus.map((menu, idx) => (
                  <li className="nav-item" key={idx}>
                    <Link
                      className="nav-link link-dark py-2 px-3 rounded mb-1"
                      to={menu.path}
                      style={{
                        fontSize: "0.875rem",
                        transition: "all 0.2s ease-in-out",
                      }}
                    >
                      <i className="bi bi-menu-button-wide me-2 text-primary"></i>
                      {menu.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* Main content */}
          <main className="col-md-9 ms-sm-auto col-lg-10  bg-white px-md-4 py-4">
            {menus.length > 0 ? (
              <DynamicRoutes menus={menus} />
            ) : (
              <p>Loading...</p>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
