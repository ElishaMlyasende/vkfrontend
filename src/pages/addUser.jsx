import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";

const initialForm = {
  first_name: "",
  middle_name: "",
  last_name: "",
  username: "",
  email: "",
  phone_number: "",
  password: "",
  roles: [],
  permissions: [],
};

const AddUser = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchUsers = async () => {
    const res = await fetch("http://localhost:8082/api/v1/user/all");
    const data = await res.json();
    setUsers(data);
  };

  const fetchRoles = async () => {
    const res = await fetch("http://localhost:8082/api/role/roles");
    const data = await res.json();
    setRoles(data);
  };

  const fetchPermissions = async () => {
    const res = await fetch("http://localhost:8082/api/permission/permissions");
    const data = await res.json();
    setPermissions(data);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleMultiSelect = (e) => {
    const { name, options } = e.target;
    const values = Array.from(options)
      .filter((o) => o.selected)
      .map((o) => ({ id: o.value }));
    setFormData({ ...formData, [name]: values });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `http://localhost:8082/api/v1/user/Edit/${editingId}`
      : "http://localhost:8082/api/v1/user/add";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      Swal.fire("Success", `User ${editingId ? "updated" : "added"}`, "success");
      setFormData(initialForm);
      setEditingId(null);
      fetchUsers();
    } else {
      Swal.fire("Error", "Something went wrong", "error");
    }
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setFormData({
      ...user,
      roles: user.roles.map((r) => r.id),
      permissions: user.permissions.map((p) => p.id),
    });
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete User?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });
    if (!result.isConfirmed) return;

    const res = await fetch(`http://localhost:8082/api/v1/user/remove/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      Swal.fire("Deleted", "User deleted", "success");
      fetchUsers();
    } else {
      Swal.fire("Error", "Delete failed", "error");
    }
  };

  return (
    <div className="container mt-5">
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="row">
          {Object.keys(initialForm).filter(key => !["roles", "permissions"].includes(key)).map((key) => (
            <div className="col-md-4 mb-3" key={key}>
              <label>{key.replace("_", " ").toUpperCase()}</label>
              <input
                type="text"
                className="form-control"
                name={key}
                value={formData[key]}
                onChange={handleChange}
                required
              />
            </div>
          ))}
          <div className="col-md-4 mb-3">
            <label>Roles</label>
            <select
              name="roles"
              multiple
              className="form-control"
              value={formData.roles.map(r => r.id || r)}
              onChange={handleMultiSelect}
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <div className="col-md-4 mb-3">
            <label>Permissions</label>
            <select
              name="permissions"
              multiple
              className="form-control"
              value={formData.permissions.map(p => p.id || p)}
              onChange={handleMultiSelect}
            >
              {permissions.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
        <button className="btn btn-success">{editingId ? "Update" : "Add"} User</button>
      </form>

      <table className="table table-bordered">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Username</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.first_name} {u.middle_name} {u.last_name}</td>
              <td>{u.username}</td>
              <td>{u.email}</td>
              <td>{u.phone_number}</td>
              <td>
                <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(u)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AddUser;
