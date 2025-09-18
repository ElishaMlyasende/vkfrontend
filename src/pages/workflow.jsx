import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import "bootstrap/dist/css/bootstrap.min.css";
import { hasPermission } from "./UserPermissionGranted";

const initialFormData = {
  name: "",
  typeOfWork: "",
  dateReceivedFromBank: "",
  dateSubmittedToRegistrar: "",
  registryName: "",
  dateCollected: "",
  submissionToBankAndOfficer: "",
  agreedFee: "",
  contactPerson: "",
  remarks: "",
};

const WorkFlow = () => {
  const [workData, setWorkData] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchText, setSearchText] = useState("");

  const [activities, setActivities] = useState({});
  const [showActivitiesId, setShowActivitiesId] = useState(null);
  const [editingMortage, isEditingMortage] = useState(false);
  const [activityForm, setActivityForm] = useState({
    activity: "",
    amount: "",
    controlNumber:"",
    facilitationFee: "",
  });
  const [mortageUpdatingData, setMortageUpdatingData] = useState({
    id: null,
    activity: "",
    amount: "",
    controlNumber:"",
    facilitationFee: "",
  });

  // Fetch all workflows
  const fetchWorkFlow = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:9092/Client/api/allClient");
      if (!res.ok) throw new Error("Failed to fetch data");
      const data = await res.json();
      setWorkData(data);

      // Automatically fetch activities for each workflow
      data.forEach((item) => FetchActivityData(item.id));
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch activities for a workflow
  const FetchActivityData = async (workFlowId) => {
    try {
      const res = await fetch(
        `http://localhost:9092/Client/Activities/all/${workFlowId}`
      );
      if (res.ok) {
        const data = await res.json();
        setActivities((prev) => ({ ...prev, [workFlowId]: data }));
      }
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  // Handle workflow form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle activity form change
  const handleActivityChange = (e) => {
    const { name, value } = e.target;
    if (editingMortage) {
      setMortageUpdatingData((prev) => ({ ...prev, [name]: value }));
    } else {
      setActivityForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Submit workflow form
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
      Swal.fire("Success", isEditing ? "Record Updated" : "Record Added");
      resetForm();
      fetchWorkFlow();
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  // Submit activity
  const handleActivitySubmit = async () => {
    const confirmed = await Swal.fire({
      title: "Confirm",
      text: editingMortage
        ? "Edit this activity?"
        : "Add this activity?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
    });

    if (!confirmed.isConfirmed) return;

    try {
      const method = editingMortage ? "PUT" : "POST";
      const url = editingMortage
        ? `http://localhost:9092/Client/Activities/EDIT/${mortageUpdatingData.id}`
        : "http://localhost:9092/Client/Activities/add";

      const body = {
        activity: editingMortage ? mortageUpdatingData.activity : activityForm.activity,
        amount: editingMortage ? mortageUpdatingData.amount : activityForm.amount,
        controlNumber: editingMortage ? mortageUpdatingData.controlNumber : activityForm.controlNumber,
        facilitationFee: editingMortage
          ? mortageUpdatingData.facilitationFee
          : activityForm.facilitationFee,
        workFloor: { id: showActivitiesId },
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        Swal.fire("Success", editingMortage ? "Activity updated" : "Activity added");
        setActivityForm({ activity: "", amount: "", facilitationFee: "" });
        isEditingMortage(false);
        FetchActivityData(showActivitiesId);
      }
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  // Delete activity
  const handleDeleteActivity = async (id) => {
    const confirmed = await Swal.fire({
      title: "Confirm",
      text: "Delete this activity?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
    });

    if (!confirmed.isConfirmed) return;

    try {
      const res = await fetch(
        `http://localhost:9092/Client/Activities/delete/${id}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setActivities((prev) => ({
          ...prev,
          [showActivitiesId]: prev[showActivitiesId].filter((a) => a.id !== id),
        }));
        Swal.fire("Deleted", "Activity deleted");
      }
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  // Delete workflow
  const handleDeleteWorkflow = async (id) => {
    const confirmed = await Swal.fire({
      title: "Confirm",
      text: "Delete this workflow?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
    });
    if (!confirmed.isConfirmed) return;

    try {
      const res = await fetch(`http://localhost:9092/Client/api/delete/${id}`, {
        method: "DELETE",
      });
      if (res.ok) setWorkData((prev) => prev.filter((w) => w.id !== id));
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

  // Columns for DataTable
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
        const rowActivities = activities[row.id] || [];
        const totalActivities = rowActivities.reduce(
          (sum, item) => sum + Number(item.amount || 0) + Number(item.facilitationFee || 0),
          0
        );
        return (agreed - totalActivities).toFixed(2);
      },
      cell: (row) => {
        const agreed = parseFloat(row.agreedFee || 0);
        const rowActivities = activities[row.id] || [];
        const totalActivities = rowActivities.reduce(
          (sum, item) => sum + Number(item.amount || 0) + Number(item.facilitationFee || 0),
          0
        );
        const profit = agreed - totalActivities;
        return <span style={{ color: profit < 0 ? "red" : "black", fontWeight: profit < 0 ? "bold" : "normal" }}>{profit.toFixed(2)}</span>;
      },
    },
    {
      name: "Actions",
      cell: (row) => (
        <>
          {hasPermission("EDIT_MORTGAGE") && <button className="btn btn-warning btn-sm me-2" onClick={() => { setFormData(row); setIsEditing(true); setShowForm(true); }}>Edit</button>}
          {hasPermission("DELETE_MORTGAGE") && <button className="btn btn-danger btn-sm me-2" onClick={() => handleDeleteWorkflow(row.id)}>Delete</button>}
          {hasPermission("ADD_MORTGAGE_ACTIVITY") && (
            <button className="btn btn-info btn-sm" onClick={() => setShowActivitiesId(showActivitiesId === row.id ? null : row.id)}>
              {showActivitiesId === row.id ? "Hide Activities" : "Activities"}
            </button>
          )}
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
        {hasPermission("ADD_MORTGAGE") && (
          <button className="btn btn-outline-primary" onClick={() => { if (!showForm) resetForm(); setShowForm(!showForm); }}>
            {showForm ? "Close Form" : "Add New Record"}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="border p-4 rounded mb-4 bg-light shadow-sm">
          <div className="row">
            {Object.keys(initialFormData).map((key, idx) => (
              <div className="col-md-4 mb-3" key={idx}>
                <label className="form-label">{key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}</label>
                {key === "remarks" ? (
                  <textarea name={key} value={formData[key]} onChange={handleChange} className="form-control" rows={6} />
                ) : (
                  <input
                    type={key.toLowerCase().includes("date") ? "date" : ["amount","agreedFee","facilitationFee"].includes(key) ? "number" : "text"}
                    name={key}
                    className="form-control"
                    value={formData[key]}
                    onChange={handleChange}
                    required={key === "name"}
                  />
                )}
              </div>
            ))}
          </div>
          <button type="submit" className="btn btn-success w-100">{isEditing ? "Update Record" : "Save Record"}</button>
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
        subHeaderComponent={<input type="text" placeholder="Search..." className="form-control w-50" value={searchText} onChange={(e) => setSearchText(e.target.value)} />}
      />

      {/* Inline activities table */}
      {showActivitiesId && activities[showActivitiesId] && (
        <div className="mt-4">
          <h4>Activities</h4>
          <table className="table table-bordered">
            <thead className="table-light">
              <tr>
                <th>Activity</th>
                <th>Amount</th>
                <th>Control Number</th>
                <th>Facilitation Fee</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activities[showActivitiesId].map((act) => (
                <tr key={act.id}>
                  <td>{act.activity}</td>
                  <td>{act.amount}</td>
                  <td>{act.controlNumber}</td>
                  <td>{act.facilitationFee}</td>
                  <td>
                    <button className="btn btn-warning btn-sm me-2" onClick={() => { isEditingMortage(true); setMortageUpdatingData(act); setActivityForm({}); }}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteActivity(act.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Add/Edit activity form */}
          <div className="border p-3 rounded mb-4 bg-light">
            <h5>{editingMortage ? "Edit Activity" : "Add Activity"}</h5>
            <div className="row">
              <div className="col-md-4 mb-2">
                <input type="text" name="activity" value={editingMortage ? mortageUpdatingData.activity : activityForm.activity} onChange={handleActivityChange} className="form-control" placeholder="Activity" />
              </div>
              <div className="col-md-3 mb-2">
                <input type="number" name="amount" value={editingMortage ? mortageUpdatingData.amount : activityForm.amount} onChange={handleActivityChange} className="form-control" placeholder="Amount" />
              </div>
              <div className="col-md-3 mb-2">
                <input type="text" name="controlNumber" value={editingMortage ? mortageUpdatingData.controlNumber : activityForm.controlNumber} onChange={handleActivityChange} className="form-control" placeholder="Control Number" />
              </div>
              <div className="col-md-3 mb-2">
                <input type="number" name="facilitationFee" value={editingMortage ? mortageUpdatingData.facilitationFee : activityForm.facilitationFee} onChange={handleActivityChange} className="form-control" placeholder="Facilitation Fee" />
              </div>
              <div className="col-md-2 mb-2">
                <button className="btn btn-success w-100" onClick={handleActivitySubmit}>{editingMortage ? "Update" : "Add"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkFlow;
