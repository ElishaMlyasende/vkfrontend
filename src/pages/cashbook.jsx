import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import "bootstrap/dist/css/bootstrap.min.css";

const initialFormData = {
  date: "",
  amountIn: "",
  amountOut: "",
  advocateComment: "",
  controlNumber: "",
  mpesaFee: "",
  clientName: "",
};

const NormalPettyCash = () => {
  const [pettyCashData, setPettyCashData] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchPettyCashData();
  }, []);

  const fetchPettyCashData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://13.48.138.226:9093/cashbook/mobile/all");
      const text = await res.text();
      if (!res.ok) throw new Error(text || "Failed to load data");
      const data = JSON.parse(text);
      setPettyCashData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You want to save this item?",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    });

    if (!result.isConfirmed) return;

    const url = isEditing
      ? `http://13.48.138.226:9093/cashbook/mobile/edit/${formData.id}`
      : "http://13.48.138.226:9093/cashbook/mobile/add";

    const method = isEditing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const message = await res.text();
      if (!res.ok) throw new Error(message || "Failed to save");

      Swal.fire("Success", message, "success");
      setFormData(initialFormData);
      setIsEditing(false);
      setShowForm(false);
      fetchPettyCashData();
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
      text: "You want to delete this item?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`http://13.48.138.226:9093/cashbook/mobile/delete/${id}`, {
        method: "DELETE",
      });

      const message = await res.text();
      if (!res.ok) throw new Error(message || "Failed to delete");

      Swal.fire("Success", message, "success");
      setPettyCashData((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  const columns = [
    { name: "Date", selector: (row) => row.date, sortable: true },
    { name: "Client", selector: (row) => row.clientName, sortable: true },
    { name: "Control No", selector: (row) => row.controlNumber, sortable: true },
    { name: "Amount In", selector: (row) => row.amountIn },
    { name: "Amount Out", selector: (row) => row.amountOut },
    { name: "M-Pesa Fee", selector: (row) => row.mpesaFee },
    {
      name: "Profit",
      selector: (row) => {
        const inAmt = parseFloat(row.amountIn || 0);
        const outAmt = parseFloat(row.amountOut || 0);
        const fee = parseFloat(row.mpesaFee || 0);
        return (inAmt - (outAmt + fee)).toFixed(2);
      },
    },
    { name: "Comment", selector: (row) => row.advocateComment },
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

  const filteredData = pettyCashData.filter((item) =>
    Object.values(item).join(" ").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mt-4">
      <h3 className="text-primary text-center mb-3">Mobile Daily Transactions</h3>

      <div className="text-end mb-3">
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowForm(!showForm);
            setFormData(initialFormData);
            setIsEditing(false);
          }}
        >
          {showForm ? "Cancel" : "Add PettyCash"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="border p-4 rounded bg-light mb-4 shadow-sm">
          <div className="row">
            {Object.keys(initialFormData).map((key, index) => (
              <div className="col-md-4 mb-3" key={index}>
                <label className="form-label">
                  {key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
                </label>
                <input
                  type={
                    key.includes("date")
                      ? "date"
                      : key.toLowerCase().includes("amount") || key.includes("fee")
                      ? "number"
                      : "text"
                  }
                  name={key}
                  value={formData[key] || ""}
                  onChange={handleChange}
                  className="form-control"
                  required={["date", "amountIn", "mpesaFee", "clientName"].includes(key)}
                />
              </div>
            ))}
          </div>
          <button type="submit" className="btn btn-success w-100">
            {isEditing ? "Update" : "Save"}
          </button>
        </form>
      )}

      {isLoading ? (
        <div className="alert alert-info">Loading...</div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <DataTable
          title="Petty Cash Records"
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
              className="form-control w-50"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          }
        />
      )}
    </div>
  );
};

export default NormalPettyCash;
