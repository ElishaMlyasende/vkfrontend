import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

const initialFormData = {
  date: "",
  clientName: "",
  controlNumber: "",
  amountIn: "",
  amountOut: "",
  mpesaFee: "",
  advocateComment: "",
};

const CashBook = () => {
  const [cashBookData, setCashBookData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    fetchCashBookData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const Result = await Swal.fire({
      title: "Are you sure",
      text: "You want to save this Item?",
      icon: "info",
      showCancelButton: true,
      cancelButtonColor: "red",
      confirmButtonColor: "green",
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    });

    if (!Result.isConfirmed) return;

    const url = isEditing
      ? `http://localhost:9093/cashbook/mobile/edit/${formData.id}`
      : "http://localhost:9093/cashbook/mobile/add";
    const method = isEditing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Failed to save data");
      }

      const updatedData = await res.json();

      if (isEditing) {
        setCashBookData((prev) =>
          prev.map((item) =>
            item.id === updatedData.id ? updatedData : item
          )
        );
      } else {
        setCashBookData((prev) => [...prev, updatedData]);
      }

      setShowForm(false);
      setFormData(initialFormData);
      setIsEditing(false);
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  const handleEdit = (item) => {
    setIsEditing(true);
    setFormData(item);
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
      const res = await fetch(`http://localhost:9093/cashbook/mobile/delete/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete");
      }

      setCashBookData((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  const fetchCashBookData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:9093/cashbook/mobile/all");
      if (!res.ok) {
        throw new Error("Failed to load data");
      }
      const fetchedData = await res.json();
      setCashBookData(fetchedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="row">
            {Object.keys(initialFormData).map((key, index) => (
              <div className="col-md-4 mb-3" key={index}>
                <label>
                  {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) =>
                    str.toUpperCase()
                  )}
                </label>
                <input
                  type={
                    key.includes("date")
                      ? "date"
                      : key.toLowerCase().includes("fee") ||
                        key.toLowerCase().includes("amount")
                      ? "number"
                      : "text"
                  }
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  className="form-control"
                  required={["date", "clientName", "controlNumber", "amountIn"].includes(key)}
                />
              </div>
            ))}
          </div>
          <button type="submit" className="btn btn-success">Save</button>
        </form>
      )}

      <button
        className="btn btn-primary mb-3"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? "Cancel" : "Add PettyCash"}
      </button>

      {isLoading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-danger">{error}</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-dark">
              <tr>
                {cashBookData.length > 0 &&
                  Object.keys(cashBookData[0]).map((item, index) => (
                    <th key={index}>{item.toUpperCase()}</th>
                  ))}
                <th colSpan={2}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cashBookData.map((item, index) => (
                <tr key={index}>
                  {Object.values(item).map((value, id) => (
                    <td key={id}>{value}</td>
                  ))}
                  <td>
                    <button
                      className="btn btn-warning"
                      onClick={() => handleEdit(item)}
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CashBook;
