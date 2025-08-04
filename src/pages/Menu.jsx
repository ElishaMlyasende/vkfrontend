import React, { useEffect, useState } from "react";

const BASE_URL = "http://localhost:8080/menu";

function Menu() {
  const [menus, setMenus] = useState([]);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadMenus();
  }, []);

  const loadMenus = async () => {
    const res = await fetch(`${BASE_URL}/all`);
    const data = await res.json();
    setMenus(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingId) {
      await fetch(`${BASE_URL}/update/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      setEditingId(null);
    } else {
      await fetch(`${BASE_URL}/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
    }

    setFormData({ name: "", description: "" });
    loadMenus();
  };

  const handleDelete = async (id) => {
    await fetch(`${BASE_URL}/delete/${id}`, {
      method: "DELETE"
    });
    loadMenus();
  };

  const handleEdit = (menu) => {
    setFormData({ name: menu.name, description: menu.description });
    setEditingId(menu.id);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h2>{editingId ? "Update Menu" : "Add Menu"}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Menu Name"
          value={formData.name}
          onChange={(e) =>
            setFormData({ ...formData, name: e.target.value })
          }
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
          {editingId ? "Update Menu" : "Add Menu"}
        </button>
      </form>

      <h2 style={{ marginTop: "40px" }}>Menu List</h2>
      <ul>
        {menus.map((menu) => (
          <li key={menu.id} style={{ marginBottom: "10px" }}>
            <strong>{menu.name}</strong> - {menu.description}{" "}
            <button onClick={() => handleEdit(menu)}>Edit</button>{" "}
            <button onClick={() => handleDelete(menu.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Menu;
