import React, { useState } from "react";

const BASE_URL = "http://localhost:8080/api/v1/user/user_menu";

function UserMenu() {
  const [userId, setUserId] = useState("");
  const [menuIds, setMenuIds] = useState("");
  const [action, setAction] = useState("add");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const menuIdList = menuIds
      .split(",")
      .map((id) => parseInt(id.trim()))
      .filter((id) => !isNaN(id));

    if (!userId || menuIdList.length === 0) {
      alert("Please enter valid user ID and menu IDs");
      return;
    }

    const queryParams =
      action === "add"
        ? `user_id=${userId}&menuIds=${menuIdList.join(",")}`
        : `id=${userId}&menuIds=${menuIdList.join(",")}`;

    let method = "POST";
    if (action === "update") method = "PUT";
    if (action === "remove") method = "DELETE";

    try {
      const res = await fetch(`${BASE_URL}/${action}?${queryParams}`, {
        method,
      });

      if (res.ok) {
        alert(`Successfully ${action}ed user menu`);
        setUserId("");
        setMenuIds("");
      } else {
        alert("Something went wrong");
      }
    } catch (err) {
      console.error(err);
      alert("Error occurred");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h2>User Menu Management</h2>
      <form onSubmit={handleSubmit}>
        <label>User ID:</label>
        <input
          type="number"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
          style={{ display: "block", marginBottom: "10px", width: "100%" }}
        />

        <label>Menu IDs (comma separated):</label>
        <input
          type="text"
          value={menuIds}
          onChange={(e) => setMenuIds(e.target.value)}
          placeholder="e.g. 1,2,3"
          required
          style={{ display: "block", marginBottom: "10px", width: "100%" }}
        />

        <label>Action:</label>
        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          style={{ display: "block", marginBottom: "10px", width: "100%" }}
        >
          <option value="add">Add</option>
          <option value="update">Update</option>
          <option value="remove">Remove</option>
        </select>

        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default UserMenu;
