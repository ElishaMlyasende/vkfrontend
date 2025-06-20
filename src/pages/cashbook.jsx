// this is just for mobile petty cash



import { Button } from "bootstrap";
import React from "react";
import { useState,useEffect } from "react";
import Swal from "sweetalert2";
const initialFormData = {
    date: "",                 // for LocalDate
    clientName: "",           // for String
    controlNumber: "",        // for String
    amountIn: "",             // for BigDecimal, will be treated as a number
    amountOut: "",            // for BigDecimal
    mpesaFee: "",             // for BigDecimal
    advocateComment: "",      // for String
  };
const cashBook=()=>{
    const [cashBookData,setCashBookData]=useState([]);
    const [isloanding, setIsLoaading]=useState(false);
    const [showForm, setShowForm]=useState(false);
    const [error, setError]=("");
    const[isEditing, setIsEditing]=useState(false);
    const[formData, setFormData]=useState(initialFormData);
    const handleChange=(e)=>{
        setFormData({...formData, [e.target.name]:e.target.value});
    }
    //Function to handle submitting and editing at the same time
    const handleSubmit=async(e)=>{
        e.preventDefault();
        const Result= await Swal.fire({
            title:"Are you sure",
            text:"You want to save this Item?",
            icon:"info",
            showCancelButton:true,
            cancelButtonColor:"red",
            confirmButtonColor:"green",
            confirmButtonText:"Yes Update",
            cancelButtonText:"No" 
        });
        if((!Result).isConfirmed) return;
        const url=isEditing?`http://localhost:9092/Client/api/edit/${formData.id}`
                             : "http://localhost:9092/Client/api/add";
        const method=isEditing?"PUT":"POST";
        try{
            const res=await fetch(url,{
                method:method,
                headers:{"Content-Type":"application/json"},
                body: JSON.stringify(formData)
            });
            if(!res.ok){
                throw new error("failed to save data");
            }
            const updatedData=res.json();
            if(isEditing){
                setCashBookData((prev)=>prev.map((item)=>item.id===updatedData.id?updatedData:item));
            }
            else{
                setCashBookData((prev)=>[...prev, updatedData]);
            }

        }
        catch(err){
            Swal.fire("Error",err.message,"error");
        }
    }
    // Function for handling editing
    const handleEdit=async(item)=>{
        setIsEditing(true);
        setShowForm(true);
        setCashBookData(item);

    }
    //Function that handle delete
     const handleDelete=async(id)=>{
       const result= await Swal.fire({
        title:"Are you sure",
        text:"You want to delete this item?",
        icon:"warning",
        showCancelButton:true,
        confirmButtonColor:"green",
        cancelButtonColor:"red",
        confirmButtonText:"Yes, Delete",
        cancelButtonText:"Cancel"
       })
       if(!result.isConfirmed) return;
        try{
            const res = await fetch(`http://localhost:9092/client/api/delete/${id}`,{
                method:"DELETE"
            })
            if(!res.ok){
                throw new error("failed to delete");
            }
              setCashBookData((prev)=>prev.filter((item)=>item.id!==id));

        }
        catch(err){
          Swal.fire("Error", err.message, "error");
        }
       
     }
    
     const fetchCashBookData=async()=>{
         setIsLoaading(true);
        try{
            const res=await fetch("http:localhost:9093/cashbook/api/all");
            if (!res.ok){
                throw new Error("failed to load data");
            }
            const fetchedDta= await res.json();
            setCashBookData(data);
        }
        catch(err){
            setError(err.message);
            
        }
        finally{
            setIsLoaading(false);
        }
       
        
     }
     return(
          <>
          {/* 🔵 Form */}
          {showForm && (
  <form onSubmit={handleSubmit} className="mb-4">
    <div className="row">
      {Object.keys(initialFormData).map((key, index) => (
        <div className="col-md-4 mb-3" key={index}>
          <label>{key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}</label>
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

          <div className="Container mt-5">
          <Button className="btn btn-primary" onClick={()=>setShowForm(!showForm)}>
            {showForm?"Cancel":"Add PettyCash"}</Button>
           <div className="table-responsive">
            <div className="table table-bordered table-hover">
                <thead className="table-dark">
                    <tr>
                        {Object.keys(cashBookData[0]).map((item,index)=>(
                            <th key={index}>{item.toUpperCase()}</th>
                        ))}
                        <th colSpan={2}>Action</th>
                    </tr>

                </thead>
                <tbody>
                    {cashBookData.map((item,index)=>(
                          <tr key={index}>
                            {Object.values(item).map((value,id)=>(
                                <td key={id}>{value}</td>

                            ))}
                            <td><button className="btn btn-waring" onClick={()=>handleEdit(item)}><Edit></Edit></button></td>
                            <td><button className="btn btn-danger" onClick={()=>handleDelete(item.id)}>Delete</button></td>
                      </tr>
                    ))}
                   
                </tbody>
            </div>
        </div>


           </div>

          </>
   
       
     );

}
export default cashBook;