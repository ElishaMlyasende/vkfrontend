import React from "react";
import { useState, useEffect } from "react";
import { Form } from "react-router-dom";
const workFlow=()=>{
const [workData,setWorkData]=useState([]);
const[error, setError]=useState("");
const[loading,isLoading]=useState(false);

//for subitting user data

const[showForm,setShowForm] =useState(false);
const [formData,setFormData]=useState(
    {
        firstName:" ",
        middleName:"",
        lastName:" ",
        typeOfWork:"",
        dateReceivedFromBank:"",
        dateSubmittedToRegistrar:"",
        registryName:"",
        dateCollected:"",
        submissionToBankAndOfficer:"",
        agreedFee:"",
        controlNumber:"",
        amount:"",
        facilitationFee:"",
        contactPerson:"",
        remarks:"",
        profit:""
    });
const[isEditing,setIsEditing]=useState(false);

const handleChange=(e)=>{
    setFormData({...formData,[e.target.name]:[e.target.value]});

}
const handleSubmit=async(e)=>{
    e.preventDefault();
    const url=isEditing?`http://localhost:9092/Client/api/update/${formData.id}`:
                       "http://localhost:9092/Client/api/add";

    const method=isEditing?"PUT":"POST";
    try{
        const  res=await fetch(url, {
                method:method,
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify(formData)

            }
            
        );
        if(!res.ok){
            throw new error("failed to add record")
        }
        const updatedData = await res.json();

        if (isEditing) {
        setWorkData(workData.map(item => item.id === updatedData.id ? updatedData : item));
       } else {
        setWorkData([...workData, updatedData]);
       }

      setShowForm(false);
      setIsEditing(false);
        setFormData({
            firstName: "",
            middleName: "",
            lastName: "",
            typeOfWork: "",
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
            profit: "",
          });


    }
    catch(err){
          alert (err.message);
    }
}
const handleEditing=(item)=>{
    setIsEditing(true);
    setFormData(item);
    setShowForm(true);
}

const fetchWorkFlow= async()=>{
     isLoading(true);
    try{
        const res=await fetch("http://localhost:9092/Client/api/all");
        if(!res.ok){
            throw new error("failed to fetch data or data not found");
        }
        const data=await res.json();
        setWorkData(data);
        setError("");
    }
    catch(err){
        setError(err.message);
    }
    finally{
        isLoading(false);
    }
}
useEffect(
    ()=>{
        fetchWorkFlow();

    }, []

)
return (
    <div className="container mt-5">
        <button className="btn btn-primary mb-3"
        onClick={()=>setShowForm(!showForm)}
        >
            {showForm ? "Cancel":"Add Record"}
        </button>
        {showForm  &&
         (
            <form onSubmit={handleSubmit} className="mb-4">
          <div className="row">
            <div className="col-md-4 mb-3">
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            <div className="col-md-4 mb-3">
              <label>Middle Name</label>
              <input
                type="text"
                name="middleName"
                value={formData.middleName}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="col-md-4 mb-3">
              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            <div className="col-md-4 mb-3">
              <label>Type of Work</label>
              <input
                type="text"
                name="typeOfWork"
                value={formData.typeOfWork}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="col-md-4 mb-3">
              <label>Date Received From Bank</label>
              <input
                type="date"
                name="dateReceivedFromBank"
                value={formData.dateReceivedFromBank}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="col-md-4 mb-3">
              <label>Date Submitted To Registrar</label>
              <input
                type="date"
                name="dateSubmittedToRegistrar"
                value={formData.dateSubmittedToRegistrar}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="col-md-4 mb-3">
              <label>Registry Name</label>
              <input
                type="text"
                name="registryName"
                value={formData.registryName}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="col-md-4 mb-3">
              <label>Date Collected</label>
              <input
                type="date"
                name="dateCollected"
                value={formData.dateCollected}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="col-md-4 mb-3">
              <label>Submission To Bank And Officer</label>
              <input
                type="text"
                name="submissionToBankAndOfficer"
                value={formData.submissionToBankAndOfficer}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="col-md-4 mb-3">
              <label>Agreed Fee</label>
              <input
                type="number"
                name="agreedFee"
                value={formData.agreedFee}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="col-md-4 mb-3">
              <label>Control Number</label>
              <input
                type="text"
                name="controlNumber"
                value={formData.controlNumber}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="col-md-4 mb-3">
              <label>Amount</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="col-md-4 mb-3">
              <label>Facilitation Fee</label>
              <input
                type="number"
                name="facilitationFee"
                value={formData.facilitationFee}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="col-md-4 mb-3">
              <label>Contact Person</label>
              <input
                type="text"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="col-md-4 mb-3">
              <label>Remarks</label>
              <input
                type="text"
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="col-md-4 mb-3">
              <label>Profit</label>
              <input
                type="number"
                name="profit"
                value={formData.profit}
                onChange={handleChange}
                className="form-control"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-success">
            Save
          </button>
        </form>

        )
    }
      <h2 className="mb-4">Workflow Data</h2>

      {loading && <div className="alert alert-info">Loading...</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && workData.length > 0 && (
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-dark">
              <tr>
                {Object.keys(workData[0]).map((key, index) => (
                  <th key={index}>{key.toUpperCase()}</th>
                ))}
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {workData.map((item, index) => (
                <tr key={index}>
                  {Object.values(item).map((value, idx) => (
                    <td key={idx}>{value}</td>
                  ))}
                  <td><button className="btb btn-danger" onClick={handleEditing(item)}>
                    Edit
                    </button>
                    </td>
                  
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && workData.length === 0 && (
        <div className="alert alert-warning">No data available.</div>
      )}
    </div>
  );

}
export default workFlow;

