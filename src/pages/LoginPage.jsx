import React, { useState } from "react";

function LoginPage() {
  const [logiForm, setLoginform] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const loginUser = async (username, password) => {
    const response = await fetch("http://13.48.138.226:8086/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error("login failed");
    }
    return response.json();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!logiForm.password.trim() || !logiForm.username.trim()) {
      setError("Make sure that all fields are filled");
      return;
    }
    try {
      const data = await loginUser(logiForm.username, logiForm.password);
      localStorage.setItem("token", data.token);
      window.location.href = "/DashboardPage";
      setError("");
    } catch (error) {
      setError("Invalid Login Credentials");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginform((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <>
      {/* Header */}
      <header className="bg-primary text-white py-3 shadow-sm">
        <div className="container">
          <h1 className="h3 mb-0">VK & COMPANY ADVOCATES</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="d-flex justify-content-center align-items-center vh-80 bg-light" style={{ minHeight: "80vh" }}>
        <form
          onSubmit={handleSubmit}
          className="p-5 bg-white rounded shadow"
          style={{ width: "100%", maxWidth: "400px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
        >
          <h2 className="mb-4 text-center fw-bold text-primary">Sign In</h2>

          {error && (
            <div className="alert alert-danger text-center" role="alert">
              {error}
            </div>
          )}

          <div className="mb-3">
            <label htmlFor="username" className="form-label fw-semibold">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Enter your username"
              className="form-control"
              value={logiForm.username}
              onChange={handleChange}
              autoComplete="username"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="form-label fw-semibold">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              className="form-control"
              value={logiForm.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100 fw-bold">
            Sign In
          </button>
        </form>
      </div>

      {/* Footer */}
      <footer className="bg-dark text-white py-3 mt-auto">
        <div className="container text-center">
          <small>&copy; {new Date().getFullYear()} VK & COMPANY ADVOCATES. All rights reserved.</small>
        </div>
      </footer>
    </>
  );
}

export default LoginPage;
