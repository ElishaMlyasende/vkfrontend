import React, { useState } from "react";

const BASE_URL = "http://localhost:8080/api/v1/user/user_menu";

function UserMenuForm() {
  const [userId, setUserId] = useState("");
  const [menuIds, setMenuIds] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const query = `user_id=${userId}&menuIds=${menuIds}`;

    const response = await fetch(`${BASE_URL}/add?${query}`, {
      method: "POST",
    });

    if (response.ok) {
      alert("User Menu added successfully!");
      setUserId("");
      setMenuIds("");
    } else {
      alert("Failed to add user menu.");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h2>Add User Menu</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
          style={{ display: "block", marginBottom: "10px", width: "100%" }}
        />
        <input
          type="text"
          placeholder="Menu IDs (comma-separated)"
          value={menuIds}
          onChange={(e) => setMenuIds(e.target.value)}
          required
          style={{ display: "block", marginBottom: "10px", width: "100%" }}
        />
        <button type="submit">Add</button>
      </form>
    </div>
  );
}

export default UserMenuForm;
