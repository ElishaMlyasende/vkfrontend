import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import "bootstrap/dist/css/bootstrap.min.css";
import { Client } from "stompjs";
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
  controlNumber: "",
  contactPerson: "",
  remarks: "",
};

const WorkFlow = () => {
  const[MortageAmount,setMortageAmount]=useState(null);
  const [workData, setWorkData] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const[showActivities, setShowActivities]=useState(false);
  const[editingMortage,isEditingMortage]=useState(false);
  const[ActivityData,setActivityData]=useState([]);
  const[ActivityId, setActivityId]=useState(null);
  const[InitialFormDataActivity, setInitialFormDataActivity]=useState({activity:"",amount:"",facilitationFee:""});
  const[MortageUpdatingData, setMortageUpdatingData]=useState({id:null,amount:"",activity:"",facilitationFee:""});

  const FetchActivityData=async(ActivityId)=>{
    try{
      const res=await fetch(`http://localhost:9092/Client/Activities/all/${ActivityId}`)
      if(res.ok){
        const data= await res.json();
        setActivityData(data);
        setShowActivities(true); // 
      }
    }
    catch(err){
      Swal.fire("Error",err.message,"error");
    }
    
  }
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
  const handleActivityData = (e) => {
    const { name, value } = e.target;
    if (editingMortage) {
      setMortageUpdatingData((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setInitialFormDataActivity((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
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
  };const handleActivitySubmit = async () => {
    console.log("editingMortage:", editingMortage);
    console.log("MortageUpdatingData.id:", MortageUpdatingData.id);
  
    const Result = await Swal.fire({
      title: "Are you Sure",
      text: editingMortage ? "You want to Edit this Activity ?" : "You want to Add This Activity?",
      icon: "question",
      showCancelButton: true,
      cancelButtonText: "Cancel",
      confirmButtonText: "Yes/Submit"
    });
    
    if (!Result.isConfirmed) return;
    
    try {
      const method = editingMortage ? "PUT" : "POST";
      const url = editingMortage ? 
        `http://localhost:9092/Client/Activities/EDIT/${MortageUpdatingData.id}` : 
        "http://localhost:9092/Client/Activities/add";
      
      // Log what is being sent to API:
      console.log("Submitting:", { 
        method, 
        url, 
        body: {
          activity: editingMortage ? MortageUpdatingData.activity : InitialFormDataActivity.activity,
          amount: editingMortage ? MortageUpdatingData.amount : InitialFormDataActivity.amount,
          workFloor: { id: ActivityId },
          facilitationFee: editingMortage ? MortageUpdatingData.facilitationFee : InitialFormDataActivity.facilitationFee,
        }
      });
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activity: editingMortage ? MortageUpdatingData.activity : InitialFormDataActivity.activity,
          amount: editingMortage ? MortageUpdatingData.amount : InitialFormDataActivity.amount,
          workFloor: { id: ActivityId },
          facilitationFee: editingMortage ? MortageUpdatingData.facilitationFee : InitialFormDataActivity.facilitationFee,
        }),
      });
  
      if (res.ok) {
        Swal.fire(editingMortage ? "Record Changed Successfully" : "Record Added Successfully");
        setInitialFormDataActivity({ amount: "", activity: "", facilitationFee: "" });
        isEditingMortage(false);
        FetchActivityData(ActivityId);
      } else {
        Swal.fire(editingMortage ? "Failed to Update Record" : "Failed To Add Record");
      }
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };
  
  const handleDeleteActivity=async(id)=>{
    const result=await Swal.fire({
      title:"Are Sure ?",
      text:"You Want To Remove This Activity?",
      icon:"question",
      showCancelButton:true,
      cancelButtonText:"No/Cancel",
      confirmButtonText:"Yes/Delete",
      confirmButtonColor:"green",
      cancelButtonColor:"red"
    })
    if(!result.isConfirmed)return;
    try{
      const url=`http://localhost:9092/Client/Activities/delete/${id}`
      const method="DELETE"
      const res=await fetch(url,{
        method:method
      }
       
      );
      if(res.ok){
        setActivityData((prev)=>prev.filter((item)=>item.id!==id));
        Swal.fire({
          title:"Deleted",
          text:"Activity Deleted SuccessFully",
          icon:"success"
        })
      }

    }
    catch(err){
      Swal.fire("Erroe", err.message, "error");
    }
  }

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
        //const amount = parseFloat(row.amount || 0);
        //const fee = parseFloat(row.facilitationFee || 0);
        const MortageAmount=ActivityData.reduce((sum,item)=>sum+Number(item.amount+item.facilitationFee),0);
        return (agreed - MortageAmount).toFixed(2);
      },
      sortable: true,
      cell: (row) => {
        const agreed = parseFloat(row.agreedFee || 0);
       const amount = parseFloat(row.amount || 0);
        const fee = parseFloat(row.facilitationFee || 0);
        setMortageAmount(ActivityData.reduce((sum,item)=>sum+Number(item.amount+item.facilitationFee),0))
        const profit = agreed - MortageAmount - fee;
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
        {hasPermission("EDIT_MORTGAGE")&&<button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(row)}>
            Edit
          </button>}
          {hasPermission("DELETE_MORTGAGE")&&<button className="btn btn-danger btn-sm" onClick={() => handleDelete(row.id)}>
            Delete
          </button>}
          {hasPermission("ADD_MORTGAGE_ACTIVITY")&&
          <button className="btn btn-info btn-sm me-2 "onClick={()=>{
            setShowActivities(true);
            setActivityId(row.id);
            FetchActivityData(row.id);
            
          

            }}>
            Activities
            </button>}
          
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
        {hasPermission("ADD_MORTGAGE")&& <button
          className="btn btn-outline-primary"
          onClick={() => {
            if (!showForm) resetForm();
            setShowForm((prev) => !prev);
          }}
        >
          {showForm ? "Close Form" : "Add New Record"}
        </button>}
       
      </div>
  
      {showActivities &&(<div>
              <h3>Add Client Activities Here</h3>
              <form className="border p-4 rounded mb-4 bg-light shadow-sm">
                <input type="hidden" value={editingMortage?MortageUpdatingData.id:ActivityId} readOnly/>
                <div className="form-group"><label className="form-label">Activity </label>
                <input 
                        onChange={handleActivityData}
                        type="text"name="activity" placeholder="Enter Activity"
                        className="form-control"
                        value={editingMortage?MortageUpdatingData.activity:InitialFormDataActivity.activity}
                        />
               </div>
               <div className="form-group">
                <label className="form-label">Amount Charged</label>
                <input
                       value={editingMortage?MortageUpdatingData.amount:InitialFormDataActivity.amount}
                       onChange={handleActivityData}
                        className="form-control" placeholder="Enter amount" type="number" name="amount"
                        />
               </div>
               <div className="form-group">
                <label className="form-label">Facilitation Fee</label>
                <input
                       value={editingMortage?MortageUpdatingData.facilitationFee:InitialFormDataActivity.facilitationFee}
                       onChange={handleActivityData}
                        className="form-control" placeholder="Enter Facilitation Fee"
                         type="number" name="facilitationFee"
                        />
               </div>
               <div className="flex justify-between mt-4 w-full">
                <button

                type="button"
                onClick={handleActivitySubmit}
                 style={{
                     backgroundColor: "green",
                     color: "white",
                     border: "none", // ← haina border
                     borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "16px",
                     fontWeight: "600",

                }}>
                 {editingMortage?"Edit":"Submit"} 
                </button>
               <button
               type="button"
                     onClick={() => setShowActivities(!showActivities)}
                      style={{
                                 backgroundColor: "red",
                                 color: "white",
                                 border: "none", // ← haina border
                                 borderRadius: "8px",
                                cursor: "pointer",
                                fontSize: "16px",
                                 fontWeight: "600",
                                 margin:"50px"
                                 
                       }}
                        >
                          Cancel
                          </button>

               </div>
               

                
              </form>
                <div  style={{ fontFamily: "Arial" }} className="bg-light  text-white rounded shadow-sm font-size-14">
                <h4>Activities</h4>
                <table className="table fw-bold  bg-light mb-70 table-responsive table-striped">
                        <thead className="table-light">
                               <tr>
                                   <th>Activity</th>
                                   <th>Amount</th>
                                   <th>Faclitation Fee</th>
                                    <th colSpan={2}>Action</th>
                               </tr>
                         </thead>

                          <tbody>
                          {ActivityData.map((A, idx) => (
                              <tr key={idx}>
                              <td>{A.activity}</td>
                               <td>{A.amount}</td>
                               <td>{A.facilitationFee}</td>
                                <td colSpan={2}>
                                  {hasPermission("EDIT_MORTGAGE_ACTIVITY")&&<button className="btn btn-success" onClick={() =>{
                                    isEditingMortage(!editingMortage);
                                    setMortageUpdatingData({id:A.id,activity:A.activity,amount:A.amount,facilitationFee:A.facilitationFee});
                                   } }>
                                        Edit
                                    </button>}
                                   
        
                                     {hasPermission("DELETE_MORTGAGE_ACTIVITY")&&<button 
                                       onClick={()=>handleDeleteActivity(A.id)}
                                       className="btn btn-danger">
                                               Delete
                                       </button>}
                                     
                                    </td>
                                    </tr>
                                  ))}
                             </tbody>
                            </table>
                </div>
                

              

              </div>)
             
              }

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
