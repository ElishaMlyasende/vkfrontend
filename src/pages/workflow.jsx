import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

// 🟢 Initial Form Data
const initialFormData = {
  firstName: "",
  middleName: "",
  lastName: "",
  typeOfWork: "",
  dateReceivedFromBank: "",
  dateSubmittedToRegistrar: "",
  registryName: "",
  dateCollected: "",
  submissionToBankAndOfficer: "",
  agreedFee: "",
  controlNumber: "",
  amount: "",
  facilitationFee: "",
  contactPerson: "",
  remarks: "",
  profit: "",
};

const WorkFlow = () => {
  // 🟡 State Management
  const [workData, setWorkData] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // 🟠 Input Handler
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔵 Fetch Data
  const fetchWorkFlow = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:9092/Client/api/all");
      if (!res.ok) throw new Error("Failed to fetch data");
      const data = await res.json();
      setWorkData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔴 Form Submit (Add / Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = isEditing
      ? `http://localhost:9092/Client/api/edit/${formData.id}`
      : "http://localhost:9092/Client/api/add";

    const method = isEditing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method:method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save record");
      const updatedData = await res.json();

      if (isEditing) {
        setWorkData((prev) =>
          prev.map((item) => (item.id === updatedData.id ? updatedData : item))
        );
      } else {
        setWorkData((prev) => [...prev, updatedData]);
      }

      resetForm();
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  // ⚫ Edit Button
  const handleEdit = (item) => {
    setIsEditing(true);
    setFormData(item);
    setShowForm(true);
  };

  // ⚪ Delete Button
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      cancelButtonText:"No",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`http://localhost:9092/client/api/delete/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");
      setWorkData((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  // 🔵 Reset Form 
  const resetForm = () => {
    setFormData(initialFormData);
    setIsEditing(false);
    setShowForm(false);
  };

  // 🟢 Initial Fetch
  useEffect(() => {
    fetchWorkFlow();
  }, []);

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Workflow Data</h2>

      <button className="btn btn-primary mb-3" onClick={() => setShowForm(!showForm)}>
        {showForm ? "Cancel" : "Add Record"}
      </button>

      {/* 🔵 Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="row">
            {Object.keys(initialFormData).map((key, index) => (
              <div className="col-md-4 mb-3" key={index}>
                <label>{key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}</label>
                <input
                  type={key.includes("date") ? "date" : key.includes("Fee") || key === "amount" || key === "profit" ? "number" : "text"}
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  className="form-control"
                  required={["firstName", "lastName"].includes(key)}
                />
              </div>
            ))}
          </div>
          <button type="submit" className="btn btn-success">Save</button>
        </form>
      )}

      {/* 🔴 Table */}
      {loading && <div className="alert alert-info">Loading...</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && workData.length > 0 && (
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-dark">
              <tr>
                {Object.keys(workData[0]).map((key, index) => (
                  <th key={index}>{key.toUpperCase()}</th>
                ))}
                <th colSpan={2}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {workData.map((item, index) => (
                <tr key={index}>
                  {Object.values(item).map((value, idx) => (
                    <td key={idx}>{value}</td>
                  ))}
                  <td>
                    <button className="btn btn-warning btn-sm" onClick={() => handleEdit(item)}>Edit</button>
                  </td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && workData.length === 0 && (
        <div className="alert alert-warning">No data available.</div>
      )}
    </div>
  );
};

export default WorkFlow;
