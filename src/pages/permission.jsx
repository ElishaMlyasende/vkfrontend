import React, { useEffect, useState } from "react";

const BASE_URL = "http://localhost:8080/api/v1/permission";

function Permission() {
  const [permissions, setPermissions] = useState([]);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    const res = await fetch(`${BASE_URL}/permissions`);
    const data = await res.json();
    setPermissions(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `${BASE_URL}/update/${editingId}`
      : `${BASE_URL}/add`;

    await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    setFormData({ name: "", description: "" });
    setEditingId(null);
    loadPermissions();
  };

  const handleEdit = async (id) => {
    const res = await fetch(`${BASE_URL}/${id}`);
    const data = await res.json();
    setFormData({ name: data.name, description: data.description });
    setEditingId(id);
  };

  const handleDelete = async (id) => {
    await fetch(`${BASE_URL}/delete/${id}`, {
      method: "DELETE",
    });
    loadPermissions();
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h2>{editingId ? "Update Permission" : "Add Permission"}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Permission Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          style={{ display: "block", marginBottom: "10px", width: "100%" }}
        />
        <input
          type="text"
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          required
          style={{ display: "block", marginBottom: "10px", width: "100%" }}
        />
        <button type="submit">
          {editingId ? "Update Permission" : "Add Permission"}
        </button>
      </form>

      <h2 style={{ marginTop: "40px" }}>Permissions List</h2>
      <ul>
        {permissions.map((permission) => (
          <li key={permission.id} style={{ marginBottom: "10px" }}>
            <strong>{permission.name}</strong> - {permission.description}{" "}
            <button onClick={() => handleEdit(permission.id)}>Edit</button>{" "}
            <button onClick={() => handleDelete(permission.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Permission;
