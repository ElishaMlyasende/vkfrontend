import React, { useState, useEffect } from "react";

const BASE_URL = "http://localhost:8080/api/v1/user/user-permission";

function UserPermission() {
  const [userId, setUserId] = useState("");
  const [permissionIds, setPermissionIds] = useState("");
  const [action, setAction] = useState("add");
  const [userPermissions, setUserPermissions] = useState([]);
  const [singleUserPermissions, setSingleUserPermissions] = useState(null);

  useEffect(() => {
    loadAllUserPermissions();
  }, []);

  const loadAllUserPermissions = async () => {
    const res = await fetch(`${BASE_URL}/all`);
    const data = await res.json();
    setUserPermissions(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const parsedPermissionIds = permissionIds
      .split(",")
      .map((id) => parseInt(id.trim()))
      .filter((id) => !isNaN(id));

    if (!userId || parsedPermissionIds.length === 0) {
      alert("Please enter a valid user ID and permission IDs");
      return;
    }

    const query = `user_id=${userId}&permission_id=${parsedPermissionIds.join(",")}`;
    let method = "POST";
    if (action === "update") method = "PUT";
    if (action === "delete") method = "DELETE";

    const res = await fetch(`${BASE_URL}/${action}?${query}`, {
      method,
    });

    if (res.ok) {
      alert(`Successfully ${action}ed permissions`);
      setUserId("");
      setPermissionIds("");
      loadAllUserPermissions();
    } else {
      alert("Action failed.");
    }
  };

  const handleGetSingleUserPermissions = async () => {
    if (!userId) {
      alert("Enter user ID first");
      return;
    }
    const res = await fetch(`${BASE_URL}/${userId}`);
    const data = await res.json();
    setSingleUserPermissions(data);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "auto" }}>
      <h2>User Permission Management</h2>

      <form onSubmit={handleSubmit}>
        <label>User ID:</label>
        <input
          type="number"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
          style={{ width: "100%", marginBottom: "10px" }}
        />

        <label>Permission IDs (comma-separated):</label>
        <input
          type="text"
          value={permissionIds}
          onChange={(e) => setPermissionIds(e.target.value)}
          placeholder="e.g. 1,2,3"
          required
          style={{ width: "100%", marginBottom: "10px" }}
        />

        <label>Action:</label>
        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          style={{ width: "100%", marginBottom: "10px" }}
        >
          <option value="add">Add</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
        </select>

        <button type="submit">Submit</button>
      </form>

      <hr />

      <div>
        <h3>Get Single User Permissions</h3>
        <button onClick={handleGetSingleUserPermissions}>
          Load Permissions for User ID {userId || "(enter above)"}
        </button>

        {singleUserPermissions && (
          <div style={{ marginTop: "10px" }}>
            <h4>User ID: {userId}</h4>
            <ul>
              {singleUserPermissions.map((perm, index) => (
                <li key={index}>
                  <strong>{perm.name}</strong> - {perm.description}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <hr />

      <h3>All Users with Permissions</h3>
      <ul>
        {userPermissions.map((userPerm, index) => (
          <li key={index} style={{ marginBottom: "10px" }}>
            <strong>User:</strong> {userPerm.username || `ID: ${userPerm.userId}`}
            <ul>
              {userPerm.permissions.map((perm, i) => (
                <li key={i}>
                  {perm.name} - {perm.description}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
