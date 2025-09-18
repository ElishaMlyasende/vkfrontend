import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import { hasPermission } from "./UserPermissionGranted";

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
  document: null,
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
  const [activeCase, setActiveCase] = useState(null);

  // comments
  const [comments, setComments] = useState([]);
  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const [commentData, setCommentData] = useState({ message: "", caseId: "" });
  const [messageEditingData, setMessageEditingData] = useState({
    message: "",
    caseId: "",
    id: null,
  });

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
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComments = async (caseId) => {
    try {
      const res = await fetch(`http://localhost:9099/comment/${caseId}`);
      const data = await res.json();
      setComments(data);
    } catch (err) {
      console.error("Failed to fetch comments", err);
    }
  };

  const saveComment = async () => {
    const payload = isEditingMessage
      ? messageEditingData
      : { ...commentData, caseId: activeCase.id };

    const method = isEditingMessage ? "PUT" : "POST";
    const url = isEditingMessage
      ? `http://localhost:9099/comment/edit/${payload.id}`
      : "http://localhost:9099/comment/add";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save comment");
      Swal.fire("Success", "Comment saved", "success");

      // reset fields
      setCommentData({ message: "", caseId: "" });
      setMessageEditingData({ message: "", caseId: "", id: null });
      setIsEditingMessage(false);

      // refresh
      fetchComments(activeCase.id);
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files, type } = e.target;
    if (type === "file") {
      setFormData((prev) => ({ ...prev, [name]: files[0] || null }));
      return;
    }

    const numberFields = ["totalExposure", "totalClaim"];
    const val = numberFields.includes(name)
      ? value === "" ? "" : Number(value)
      : value;
    if (numberFields.includes(name) && isNaN(val)) return;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.caseNumber || !formData.caseStatus) {
      Swal.fire("Validation error", "Case Number and Case Status are required", "warning");
      return;
    }

    const form = new FormData();
    const caseModel = { ...formData };
    delete caseModel.document;
    form.append("caseModel", new Blob([JSON.stringify(caseModel)], { type: "application/json" }));
    if (formData.document) form.append("document", formData.document);

    const method = isEditing ? "PUT" : "POST";
    const url = isEditing
      ? `http://localhost:9099/case/edit/${formData.id}`
      : "http://localhost:9099/case/add";

    try {
      const res = await fetch(url, { method, body: form });
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
      const res = await fetch(`http://localhost:9099/case/remove/${id}`, { method: "DELETE" });
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
      id: item.id ?? null,
      dateOfInstruction: formatDate(item.dateOfInstruction),
      caseNumber: item.caseNumber ?? "",
      jurisdiction: item.jurisdiction ?? "",
      plaintiff: item.plaintiff ?? "",
      defendant: item.defendant ?? "",
      totalExposure: item.totalExposure ?? "",
      natureOfClaim: item.natureOfClaim ?? "",
      briefFacts: item.briefFacts ?? "",
      caseStatus: item.caseStatus ?? "",
      totalClaim: item.totalClaim ?? "",
      remoteProbability: item.remoteProbability ?? "",
      reasonablyPossible: item.reasonablyPossible ?? "",
      probable: item.probable ?? "",
      createdAt: formatDate(item.createdAt),
      updatedAt: formatDate(item.updatedAt),
      document: null,
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleViewComments = (caseItem) => {
    setActiveCase(caseItem);
    setShowComments(true);
    fetchComments(caseItem.id);
  };

  const filteredCases = caseData.filter((item) =>
    Object.values(item).join(" ").toLowerCase().includes(search.toLowerCase())
  );

  const columns = Object.keys(initialFormData)
    .filter((key) => key !== "document")
    .map((key) => ({
      name: key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()),
      selector: (row) => row[key] ?? "",
      wrap: true,
    }));

  columns.push({
    name: "Attachment",
    cell: (row) =>
      row.id ? (
        <a
          href={`http://localhost:9099/case/document/${row.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-sm btn-outline-primary"
          download
        >
          Download
        </a>
      ) : (
        <span>No Attachment</span>
      ),
    ignoreRowClick: true,
    allowOverflow: true,
    button: true,
  });

  columns.push({
    name: "Actions",
    cell: (row) => (
      <>
        {hasPermission("EDIT_CASE") && (
          <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(row)}>
            Edit
          </button>
        )}
        {hasPermission("DELETE_CASE") && (
          <button className="btn btn-danger btn-sm me-2" onClick={() => handleDelete(row.id)}>
            Delete
          </button>
        )}
        {hasPermission("VIEW_COMMENT") && (
          <button className="btn btn-info btn-sm" onClick={() => handleViewComments(row)}>
            Comments
          </button>
        )}
      </>
    ),
    ignoreRowClick: true,
    allowOverflow: true,
    button: true,
  });

  return (
    <div className="container mt-4">
      <h3>Case Management</h3>

      <div className="d-flex justify-content-between mb-3">
        {hasPermission("ADD_CASE") && (
          <button
            className="btn btn-primary"
            onClick={() => {
              setFormData(initialFormData);
              setShowForm(true);
              setIsEditing(false);
            }}
          >
            Add New Case
          </button>
        )}

        <input
          type="text"
          placeholder="Search..."
          className="form-control w-50"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="border p-3 rounded mb-3 bg-light">
          <div className="row">
            {Object.keys(initialFormData).map((key) => {
              if (key === "id") return null;
              if (key === "document") {
                return (
                  <div className="col-md-4 mb-3" key={key}>
                    <label>Document</label>
                    <input type="file" name="document" className="form-control" onChange={handleInputChange} />
                  </div>
                );
              }
              return (
                <div className="col-md-4 mb-3" key={key}>
                  <label>{key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}</label>
                  <input
                    type={key.toLowerCase().includes("date") ? "date" : "text"}
                    name={key}
                    className="form-control"
                    value={formData[key]}
                    onChange={handleInputChange}
                    required={["caseNumber", "caseStatus"].includes(key)}
                  />
                </div>
              );
            })}
          </div>
          <button type="submit" className="btn btn-success me-2">
            {isEditing ? "Update Case" : "Add Case"}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
            Cancel
          </button>
        </form>
      )}

      {showComments && (
        <div className="modal show fade" style={{ display: "block" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Comments for Case {activeCase?.caseNumber || "N/A"}</h5>
              </div>
              <div className="modal-body">
                {comments.length > 0 ? (
                  comments.map((c, index) => (
                    <div key={index} className="border p-2 mb-2 rounded">
                      <p>{c.message}</p>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          setMessageEditingData({ message: c.message, caseId: c.caseId, id: c.id });
                          setIsEditingMessage(true);
                        }}
                      >
                        Edit
                      </button>
                    </div>
                  ))
                ) : (
                  <p>No comments available</p>
                )}
              </div>
              <div className="modal-footer">
              <textarea
                className="form-control me-2"
                placeholder="Write a comment Here..."
                rows={20} // unaweza kuongeza rows kulingana na unavyotaka uonekane kubwa
                value={isEditingMessage ? messageEditingData.message : commentData.message}
                onChange={(e) =>
                isEditingMessage
                ? setMessageEditingData({ ...messageEditingData, message: e.target.value })
                 : setCommentData({ ...commentData, message: e.target.value, caseId: activeCase.id })
  }
/>
<button className="btn btn-primary" onClick={()=>setShowComments(!showComments)}>Cancel</button>

                <button className="btn btn-primary" onClick={saveComment}>
                  {isEditingMessage ? "Update" : "Send"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-danger">{error}</p>
      ) : (
        <DataTable
          columns={columns}
          data={filteredCases}
          pagination
          highlightOnHover
          fixedHeader
          fixedHeaderScrollHeight="400px"
          noDataComponent="No records found"
        />
      )}
    </div>
  );
};

export default CaseManagement;
