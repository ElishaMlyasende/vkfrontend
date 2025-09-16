import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

function RolePermission() {
  const [Role, setRole] = useState([]);
  const [Permission, setPermission] = useState([]);
  const [Checked, setChecked] = useState([]);
  const [ActiveRole, setActiveRole] = useState(null);
  const[ShowForm,setShowForm]=useState(false);
  const[initialiFormData,setInitialFormData]=useState({"name":"","description":""})
  const[isEditing,setIsEditing]=useState(false);

  const fetchRoles = async () => {
    const res = await fetch("http://localhost:8082/api/v1/role/roles");
    const data = await res.json();
    setRole(data);
  };

  const fetchPermission = async () => {
    const res = await fetch("http://localhost:8082/api/v1/permission/permissions");
    const data = await res.json();
    setPermission(data);
  };

  useEffect(() => {
    fetchRoles();
    fetchPermission();
  }, []);

  const openRole = (roles) => {
    setActiveRole(roles);
    setChecked(roles.permissions.map((p) => p.id));
  };

  const save = async () => {
    const idsPath = Checked.join(",");
    await fetch(
      `http://localhost:8082/api/v1/user/role-permission/update/${ActiveRole.id}/${idsPath}`,
      { method: "PUT" }
    );

    const UpdatedRoles = Role.map((r) =>
      r.id === ActiveRole.id
        ? { ...r, permissions: Permission.filter((p) => Checked.includes(p.id)) }
        : r
    );

    setRole(UpdatedRoles);
    setActiveRole(null);
  };

  const toggle = (id) => {
    if (Checked.includes(id)) {
      setChecked(Checked.filter((pid) => pid !== id));
    } else {
      setChecked([...Checked, id]);
    }
  };
  const handleSubmission = async (e) => {
    e.preventDefault(); // prevent refresh
  
    try {
      const res = await fetch("http://localhost:8082/api/v1/role/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(initialiFormData),
      });
  
      if (res.ok) {
        const newRole = await res.json(); // make sure backend returns Role object
        Swal.fire("Role Added Successfully");
        setRole([...Role, newRole]); // add new role to state
        setShowForm(false);
        setInitialFormData({ name: "", description: "" }); // clear form
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
        <button className="btn btn-primary mb-4" onClick={()=>setShowForm(!ShowForm)}
            style={{ boxShadow: "2px 2px 5px rgba(0,0,0,0.3)", borderRadius: "8px" }}>CREATE ROLE</button>
        {ShowForm &&(
            <div>
                <form>
                    <div className="form-group">
                        <label className="form-label">Role Name</label>
                        <input className="form-control" type="text" placeholder="Advocate"
                         onChange={(e)=>setInitialFormData({...initialiFormData,name:e.target.value})}
                         value={initialiFormData.name}/>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <input className="form-control" type="text" placeholder="Registering Staff"
                         onChange={(e)=>setInitialFormData({...initialiFormData,description:e.target.value})}
                         value={initialiFormData.description}/>
                    </div>
                    <button className="btn btn-success mb-4" type="button" onClick={handleSubmission}>Save</button>
                    
                </form>
            </div>
        )}
      <table className="table  table-striped table-responsive table-primary">
        <thead className="table-primary">
          <tr>
            <th>Role</th>
            <th>Permission</th>
            <th>User</th>
          </tr>
        </thead>
        <tbody>
          {Role.map((roles, idx) => (
            <tr key={idx}>
              <td>{roles.name}</td>
              <td>
                <button
                  className="btn btn-success"
                  onClick={() => openRole(roles)}
                >
                  Set Permission
                </button>
              </td>
              <td>
                <button
                  className="btn btn-success"
                >
                  Add User
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Only show if ActiveRole is not null */}
      {ActiveRole && (
        <div>
          <h4>{ActiveRole.name} Permissions</h4>
          {Permission.map((perm) => (
            <div key={perm.id}>
              <input
                type="checkbox"
                checked={Checked.includes(perm.id)}
                onChange={() => toggle(perm.id)}
              />
              {perm.name}
            </div>
          ))}

          <button className="btn btn-success ml-4" onClick={save}>SAVE</button>
          <button className="btn btn-warning ml-5" onClick={() => setActiveRole(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
}

export default RolePermission;
