import React from "react";

function DashboardPage() {
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/"; // redirect to login
  };

  return (
    <div className="container mt-5">
      <h2>Welcome to the Dashboard</h2>
      <nav>
        <ul>
          <li><a href="#">Home</a></li>
          <li><a href="#">Profile</a></li>
          <li><a href="#">Settings</a></li>
          <li><button onClick={handleLogout}>Logout</button></li>
        </ul>
      </nav>
    </div>
  );
}

export default DashboardPage;
