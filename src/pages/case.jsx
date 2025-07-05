import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

const initialFormData = {
  id: null,
  brief_facts: "",
  case_number: "",
  case_status: "",
  comments: "",
  created_at: "",
  date_of_instruction: "",
  defendant: "",
  jurisdiction: "",
  nature_of_claim: "",
  plaintiff: "",
  probable: "",
  reasonably_possible: "",
  remote_probability: "",
  total_claim: "",
  total_exposure: "",
  updated_at: "",
};

const CaseManagement = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [caseData, setCaseData] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCaseData();
  }, []);

  const fetchCaseData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:9099/case/all");
      if (!res.ok) throw new Error("Failed to fetch cases");
      const data = await res.json();
      setCaseData(data);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields if any, example:
    if (!formData.case_number || !formData.case_status) {
      Swal.fire("Validation error", "Case Number and Status are required", "warning");
      return;
    }

    const method = isEditing ? "PUT" : "POST";
    const url = isEditing
      ? `http://localhost:9099/case/update/${formData.id}`
      : "http://localhost:9099/case/add";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "Failed to save case");
      }

      Swal.fire("Success", `Case ${isEditing ? "updated" : "added"} successfully`, "success");
      setFormData(initialFormData);
      setIsEditing(false);
      setShowForm(false);
      fetchCaseData();
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You want to remove this case?",
      icon: "warning",
      showCancelButton: true,
      cancelButtonColor: "red",
      confirmButtonColor: "green",
      cancelButtonText: "No",
      confirmButtonText: "Yes, Delete",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`http://localhost:9099/case/delete/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete case");

      Swal.fire("Deleted!", "Case has been deleted.", "success");
      setCaseData((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  const handleEdit = (item) => {
    setFormData(item);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleCancel = () => {
    setFormData(initialFormData);
    setIsEditing(false);
    setShowForm(false);
  };

  return (
    <div className="container mt-4">
      <h3>Case Management</h3>

      {isLoading && <p>Loading data...</p>}
      {error && <p className="text-danger">{error}</p>}

      <div className="mb-3">
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          Add New Case
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 border p-3 rounded bg-light">
          {/* Hidden id */}
          <input type="hidden" name="id" value={formData.id || ""} />

          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Brief Facts</label>
              <textarea
                name="brief_facts"
                className="form-control"
                value={formData.brief_facts}
                onChange={handleInputChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Case Number *</label>
              <input
                type="text"
                name="case_number"
                className="form-control"
                value={formData.case_number}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Case Status *</label>
              <input
                type="text"
                name="case_status"
                className="form-control"
                value={formData.case_status}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Comments</label>
              <textarea
                name="comments"
                className="form-control"
                value={formData.comments}
                onChange={handleInputChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Created At</label>
              <input
                type="date"
                name="created_at"
                className="form-control"
                value={formData.created_at ? formData.created_at.split("T")[0] : ""}
                onChange={handleInputChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Date Of Instruction</label>
              <input
                type="date"
                name="date_of_instruction"
                className="form-control"
                value={formData.date_of_instruction ? formData.date_of_instruction.split("T")[0] : ""}
                onChange={handleInputChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Defendant</label>
              <input
                type="text"
                name="defendant"
                className="form-control"
                value={formData.defendant}
                onChange={handleInputChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Jurisdiction</label>
              <input
                type="text"
                name="jurisdiction"
                className="form-control"
                value={formData.jurisdiction}
                onChange={handleInputChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Nature Of Claim</label>
              <input
                type="text"
                name="nature_of_claim"
                className="form-control"
                value={formData.nature_of_claim}
                onChange={handleInputChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Plaintiff</label>
              <input
                type="text"
                name="plaintiff"
                className="form-control"
                value={formData.plaintiff}
                onChange={handleInputChange}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Probable</label>
              <input
                type="text"
                name="probable"
                className="form-control"
                value={formData.probable}
                onChange={handleInputChange}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Reasonably Possible</label>
              <input
                type="text"
                name="reasonably_possible"
                className="form-control"
                value={formData.reasonably_possible}
                onChange={handleInputChange}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Remote Probability</label>
              <input
                type="text"
                name="remote_probability"
                className="form-control"
                value={formData.remote_probability}
                onChange={handleInputChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Total Claim</label>
              <input
                type="number"
                step="0.01"
                name="total_claim"
                className="form-control"
                value={formData.total_claim}
                onChange={handleInputChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Total Exposure</label>
              <input
                type="number"
                step="0.01"
                name="total_exposure"
                className="form-control"
                value={formData.total_exposure}
                onChange={handleInputChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Updated At</label>
              <input
                type="date"
                name="updated_at"
                className="form-control"
                value={formData.updated_at ? formData.updated_at.split("T")[0] : ""}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="mt-3">
            <button type="submit" className="btn btn-success me-2">
              {isEditing ? "Update Case" : "Add Case"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-dark small">
            <tr>
              <th>ID</th>
              <th>Brief Facts</th>
              <th>Case Number</th>
              <th>Case Status</th>
              <th>Comments</th>
              <th>Created At</th>
              <th>Date Of Instruction</th>
              <th>Defendant</th>
              <th>Jurisdiction</th>
              <th>Nature Of Claim</th>
              <th>Plaintiff</th>
              <th>Probable</th>
              <th>Reasonably Possible</th>
              <th>Remote Probability</th>
              <th>Total Claim</th>
              <th>Total Exposure</th>
              <th>Updated At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {caseData.length > 0 ? (
              caseData.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.brief_facts}</td>
                  <td>{item.case_number}</td>
                  <td>{item.case_status}</td>
                  <td>{item.comments}</td>
                  <td>{item.created_at ? item.created_at.split("T")[0] : ""}</td>
                  <td>{item.date_of_instruction ? item.date_of_instruction.split("T")[0] : ""}</td>
                  <td>{item.defendant}</td>
                  <td>{item.jurisdiction}</td>
                  <td>{item.nature_of_claim}</td>
                  <td>{item.plaintiff}</td>
                  <td>{item.probable}</td>
                  <td>{item.reasonably_possible}</td>
                  <td>{item.remote_probability}</td>
                  <td>{item.total_claim}</td>
                  <td>{item.total_exposure}</td>
                  <td>{item.updated_at ? item.updated_at.split("T")[0] : ""}</td>
                  <td>
                    <button
                      className="btn btn-warning btn-sm me-1"
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="18" className="text-center">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CaseManagement;
