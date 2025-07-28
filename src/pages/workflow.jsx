import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import "bootstrap/dist/css/bootstrap.min.css";

const initialFormData = {
  name: "",
  typeOfWork: "",
  activities: "",
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
};

const WorkFlow = () => {
  const [workData, setWorkData] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchText, setSearchText] = useState("");

  const fetchWorkFlow = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:9092/Client/api/allClient");
      if (!res.ok) throw new Error("Failed to fetch data");
      const data = await res.json();
      setWorkData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = isEditing
      ? `http://localhost:9092/Client/api/edit/${formData.id}`
      : "http://localhost:9092/Client/api/add";
    const method = isEditing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save record");

      Swal.fire("Success", isEditing ? "Record Updated" : "Record Added", "success");
      resetForm();
      fetchWorkFlow();
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  const handleEdit = (item) => {
    setFormData(item);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`http://localhost:9092/Client/api/delete/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");

      setWorkData((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setIsEditing(false);
    setShowForm(false);
  };

  useEffect(() => {
    fetchWorkFlow();
  }, []);

  const columns = [
    ...Object.keys(initialFormData).map((key) => ({
      name: key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()),
      selector: (row) => row[key],
      sortable: true,
    })),
    {
      name: "Profit",
      selector: (row) => {
        const agreed = parseFloat(row.agreedFee || 0);
        const amount = parseFloat(row.amount || 0);
        const fee = parseFloat(row.facilitationFee || 0);
        return (agreed - amount - fee).toFixed(2);
      },
      sortable: true,
      cell: (row) => {
        const agreed = parseFloat(row.agreedFee || 0);
        const amount = parseFloat(row.amount || 0);
        const fee = parseFloat(row.facilitationFee || 0);
        const profit = agreed - amount - fee;
        return (
          <span style={{ color: profit < 0 ? "red" : "black", fontWeight: profit < 0 ? "bold" : "normal" }}>
            {profit.toFixed(2)}
          </span>
        );
      },
    },
    {
      name: "Actions",
      cell: (row) => (
        <>
          <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(row)}>
            Edit
          </button>
          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row.id)}>
            Delete
          </button>
        </>
      ),
    },
  ];

  const filteredData = workData.filter((item) =>
    Object.values(item).join(" ").toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-primary text-center">Mortgage Works</h2>

      <div className="text-end mb-3">
        <button
          className="btn btn-outline-primary"
          onClick={() => {
            if (!showForm) resetForm();
            setShowForm((prev) => !prev);
          }}
        >
          {showForm ? "Close Form" : "Add New Record"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="border p-4 rounded mb-4 bg-light shadow-sm">
          <div className="row">
            {Object.keys(initialFormData).map((key, index) => (
              <div className="col-md-4 mb-3" key={index}>
                <label className="form-label">
                  {key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
                </label>
                {key === "remarks" ? (
                  <textarea
                    name={key}
                    className="form-control textarea"
                    value={formData[key]}
                    onChange={handleChange}
                    rows={6}
                    cols={10}
                    placeholder="Enter remarks"
                    style={{
                      width: '100%',
                      height: '120px',
                      padding: '10px',
                      fontSize: '16px',
                      boxSizing: 'border-box',
                      resize: 'vertical'
                    }}
                  />
                ) : (
                  <input
                    type={
                      key.toLowerCase().includes("date")
                        ? "date"
                        : ["amount", "agreedFee", "facilitationFee"].includes(key)
                        ? "number"
                        : "text"
                    }
                    name={key}
                    className="form-control"
                    value={formData[key]}
                    onChange={handleChange}
                    required={["name"].includes(key)}
                  />
                )}
              </div>
            ))}
          </div>
          <button type="submit" className="btn btn-success w-100">
            {isEditing ? "Update Record" : "Save Record"}
          </button>
        </form>
      )}

      <DataTable
        title="Mortgage Records"
        columns={columns}
        data={filteredData}
        pagination
        striped
        highlightOnHover
        responsive
        subHeader
        subHeaderComponent={
          <input
            type="text"
            placeholder="Search..."
            className="form-control w-50"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        }
      />
    </div>
  );
};

export default WorkFlow;
