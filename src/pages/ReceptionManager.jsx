import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import "bootstrap/dist/css/bootstrap.min.css";

const initialFormData = {
  visitorName: "",
  purpose: "",
  phoneNumber: "",
  departmentToVisit: "",
};

const ReceptionManager = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [visitors, setVisitors] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [Activities,setActivities]=useState(false);
  const [selectedUser,setSelectedUser]=useState("");
  const[isEditingActivity,setisEditingActivity]=useState("");

  const apiUrl = "http://localhost:9092/api/reception";
  const aPiUrlAct="http://localhost:9092/Reception/Client/Activity";

  useEffect(() => {
    fetchVisitors();
  }, []);

  const fetchVisitors = async () => {
    try {
      const res = await fetch(`${apiUrl}/all`);
      const data = await res.json();
      setVisitors(data);
    } catch (error) {
      console.error("Fetch Error:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = isEditing ? "PUT" : "POST";
    const url = isEditing ? `${apiUrl}/update/${editingId}` : `${apiUrl}/register`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: isEditing ? "Visitor updated" : "Visitor registered successfully",
        });
        setFormData(initialFormData);
        setIsEditing(false);
        setShowForm(false);
        fetchVisitors();
      } else {
        Swal.fire("Error", "Failed to submit visitor data", "error");
      }
    } catch (error) {
      console.error("Submit Error:", error);
    }
  };
  const handleSubmitActivity=()=>{
    Swal.fire({
      title:"Activity Submitted",
      text:"Activity has been added successfully",
      icon:"success"
    })
  }

  const handleEdit = (visitor) => {
    setFormData(visitor);
    setEditingId(visitor.id);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "You are about to delete this visitor's information.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete!",
    });

    if (confirm.isConfirmed) {
      try {
        const res = await fetch(`${apiUrl}/delete/${id}`, {
          method: "DELETE",
        });

        if (res.ok) {
          Swal.fire("Deleted!", "Visitor record has been deleted.", "success");
          fetchVisitors();
        }
      } catch (error) {
        console.error("Delete Error:", error);
      }
    }
  };

  const handleAttend = async (id) => {
    try {
      const res = await fetch(`${apiUrl}/attend/${id}`, {
        method: "PUT",
      });

      if (res.ok) {
        Swal.fire("Success", "Visitor marked as attended", "success");
        fetchVisitors();
      }
    } catch (error) {
      console.error("Attend Error:", error);
    }
  };

  const filteredVisitors = visitors.filter((v) =>
    [v.visitorName, v.purpose, v.phoneNumber, v.departmentToVisit]
      .join(" ")
      .toLowerCase()
      .includes(searchText.toLowerCase())
  );

  const columns = [
    { name: "ID", selector: (row) => row.id, sortable: true },
    { name: "Date", selector: (row) => row.timeIn,sortable:true },
    { name: "Name", selector: (row) => row.visitorName, sortable: true },
    { name: "Purpose", selector: (row) => row.purpose, sortable: true },
    { name: "Phone", selector: (row) => row.phoneNumber },
    { name: "Department", selector: (row) => row.departmentToVisit },
    {
      name: "Attended?",
      cell: (row) =>
        row.attended ? (
          <span className="badge bg-success">Yes</span>
        ) : (
          <span className="badge bg-danger">No</span>
        ),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <>
          <button
            className="btn btn-sm btn-warning me-2"
            onClick={() => handleEdit(row)}
          >
            Edit
          </button>
          {!row.attended && (
            <button
              className="btn btn-sm btn-success me-2"
              onClick={() => handleAttend(row.id)}
            >
              Attend
            </button>
          )}
          <button
            className="btn btn-sm btn-danger"
            onClick={() => handleDelete(row.id)}
          >
            Delete
          </button>
          <button className="btn btn-info btn-sm" 
          onClick={()=>{
            setActivities(!Activities);
            setisEditingActivity(!isEditingActivity);
          }
            }>Activities</button>
        </>
      ),
    },
  ];

  return (
   
    <div className="container my-5">
      <h2 className="mb-4 text-center text-primary">Reception Visitors</h2>

      <div className="text-end mb-3">
        <button
          className="btn btn-outline-primary"
          onClick={() => {
            setShowForm(!showForm);
            if (!showForm) {
              setFormData(initialFormData);
              setIsEditing(false);
            }
          }}
        >
          {showForm ? "Close Form" : "Add Visitor"}
        </button>
      </div>
      {Activities && (
      <div>
        <h3>Add Activities Here</h3>
        <form onSubmit={handleSubmitActivity} className="mb-5 rounded p-4 shadow-sm bg-light">
          <div className="form-group">
            <label className="form-label">Activity</label>
            <input className="form-control" placeholder="Enter Activity Here" name="Activity" type="text"/>
          </div>
          <div className="form-group">
            <label className="form-label">Amount</label>
            <input className="form-control" placeholder="Enter Activity Here" name="Amount" type="number"/>
            <select
              name="user"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
             className="border p-2 rounded form-select w-50"
             >
            <option value="">Select a user</option>
            <option value="john">john</option>
       </select>
          </div>
          <div className="flex justify-between">
            <button className="btn btn-success btn-sm">
              {isEditingActivity?"Update":"Submit"}
            </button>
            <button className="btn btn-danger btn-sm" onClick={()=>setActivities(!Activities)}>Cancel</button>

          </div>

        </form>
        <table className="table table-bordered table-striped table-responsive bg-light shadow-sm">
          <thead className="bg-light">
            <tr>
            <th>ACtivity</th>
            <th>Amount</th>
            <th>Action</th>
            </tr>
            
          </thead>
          <tbody>
            <tr>
              <td>kusaini mkataba</td>
              <td>4000</td>
              <td><button onClick={()=>setisEditingActivity(!isEditingActivity)}>edit</button></td>
          
            </tr>
          </tbody>
        </table>
      </div>)
    }

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-5 border rounded p-4 bg-light shadow-sm"
        >
          <div className="mb-3">
            <label className="form-label">Visitor Name</label>
            <input
              type="text"
              name="visitorName"
              className="form-control"
              value={formData.visitorName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Purpose of Visit</label>
            <input
              type="text"
              name="purpose"
              className="form-control"
              value={formData.purpose}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Phone Number</label>
            <input
              type="text"
              name="phoneNumber"
              className="form-control"
              value={formData.phoneNumber}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Department to Visit</label>
            <input
              type="text"
              name="departmentToVisit"
              className="form-control"
              value={formData.departmentToVisit}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className={`btn ${
              isEditing ? "btn-warning" : "btn-primary"
            } w-100`}
          >
            {isEditing ? "Update Visitor" : "Register Visitor"}
          </button>
        </form>
      )}

      <DataTable
        title="Visitor List"
        columns={columns}
        data={filteredVisitors}
        pagination
        highlightOnHover
        striped
        responsive
        subHeader
        subHeaderComponent={
          <input
            type="text"
            className="form-control w-50"
            placeholder="Search visitors..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        }
      />
    </div>
  );
};

export default ReceptionManager;
