import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

const initialFormData = {
  // Add your form fields here, example:
  caseNumber: "",
  clientName: "",
  description: "",
  status: "",
  // add other fields as needed
};

const CaseManagement = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [caseData, setCaseData] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch cases on component mount
  useEffect(() => {
    fetchCaseData();
  }, []);

  const fetchCaseData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:9099/case/all");
      if (!res.ok) {
        throw new Error("No record found");
      }
      const data = await res.json();
      setCaseData(data);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You want to remove this record?",
      icon: "warning",
      showCancelButton: true,
      cancelButtonColor: "red",
      confirmButtonColor: "green",
      cancelButtonText: "No",
      confirmButtonText: "Yes ...Delete",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`http://localhost:9092/client/api/delete/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "Failed to delete record");
      }
      Swal.fire("Deleted!", "Record has been deleted.", "success");
      setCaseData((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  // Placeholder for update - implement as needed
  const handleUpdate = (item) => {
    setFormData(item);
    setIsEditing(true);
    setShowForm(true);
  };

  return (
    <div className="container mt-4">
      <h3>Case Management</h3>

      {isLoading && <p>Loading data...</p>}
      {error && <p className="text-danger">{error}</p>}

      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="table-dark">
            <tr>
              {caseData.length > 0
                ? Object.keys(caseData[0]).map((key, index) => (
                    <th key={index}>{key.toUpperCase()}</th>
                  ))
                : <th>No Data</th>}
              <th colSpan={2}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {caseData.length > 0 ? (
              caseData.map((item, idx) => (
                <tr key={item.id || idx}>
                  {Object.values(item).map((value, i) => (
                    <td key={i}>{value}</td>
                  ))}
                  <td>
                    <button
                      className="btn btn-warning"
                      onClick={() => handleUpdate(item)}
                    >
                      Edit
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="100%" className="text-center">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Optional: Add form here for editing/adding case if needed */}
      {showForm && (
        <div>
          {/* Your form JSX here */}
          {/* Use formData and setFormData for editing */}
        </div>
      )}
    </div>
  );
};

export default CaseManagement;
