import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";

const initialForm = {
  first_name: "",
  middle_name: "",
  last_name: "",
  username: "",
  email: "",
  phone_number: "",
  password: "",
};

const AddUser = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [userId, setUserId] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:8082/api/v1/user/all");
      const text = await res.text();
      const data = JSON.parse(text);
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        console.error("Expected array, got:", data);
        setUsers([]);
      }
    } catch (err) {
      setError("Error fetching users");
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You want to ${isEditing ? "update" : "add"} this user?`,
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    });

    if (!result.isConfirmed) return;

    const method = isEditing ? "PUT" : "POST";
    const url = isEditing
      ? `http://localhost:8082/api/v1/user/Edit/${editingId}`
      : "http://localhost:8082/api/v1/user/add";

    const payload = { ...formData };
    if (isEditing) delete payload.password;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const message = await res.text();
      if (!res.ok) throw new Error(message || "Failed to save user");

      Swal.fire("Success", message, "success");
      setFormData(initialForm);
      setShowForm(false);
      setIsEditing(false);
      setEditingId(null);
      fetchUsers();
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  const handleEdit = (user) => {
    setFormData(user);
    setEditingId(user.id);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this user?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`http://localhost:8082/api/v1/user/remove/${id}`, {
        method: "DELETE",
      });

      const message = await res.text();
      if (!res.ok) throw new Error(message || "Failed to delete");

      Swal.fire("Success", message, "success");
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };
  const handlePasswordChange = async (e, userId) => {
    e.preventDefault();
  
    console.log("New Password:", newPassword); // <<< Hapa
    console.log("Confirm Password:", confirmPassword); // <<< Hapa
  
    if (!newPassword || !confirmPassword) {
      Swal.fire("Error", "Password cannot be empty", "error");
      return;
    }
  
    if (newPassword !== confirmPassword) {
      Swal.fire("Error", "Passwords do not match", "error");
      return;
    }
  
    try {
      const res = await fetch(
        `http://localhost:8082/api/v1/user/Password/Edit/${userId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: newPassword }),
        }
      );
  
      const message = await res.text();
  
      if (res.ok) {
        Swal.fire("Success", message, "success");
        setShowPasswordForm(false);
        setNewPassword("");
        setConfirmPassword("");
      } else {
        throw new Error(message || "Failed to update password");
      }
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };
  
  

  const filteredUsers = users.filter((u) =>
    Object.values(u).join(" ").toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { name: "ID", selector: (row) => row.id, sortable: true, width: "80px" },
    {
      name: "Full Name",
      selector: (row) =>
        `${row.first_name || ""} ${row.middle_name || ""} ${row.last_name || ""}`,
      wrap: true,
      sortable: true,
    },
    { name: "Username", selector: (row) => row.username, wrap: true },
    { name: "Email", selector: (row) => row.email, wrap: true },
    { name: "Phone", selector: (row) => row.phone_number, wrap: true },
    {
      name: "Actions",
      cell: (row) => (
        <>
          <button
            className="btn btn-warning btn-sm me-2"
            onClick={() => handleEdit(row)}
          >
            Edit
          </button>
          <button
            className="btn btn-danger btn-sm me-2"
            onClick={() => handleDelete(row.id)}
          >
            Delete
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              setUserId(row.id);
              setShowPasswordForm(true);
            }}
          >
            Change Password
          </button>
        </>
      ),
    },
  ];

  return (
    <div className="container mt-5">
      <h3 className="mb-4">Manage System Users</h3>

      {showPasswordForm && (
        <div>
          <form
            className="border p-4 mb-4 rounded bg-light shadow-sm"
            onSubmit={(e) => handlePasswordChange(e, userId)}
          >
            <div className="row mb-3">
              <label className="form-label">New Password</label>
              <input
                type="password"
                value={newPassword}
                className="form-control"
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="row mb-3">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                className="form-control"
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            
              <button type="submit" className="btn btn-primary me-2">
                Submit
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowPasswordForm(false);
                  setNewPassword("");
                  setConfirmPassword("");
                }}
              >
                Cancel
              </button>
            
          </form>
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="border p-4 mb-4 rounded bg-light shadow-sm"
        >
          <div className="row">
            {Object.keys(initialForm).map((key, idx) => {
              if (key === "password" && isEditing) return null;
              return (
                <div className="col-md-4 mb-3" key={idx}>
                  <label className="form-label">
                    {key.replace(/_/g, " ").toUpperCase()}
                  </label>
                  <input
                    type={key === "password" ? "password" : "text"}
                    name={key}
                    value={formData[key] || ""}
                    onChange={handleChange}
                    className="form-control"
                    required={["first_name", "username", "email"].includes(key)}
                  />
                </div>
              );
            })}
          </div>
          <button type="submit" className="btn btn-success me-2">
            {isEditing ? "Update" : "Save"}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setShowForm(false);
              setFormData(initialForm);
              setIsEditing(false);
              setEditingId(null);
            }}
          >
            Cancel
          </button>
        </form>
      )}

      <button
        className="btn btn-primary mb-3"
        onClick={() => {
          setShowForm(!showForm);
          setFormData(initialForm);
          setIsEditing(false);
          setEditingId(null);
        }}
      >
        {showForm ? "Cancel" : "Add User"}
      </button>

      {error && <p className="text-danger">{error}</p>}

      <DataTable
        columns={columns}
        data={filteredUsers}
        pagination
        striped
        highlightOnHover
        responsive
        subHeader
        subHeaderComponent={
          <input
            type="text"
            className="form-control w-50"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        }
      />
    </div>
  );
};

export default AddUser;
