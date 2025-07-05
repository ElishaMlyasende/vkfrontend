import React, { useState, useEffect } from "react";

const BASE_URL = "http://localhost:8082/api/v1/user/user_menu";
const USERS_URL = "http://localhost:8082/api/v1/user/all"; // adjust your user api url
const MENUS_URL = "http://localhost:8082/menu/all"; // adjust your menu api url

function UserMenu() {
  const [users, setUsers] = useState([]);
  const [menus, setMenus] = useState([]);

  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedMenuIds, setSelectedMenuIds] = useState([]);
  const [action, setAction] = useState("add");

  // Fetch users and menus on mount
  useEffect(() => {
    fetchUsers();
    fetchMenus();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(USERS_URL);
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  const fetchMenus = async () => {
    try {
      const res = await fetch(MENUS_URL);
      const data = await res.json();
      setMenus(data);
    } catch (err) {
      console.error("Failed to fetch menus", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedUserId || selectedMenuIds.length === 0) {
      alert("Please select a user and at least one menu.");
      return;
    }

    const queryParams =
      action === "add"
        ? `user_id=${selectedUserId}&menuIds=${selectedMenuIds.join(",")}`
        : `id=${selectedUserId}&menuIds=${selectedMenuIds.join(",")}`;

    let method = "POST";
    if (action === "update") method = "PUT";
    if (action === "remove") method = "DELETE";

    try {
      const res = await fetch(`${BASE_URL}/${action}?${queryParams}`, {
        method,
      });

      if (res.ok) {
        alert(`Successfully ${action}ed user menu`);
        setSelectedUserId("");
        setSelectedMenuIds([]);
      } else {
        alert("Something went wrong");
      }
    } catch (err) {
      console.error(err);
      alert("Error occurred");
    }
  };

  // handle menu multi-select change
  const handleMenuChange = (e) => {
    const options = e.target.options;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) selected.push(options[i].value);
    }
    setSelectedMenuIds(selected);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h2>User Menu Management</h2>
      <form onSubmit={handleSubmit}>
        <label>User:</label>
        <select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          required
          style={{ display: "block", marginBottom: "10px", width: "100%" }}
        >
          <option value="">-- Select User --</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.first_name} {user.middle_name} {user.last_name}
            </option>
          ))}
        </select>

        <label>Menus:</label>
        <select
          multiple
          value={selectedMenuIds}
          onChange={handleMenuChange}
          required
          style={{ display: "block", marginBottom: "10px", width: "100%", height: "150px" }}
        >
          {menus.map((menu) => (
            <option key={menu.id} value={menu.id}>
              {menu.title}
            </option>
          ))}
        </select>

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
