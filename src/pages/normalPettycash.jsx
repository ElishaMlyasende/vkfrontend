import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";   // <-- Add this import!

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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("http://localhost:9093/cashbook/all");
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
      ? `http://localhost:9093/cashbook/edit/${formData.id}`
      : "http://localhost:9093/cashbook/add";
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
      fetchData();  // refresh list
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
      const res = await fetch(`http://localhost:9093/cashbook/delete/${id}`, {
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

  return (
    <div className="container mt-4">
      <h3>Normal Petty Cash</h3>
      <button
        className="btn btn-primary mb-3"
        onClick={() => {
          setShowForm(true);
          setFormData(initialFormData);
          setIsEditing(false);
        }}
      >
        Add Petty Cash
      </button>

      {error && <p className="text-danger">{error}</p>}

      <div className="table-responsive">
        <table className="table table-bordered">
          <thead className="table-dark">
            <tr>
              {Object.keys(initialFormData).map((key) => (
                <th key={key}>{key.toUpperCase()}</th>
              ))}
              <th>EDIT</th>
              <th>DELETE</th>
            </tr>
          </thead>
          <tbody>
            {cashPaymentData.length > 0 ? (
              cashPaymentData.map((item) => (
                <tr key={item.id}>
                  {Object.keys(initialFormData).map((key) => (
                    <td key={key}>{item[key]}</td>
                  ))}
                  <td>
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </button>
                  </td>
                  <td>
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
                <td colSpan="100%" className="text-center">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-3">
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
            <div className="col-md-12 mt-2">
              <button type="submit" className="btn btn-success">
                {isEditing ? "Update" : "Save"}
              </button>
              <button
                type="button"
                className="btn btn-secondary ms-2"
                onClick={() => {
                  setShowForm(false);
                  setFormData(initialFormData);
                  setIsEditing(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default CashPayment;
