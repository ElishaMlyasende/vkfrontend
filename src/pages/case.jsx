import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import CommentModal from "./CommentModal";

const initialFormData = {
  id: null,
  dateOfInstruction: "",
  caseNumber: "",
  jurisdiction: "",
  plaintiff: "",
  defendant: "",
  totalExposure: "",
  natureOfClaim: "",
  briefFacts: "",
  caseStatus: "",
  totalClaim: "",
  remoteProbability: "",
  reasonablyPossible: "",
  probable: "",
  createdAt: "",
  updatedAt: "",
};

const CaseManagement = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [caseData, setCaseData] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);

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
    const numberFields = [
      "totalExposure",
      "totalClaim",
      "remoteProbability",
      "reasonablyPossible",
      "probable",
    ];
    const val = numberFields.includes(name) ? (value === "" ? "" : Number(value)) : value;
    if (numberFields.includes(name) && isNaN(val)) return;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.caseNumber || !formData.caseStatus) {
      Swal.fire("Validation error", "Case Number and Case Status are required", "warning");
      return;
    }

    const payload = {
      ...formData,
      dateOfInstruction: formData.dateOfInstruction || null,
      createdAt: formData.createdAt || null,
      updatedAt: formData.updatedAt || null,
    };

    const method = isEditing ? "PUT" : "POST";
    const url = isEditing
      ? `http://localhost:9099/case/update/${formData.id}`
      : "http://localhost:9099/case/add";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await res.text());

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
      const res = await fetch(`http://localhost:9099/case/delete/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete case");
      Swal.fire("Deleted!", "Case has been deleted.", "success");
      setCaseData((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  const handleEdit = (item) => {
    const formatDate = (d) => (d ? d.split("T")[0] : "");
    setFormData({
      ...item,
      dateOfInstruction: formatDate(item.dateOfInstruction),
      createdAt: formatDate(item.createdAt),
      updatedAt: formatDate(item.updatedAt),
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleCancel = () => {
    setFormData(initialFormData);
    setIsEditing(false);
    setShowForm(false);
  };

  const handleViewComments = async (caseId) => {
    try {
      const res = await fetch(`http://localhost:9099/comment/${caseId}`);
      if (!res.ok) throw new Error("Failed to fetch comments");
      const data = await res.json();
      setComments(data);
      setShowComments(true);
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  const filteredCases = caseData.filter((item) =>
    Object.values(item)
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const columns = [
    { name: "ID", selector: (row) => row.id, sortable: true, width: "60px" },
    {
      name: "Case Number",
      selector: (row) => row.caseNumber,
      sortable: true,
      wrap: true,
      minWidth: "140px",
    },
    {
      name: "Status",
      selector: (row) => row.caseStatus,
      wrap: true,
      maxWidth: "100px",
    },
    {
      name: "Plaintiff",
      selector: (row) => row.plaintiff,
      wrap: true,
      maxWidth: "150px",
    },
    {
      name: "Defendant",
      selector: (row) => row.defendant,
      wrap: true,
      maxWidth: "150px",
    },
    {
      name: "Brief Facts",
      selector: (row) => row.briefFacts,
      wrap: true,
      grow: 3,
      style: { whiteSpace: "normal" },
      minWidth: "250px",
    },
    {
      name: "Jurisdiction",
      selector: (row) => row.jurisdiction,
      wrap: true,
      maxWidth: "150px",
    },
    {
      name: "Nature of Claim",
      selector: (row) => row.natureOfClaim,
      wrap: true,
      maxWidth: "150px",
    },
    { name: "Probable", selector: (row) => row.probable, width: "110px" },
    {
      name: "Reasonably Possible",
      selector: (row) => row.reasonablyPossible,
      width: "110px",
    },
    { name: "Remote Probability", selector: (row) => row.remoteProbability, width: "110px" },
    { name: "Total Claim", selector: (row) => row.totalClaim, width: "110px" },
    { name: "Total Exposure", selector: (row) => row.totalExposure, width: "110px" },
    {
      name: "Created At",
      selector: (row) => (row.createdAt ? row.createdAt.split("T")[0] : ""),
      width: "110px",
    },
    {
      name: "Updated At",
      selector: (row) => (row.updatedAt ? row.updatedAt.split("T")[0] : ""),
      width: "110px",
    },
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
            className="btn btn-info btn-sm"
            onClick={() => handleViewComments(row.id)}
          >
            View Comments
          </button>
        </>
      ),
      width: "200px",
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  return (
    <div className="container mt-4">
      <h3>Case Management</h3>

      {isLoading && <p>Loading data...</p>}
      {error && <p className="text-danger">{error}</p>}

      <div className="mb-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          Add New Case
        </button>
        <input
          type="text"
          placeholder="Search cases..."
          className="form-control w-50"
          style={{ minWidth: "200px" }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* FORM */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-4 border p-3 rounded bg-light"
          style={{ maxWidth: "100%" }}
        >
          {/* ... form fields remain unchanged, same as your original form ... */}

          <div className="row mb-2">
            <div className="col-md-4">
              <label>Date of Instruction</label>
              <input
                type="date"
                name="dateOfInstruction"
                className="form-control"
                value={formData.dateOfInstruction}
                onChange={handleInputChange}
              />
            </div>
            <div className="col-md-4">
              <label>Case Number *</label>
              <input
                type="text"
                name="caseNumber"
                className="form-control"
                value={formData.caseNumber}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="col-md-4">
              <label>Case Status *</label>
              <input
                type="text"
                name="caseStatus"
                className="form-control"
                value={formData.caseStatus}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="row mb-2">
            <div className="col-md-6">
              <label>Jurisdiction</label>
              <input
                type="text"
                name="jurisdiction"
                className="form-control"
                value={formData.jurisdiction}
                onChange={handleInputChange}
              />
            </div>
            <div className="col-md-6">
              <label>Plaintiff</label>
              <input
                type="text"
                name="plaintiff"
                className="form-control"
                value={formData.plaintiff}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="row mb-2">
            <div className="col-md-6">
              <label>Defendant</label>
              <input
                type="text"
                name="defendant"
                className="form-control"
                value={formData.defendant}
                onChange={handleInputChange}
              />
            </div>
            <div className="col-md-6">
              <label>Nature of Claim</label>
              <input
                type="text"
                name="natureOfClaim"
                className="form-control"
                value={formData.natureOfClaim}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="mb-2">
            <label>Brief Facts</label>
            <textarea
              name="briefFacts"
              className="form-control"
              rows={3}
              value={formData.briefFacts}
              onChange={handleInputChange}
            />
          </div>

          <div className="row mb-2">
            <div className="col-md-4">
              <label>Total Claim</label>
              <input
                type="number"
                name="totalClaim"
                className="form-control"
                value={formData.totalClaim}
                onChange={handleInputChange}
              />
            </div>
            <div className="col-md-4">
              <label>Total Exposure</label>
              <input
                type="number"
                name="totalExposure"
                className="form-control"
                value={formData.totalExposure}
                onChange={handleInputChange}
              />
            </div>
            <div className="col-md-4">
              <label>Probable</label>
              <input
                type="number"
                name="probable"
                className="form-control"
                value={formData.probable}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="row mb-2">
            <div className="col-md-6">
              <label>Reasonably Possible</label>
              <input
                type="number"
                name="reasonablyPossible"
                className="form-control"
                value={formData.reasonablyPossible}
                onChange={handleInputChange}
              />
            </div>
            <div className="col-md-6">
              <label>Remote Probability</label>
              <input
                type="number"
                name="remoteProbability"
                className="form-control"
                value={formData.remoteProbability}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="row mb-2">
            <div className="col-md-6">
              <label>Created At</label>
              <input
                type="date"
                name="createdAt"
                className="form-control"
                value={formData.createdAt}
                onChange={handleInputChange}
              />
            </div>
            <div className="col-md-6">
              <label>Updated At</label>
              <input
                type="date"
                name="updatedAt"
                className="form-control"
                value={formData.updatedAt}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-success me-2">
            {isEditing ? "Update Case" : "Add Case"}
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleCancel}>
            Cancel
          </button>
        </form>
      )}

      <div style={{ overflowX: "auto" }}>
        <DataTable
          columns={columns}
          data={filteredCases}
          pagination
          striped
          highlightOnHover
          responsive={false}
          dense
          persistTableHead
          fixedHeader
          fixedHeaderScrollHeight="400px"
          noDataComponent={<div className="text-center py-3">No records found</div>}
        />
      </div>

      <CommentModal
        show={showComments}
        onHide={() => setShowComments(false)}
        comments={comments}
      />
    </div>
  );
};

export default CaseManagement;
