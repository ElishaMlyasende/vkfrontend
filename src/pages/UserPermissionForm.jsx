import React, { useState } from "react";

const BASE_URL = "http://13.48.138.226:8080/api/v1/user/user-permission";

function UserPermissionForm() {
  const [userId, setUserId] = useState("");
  const [permissionIds, setPermissionIds] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const query = `user_id=${userId}&permission_id=${permissionIds}`;

    const response = await fetch(`${BASE_URL}/add?${query}`, {
      method: "POST",
    });

    if (response.ok) {
      alert("User Permission added successfully!");
      setUserId("");
      setPermissionIds("");
    } else {
      alert("Failed to add user permission.");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h2>Add User Permission</h2>
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
          placeholder="Permission IDs (comma-separated)"
          value={permissionIds}
          onChange={(e) => setPermissionIds(e.target.value)}
          required
          style={{ display: "block", marginBottom: "10px", width: "100%" }}
        />
        <button type="submit">Add</button>
      </form>
    </div>
  );
}

export default UserPermissionForm;
