import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import "bootstrap/dist/css/bootstrap.min.css";
import { hasPermission } from "./UserPermissionGranted";

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
  const [showActivities,setShowActivities]=useState(false);
  const [selectedUser,setSelectedUser]=useState("");
  const[isEditingActivity,setisEditingActivity]=useState(false);
  const[ActivityId,setActivityId]=useState(null);
  const[InitialFormDataActivity,setInitialFormDataActivity]=useState({amount:"",activity:""});
  const[edtingActivityData,setIsEditingActivityData]=useState({amount:"",activity:"",id:"",received:""});
  const[users,setUsers]=useState([]);
  const[ReceptionActivityData,setReceptionActivityData]=useState([]);


  const apiUrl = "http://localhost:9092/api/reception";
  //FETCHING USER ACTIVITY DATA
  const fetchReceptionActivityData=async(ActivityId)=>{
    try{
      const res=await fetch(`http://localhost:9092/Reception/Client/Activity/ById/${ActivityId}`)
      const data=await res.json();
      setReceptionActivityData(data);
    }
    catch(err){
      console.error("error in fetching activity data", err);
    }
  }
  //here just deleting the activity record according to id
  const handleDeleteActivity=async(id)=>{
    const result=await Swal.fire({
      title:"Sure ?",
      text:"You Want To Remove This Record",
      icon:"question",
      showCancelButton:true,
      cancelButtonText:"No...",
      cancelButtonColor:"red",
      confirmButtonText:"Yes.....Remove",
      confirmButtonColor:"green"
    })
    if(!result.isConfirmed)return;
    try{
      const url=await fetch(`http://localhost:9092/Reception/Client/Activity/delete/${id}`,{
        method:"DELETE"
      });
        if(url.ok){
          Swal.fire({
            title:"Success",
            text:"Record Deleted Successfully",
            icon:"success"
          })
          fetchReceptionActivityData(ActivityId);
        }
        else{
          Swal.fire("Failed to delete data", "Something went wrong");
        }

    }
    catch(err){
      Swal.fire("Error",err.message,"error");
    }
  }
  // here am trying to find all users
  const fetchUsers=async()=>{
    try{
      const res=await fetch("http://localhost:8082/api/v1/user/all");
        const data=await res.json();
        setUsers(data);
    }
    catch(err){
        console.error("Fetch error ", err);
    }
    
  }
  useEffect(() => {
    fetchVisitors();
    fetchUsers();
  }, []);

  const fetchVisitors = async () => {
    try {
      const res = await fetch(`${apiUrl}/all`);
      const data = await res.json();
      setVisitors(data);
    } catch(err) {
      console.error("Fetch Error", err);
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleChangeActivity=(e)=>{
    setInitialFormDataActivity({...InitialFormDataActivity,[e.target.name]:e.target.value})
    setIsEditingActivityData({...edtingActivityData,[e.target.name]:e.target.value})
  }

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
  const handleSubmitActivity=async()=>{
    const Result=await Swal.fire({
      title:"Sure?",
      text:isEditingActivity?"You Want to Update This Item":"You Want to Add This Activity",
      icon:"question",
      showCancelButton:true,
      cancelButtonText:"No/Cancel",
      confirmButtonText:"Yes/Submit",
      confirmButtonColor:"green",
      cancelButtonColor:"red"
    })
    if(!Result.isConfirmed) return;
    try{
      const method=isEditingActivity?"PUT":"POST";
      const url=isEditingActivity?`http://localhost:9092/Reception/Client/Activity/edit/${edtingActivityData.id}`
                                  :"http://localhost:9092/Reception/Client/Activity/add";
      const res=await fetch(url,{
        method:method,
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          amount: isEditingActivity ? edtingActivityData.amount : InitialFormDataActivity.amount,
          activity: isEditingActivity ? edtingActivityData.activity : InitialFormDataActivity.activity,
          reception: { id: ActivityId },
          received: isEditingActivity ? edtingActivityData.received : selectedUser
        })
      })
      if(res.ok){
        Swal
        .fire({
          title:"success",
          text:isEditingActivity?"Updated Successfully":"Added Successfully",
          icon:"success"
        })
        fetchReceptionActivityData(ActivityId);
      }
      else{
        Swal.fire("Failed To save");
      }

    }
    catch(err){
      Swal.fire("Error", err.message, "error");
    }
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
        {hasPermission("EDIT_VISTOR")&& <button
            className="btn btn-sm btn-warning me-2"
            onClick={() => handleEdit(row)}
          >
            Edit
          </button>}
         
          {!row.attended && (
            <button
              className="btn btn-sm btn-success me-2"
              onClick={() => handleAttend(row.id)}
            >
              Attend
            </button>
          )}
          {hasPermission("DELETE_VISTOR")&& <button
            className="btn btn-sm btn-danger"
            onClick={() => handleDelete(row.id)}
          >
            Delete
          </button>}
          {hasPermission("VIEW_VISTOR_ACTIVITY")&&  <button className="btn btn-info btn-sm" 
          onClick={()=>{
            setShowActivities(!showActivities);
            setActivityId(row.id);
            fetchReceptionActivityData(row.id)
          }
            }>Activities</button>}
         
        
        </>
      ),
    },
  ];

  return (
   
    <div className="container my-5">
      <h2 className="mb-4 text-center text-primary">Reception Visitors</h2>

      <div className="text-end mb-3">
        {hasPermission("ADD_VISTOR")&& <button
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
        </button>}
       
      </div>
      {showActivities && (
      <div>
        <h3>Add Activities Here</h3>
        <form  className="mb-5 rounded p-4 shadow-sm bg-light">
          <input type="number" value={isEditingActivity?edtingActivityData.id:ActivityId} readOnly/>
          <div className="form-group">
            <label className="form-label">Activity</label>
            <input 
                    value={isEditingActivity?edtingActivityData.activity:InitialFormDataActivity.activity}
                    className="form-control" placeholder="Enter Activity Here"
                    name="activity" type="text"
                    onChange={handleChangeActivity}
                    />
          </div>
          <div className="form-group">
            <label className="form-label">Amount</label>
            <input 
                   value={isEditingActivity?edtingActivityData.amount:InitialFormDataActivity.amount}
                  className="form-control" placeholder="Enter Charged Amount"
                  name="amount" type="number"
                   onChange={handleChangeActivity}/>
              </div>
          <div className="form-group">
            <label className="form=label">Received By </label>
           
            <select
              name="user"
               value={isEditingActivity?edtingActivityData.received:selectedUser}
               onChange={(e) => setSelectedUser(e.target.value)}
               className="border p-2 rounded form-select w-100"
             >
                   <option value="">Select Who Received</option>
                   {users.map((item) => (
                    <option key={item.id} value={item.first_name}>
                      {item.first_name} {item.last_name}
                     </option>
                     ))}
                     </select>

            
          </div>
            
            
         
          <div className="flex justify-between">
            <button
            type="button"
            onClick={()=>handleSubmitActivity()}
             className="btn btn-success btn-sm">
              {isEditingActivity?"Update":"Submit"}
            </button>
            <button className="btn btn-danger btn-sm" 
            onClick={()=>{
              setShowActivities(false);
              

            }}>Cancel</button>

          </div>

        </form>
        <table className="table table-bordered table-striped table-responsive bg-light shadow-sm">
          <thead className="bg-light">
            <tr>
            <th>ACtivity</th>
            <th>Amount</th>
            <th>Received By</th>
            <th colSpan={2}>Action</th>
            </tr>
            
          </thead>
          <tbody>
          {ReceptionActivityData.map((item, idx)=>(
            <tr key={idx}>
            <td>{item.activity}</td>
            <td>{item.amount}</td>
            <td>{item.received}</td>
            <td colSpan={2}>
              {hasPermission("EDIT_VISTOR_ACTIVITY")&&
               <button className="btn btn-success"onClick={()=>{
                            setisEditingActivity(!isEditingActivity);
                            setIsEditingActivityData({amount:item.amount,activity:item.activity,id:item.id,received:item.received})
                            
              }
                
                }>Edit</button>}
                {hasPermission("DELETE_VISTOR_ACTIVITY")&&<button
               onClick={()=>handleDeleteActivity(item.id)}
               className="btn btn-danger">Delete</button>}
             
              
              </td>
        
          </tr>
          ))}
            
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
