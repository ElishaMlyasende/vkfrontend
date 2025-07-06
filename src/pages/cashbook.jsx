import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

const initialFormData = {
  date: "",
  amountIn: "",
  amountOut: "",
  advocateComment: "",
  controlNumber:"",
  mpesaFee:"",
  clientName:""
};

const NormalPettyCash = () => {
  const [pettyCashData, setPettyCashData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    fetchPettyCashData();
  }, []);

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
      cancelButtonColor: "red",
      confirmButtonColor: "green",
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    });

    if (!result.isConfirmed) return;

    const url = isEditing
      ? `http://localhost:9093/cashbook/mobile/edit/${formData.id}`
      : "http://localhost:9093/cashbook/mobile/add";
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

      const message = await res.text();
      if (!res.ok) throw new Error(message || "Failed to delete");

      Swal.fire("Success", message, "success");
      setPettyCashData((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  const fetchPettyCashData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:9093/cashbook/mobile/all");
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

  return (
    <div className="container mt-5">
      <h3>Mobile Daily Transactions</h3>
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
                      : key.toLowerCase().includes("amount")
                      ||key.toLowerCase().includes("fee")? "number"
                      : "text"
                  }
                  name={key}
                  value={formData[key] || ""}
                  onChange={handleChange}
                  className="form-control"
                  required={["date", "amountIn", "description","mpesaFee","clientName"].includes(key)}
                />
              </div>
            ))}
          </div>
          <button type="submit" className="btn btn-success">
            Save
          </button>
        </form>
      )}

      <button
        className="btn btn-primary mb-3"
        onClick={() => {
          setShowForm(!showForm);
          setFormData(initialFormData);
          setIsEditing(false);
        }}
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
                {pettyCashData.length > 0 &&
                  Object.keys(pettyCashData[0]).map((key, index) => (
                    <th key={index}>{key.toUpperCase()}</th>
                  ))}
                <th>PROFIT</th>
                <th colSpan={2}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pettyCashData.map((item, index) => (
                <tr key={index}>
                  {Object.values(item).map((val, idx) => (
                    <td key={idx}>{val}</td>
                  ))}
                  <td>
                    {(() => {
                      const inAmt = parseFloat(item.amountIn || 0);
                      const outAmt = parseFloat(item.amountOut || 0);
                      const fee=parseFloat(item.mpesaFee||0);
                      const profit = inAmt - (outAmt+fee);
                      return profit.toFixed(2);
                    })()}
                  </td>
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

export default NormalPettyCash;
