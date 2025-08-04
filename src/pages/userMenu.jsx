import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const BASE_URL = "http://localhost:8082/api/v1/user/user_menu";
const USERS_URL = "http://localhost:8082/api/v1/user/all";
const MENUS_URL = "http://localhost:8082/menu/all";

function UserMenu() {
  const [users, setUsers] = useState([]);
  const [menus, setMenus] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedMenuIds, setSelectedMenuIds] = useState([]);
  const [action, setAction] = useState("add");

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

  const handleMenuChange = (e) => {
    const options = e.target.options;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) selected.push(options[i].value);
    }
    setSelectedMenuIds(selected);
  };

  return (
    <div className="container mt-5">
      <div className="card shadow">
        <div className="card-header bg-primary text-white">
          <h4 className="mb-0">User Menu Management</h4>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Select User:</label>
              <select
                className="form-select"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                required
              >
                <option value="">-- Select User --</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.first_name} {user.middle_name} {user.last_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Select Menus:</label>
              <select
                className="form-select"
                multiple
                value={selectedMenuIds}
                onChange={handleMenuChange}
                required
                style={{ height: "150px" }}
              >
                {menus.map((menu) => (
                  <option key={menu.id} value={menu.id}>
                    {menu.title}
                  </option>
                ))}
              </select>
              <div className="form-text">Hold Ctrl or Cmd to select multiple</div>
            </div>

            <div className="mb-3">
              <label className="form-label">Action:</label>
              <select
                className="form-select"
                value={action}
                onChange={(e) => setAction(e.target.value)}
              >
                <option value="add">Add</option>
                <option value="update">Update</option>
                <option value="remove">Remove</option>
              </select>
            </div>

            <button type="submit" className="btn btn-success w-100">
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UserMenu;
