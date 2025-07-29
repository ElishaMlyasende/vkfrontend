import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";

const initialFormData = {
  date: "",
  description: "",
  amountIn: "",
  amountOut: "",
  advocateComment: "",
};

const CashPayment = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [cashPaymentData, setCashPaymentData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("http://13.48.138.226:9093/cashbook/all");
      const text = await res.text();
      if (!res.ok) throw new Error(text);
      const data = JSON.parse(text);
      setCashPaymentData(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isEditing
      ? `http://13.48.138.226:9093/cashbook/edit/${formData.id}`
      : "http://13.48.138.226:9093/cashbook/add";
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
      setShowForm(false);
      setIsEditing(false);
      fetchData(); // refresh list
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
      confirmButtonColor: "green",
      cancelButtonColor: "red",
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`http://13.48.138.226:9093/cashbook/delete/${id}`, {
        method: "DELETE",
      });

      const message = await res.text();
      if (!res.ok) throw new Error(message);

      Swal.fire("Success", message, "success");
      setCashPaymentData((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  const columns = [
    { name: "Date", selector: (row) => row.date, sortable: true },
    { name: "Description", selector: (row) => row.description, sortable: true },
    { name: "Amount In", selector: (row) => row.amountIn },
    { name: "Amount Out", selector: (row) => row.amountOut },
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

  const filteredData = cashPaymentData.filter((item) =>
    Object.values(item).join(" ").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mt-4">
      <h3 className="mb-3 text-center">Daily Cash Transactions</h3>

      <div className="mb-3 text-end">
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowForm(true);
            setFormData(initialFormData);
            setIsEditing(false);
          }}
        >
          Add Petty Cash
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="border p-4 rounded mb-4 bg-light shadow-sm">
          <div className="row">
            {Object.keys(initialFormData).map((key) => (
              <div className="col-md-4 mb-2" key={key}>
                <label className="form-label">
                  {key.replace(/([A-Z])/g, " $1").toUpperCase()}
                </label>
                <input
                  type={
                    key.includes("date")
                      ? "date"
                      : key.includes("amount")
                      ? "number"
                      : "text"
                  }
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
            ))}
          </div>
          <div className="mt-3">
            <button type="submit" className="btn btn-success me-2">
              {isEditing ? "Update" : "Save"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setShowForm(false);
                setFormData(initialFormData);
                setIsEditing(false);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* 🔍 Searchable Table */}
      <DataTable
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
    </div>
  );
};

export default CashPayment;
