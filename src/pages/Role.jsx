import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

function RolePermission() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [checkedPermissions, setCheckedPermissions] = useState([]);
  const [activeRole, setActiveRole] = useState(null);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [roleFormData, setRoleFormData] = useState({ name: "", description: "" });
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [showUserModal, setShowUserModal] = useState(false);

  // Fetch all roles
  const fetchRoles = async () => {
    try {
      const res = await fetch("http://localhost:8082/api/v1/role/roles");
      const data = await res.json();
      setRoles(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch all permissions
  const fetchPermissions = async () => {
    try {
      const res = await fetch("http://localhost:8082/api/v1/permission/permissions");
      const data = await res.json();
      setPermissions(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:8082/api/v1/user/all");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
    fetchUsers();
  }, []);

  // Open role for permissions modal
  const openPermissionModal = async (role) => {
    if (!role?.id) return Swal.fire("Invalid role selected");
    try {
      const res = await fetch(`http://localhost:8082/api/v1/role/${role.id}`);
      const latestRole = await res.json();
      setActiveRole(latestRole);
      setCheckedPermissions(latestRole.permissions?.map((p) => p.id) || []);
    } catch (err) {
      console.error(err);
      Swal.fire("Failed to load role permissions", "", "error");
    }
  };

  // Open user selection form
  const openUserModal = async (role) => {
    if (!role?.id) return Swal.fire("Invalid role selected");
    try {
      const res = await fetch(`http://localhost:8082/api/v1/role/${role.id}`);
      const latestRole = await res.json();
      setActiveRole(latestRole);
      setSelectedUser("");
      setShowUserModal(true);
    } catch (err) {
      console.error(err);
      Swal.fire("Failed to load role", "", "error");
    }
  };

  // Save selected user to role
  const saveUser = async () => {
    if (!activeRole?.id || !selectedUser) return Swal.fire("Please select a user");

    try {
      const body = {
        roleId: activeRole.id,
        userId: selectedUser
      };

      const res = await fetch("http://localhost:8082/api/v1/user_Role/assign", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        const updatedRole = await fetch(`http://localhost:8082/api/v1/role/${activeRole.id}`).then(r => r.json());
        setRoles(roles.map(r => r.id === activeRole.id ? updatedRole : r));
        setShowUserModal(false);
        setActiveRole(null);
        Swal.fire("User assigned successfully");
      } else {
        Swal.fire("Failed to assign user", "", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Request failed", "", "error");
    }
  };

  // Toggle permission checkbox
  const togglePermission = (id) => {
    if (checkedPermissions.includes(id)) {
      setCheckedPermissions(checkedPermissions.filter(pid => pid !== id));
    } else {
      setCheckedPermissions([...checkedPermissions, id]);
    }
  };

  // Save permissions
  const savePermissions = async () => {
    if (!activeRole?.id) return Swal.fire("No role selected");

    try {
      const idsPath = checkedPermissions.join(",");
      const res = await fetch(
        `http://localhost:8082/api/v1/user/role-permission/update/${activeRole.id}/${idsPath}`,
        { method: "PUT" }
      );

      if (res.ok) {
        const updatedRole = await fetch(`http://localhost:8082/api/v1/role/${activeRole.id}`).then(r => r.json());
        setRoles(roles.map(r => r.id === activeRole.id ? updatedRole : r));
        setActiveRole(null);
        setCheckedPermissions([]);
        Swal.fire("Permissions updated successfully");
      } else {
        Swal.fire("Failed to update permissions", "", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Request failed", "", "error");
    }
  };

  // Add new role
  const handleAddRole = async (e) => {
    e.preventDefault();
    if (!roleFormData.name) return Swal.fire("Role name is required");

    try {
      const res = await fetch("http://localhost:8082/api/v1/role/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roleFormData),
      });

      if (res.ok) {
        const newRole = await res.json();
        setRoles([...roles, newRole]);
        setShowRoleForm(false);
        setRoleFormData({ name: "", description: "" });
        Swal.fire("Role added successfully");
      } else {
        Swal.fire("Error saving role", "", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Request failed", "", "error");
    }
  };

  return (
    <div>
      {/* Create Role */}
      <button
        className="btn btn-primary mb-4"
        onClick={() => setShowRoleForm(!showRoleForm)}
      >
        CREATE ROLE
      </button>

      {showRoleForm && (
        <form onSubmit={handleAddRole} style={{ marginBottom: "20px" }}>
          <input
            type="text"
            placeholder="Role Name"
            value={roleFormData.name}
            onChange={(e) => setRoleFormData({ ...roleFormData, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Description"
            value={roleFormData.description}
            onChange={(e) => setRoleFormData({ ...roleFormData, description: e.target.value })}
          />
          <button type="submit" className="btn btn-success">Save</button>
        </form>
      )}

      {/* Roles Table */}
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Role</th>
            <th>Permission</th>
            <th>User</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => (
            <tr key={role.id}>
              <td>{role.name}</td>
              <td>
                <button className="btn btn-success" onClick={() => openPermissionModal(role)}>
                  Set Permission
                </button>
              </td>
              <td>
                <button className="btn btn-success" onClick={() => openUserModal(role)}>
                  Add User
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Permissions Modal */}
      {activeRole && (
        <div style={{ border: "1px solid #ccc", padding: "10px", marginTop: "20px" }}>
          <h4>{activeRole.name} Permissions</h4>
          {permissions.map((perm) => (
            <div key={perm.id}>
              <input
                type="checkbox"
                checked={checkedPermissions.includes(perm.id)}
                onChange={() => togglePermission(perm.id)}
              />
              {perm.name}
            </div>
          ))}
          <button className="btn btn-success me-2" onClick={savePermissions}>Save Permissions</button>
          <button className="btn btn-warning" onClick={() => {
            setActiveRole(null);
            setCheckedPermissions([]);
          }}>Cancel</button>
        </div>
      )}

      {/* User Selection Modal */}
      {showUserModal && activeRole && (
        <div style={{ border: "1px solid #ccc", padding: "10px", marginTop: "20px" }}>
          <h4>Assign User to {activeRole.name}</h4>
          <select
            className="form-select"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            <option value="">-- Select User --</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.first_name} {u.last_name} ({u.email})
              </option>
            ))}
          </select>
          <div className="mt-2">
            <button className="btn btn-success me-2" onClick={saveUser}>
              Save
            </button>
            <button className="btn btn-warning" onClick={() => setShowUserModal(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RolePermission;
