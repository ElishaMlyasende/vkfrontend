import React, { useState } from "react";

function LoginPage() {
  const [logiForm, setLoginform] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const loginUser = async (username, password) => {

    const response = await fetch("http://localhost:8086/auth/login", {
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
    if(!logiForm.password.trim()|| !logiForm.username.trim()){
      setError("Make sure that all field are filled");
      return;
    }
    try {
      const data = await loginUser(logiForm.username, logiForm.password);
      localStorage.setItem("token", data.token);
      alert("Successfully logged in");
      setError("")
      console.log(data.token);
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
    
  <div>
      
     <div className="d-flex justify-content-center align-items-center vh-100 bg-silver">
     
     <form
       className="p-4 bg-gray rounded shadow"
       style={{ width: "100%", maxWidth: "400px" }}
       onSubmit={handleSubmit}
     >
       {error && <div className="alert alert-danger">{error}</div>}
       
       <div className="form-group mb-3">
         <label className="form-label fw-bold text-gray">Username</label>
         <input
           className="form-control"
           type="text"
           name="username"
           placeholder="Enter username"
           value={logiForm.username}
           onChange={handleChange}
         />
       </div>

       <div className="mb-3 form-group">
         <label className="form-label fw-bold">Password</label>
         <input
           className="form-control"
           type="password"
           name="password"
           placeholder="Enter password"
           value={logiForm.password}
           onChange={handleChange}
         />
       </div>

       <button className="btn btn-primary w-100" type="submit">
         Sign in
       </button>
     </form>
   </div>
  </div>
   
  );
}

export default LoginPage;
