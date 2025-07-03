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
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <a className="navbar-brand fw-bold" href="#">Dashboard</a>
          <span className="text-white me-3 fw-bold">
            Hi, {roles}, {username}
          </span>
          <button className="btn btn-outline-light fw-bold" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <div className="container-fluid">
        <div className="row min-vh-100">
          <nav className="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse border-end">
            <div className="position-sticky pt-3">
              <ul className="nav flex-column fw-bold">
                {menus.map((menu, idx) => (
                  <li className="nav-item" key={idx}>
                    <Link className="nav-link" to={menu.path}>
                      {menu.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4">
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
