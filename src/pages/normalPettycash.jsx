import React from "react";
import { useState } from "react";
import Swal from "sweetalert2";

const initialFormData={
    date: "",               // for LocalDate
    description: "",        // for transaction description
    amountIn: "",           // for Double (money in)
    amountOut: "",          // for Double (money out)
    advocateComment: "",    // for advocate/lawyer comments
};
const cashPayment=()=>{
    const[formData,setFormData]=useState(initialFormData);
    const[cashPaymentData,setCashPaymentData]=useState([]);
    const[isloanding,setIsLoaading]=useState("");
    const[isEditing,setIsEditing]=useState(false);
    const[showForm,setShowForm]=useState(false);
    const [error, setError]=useState("");
    //handle change in form
    const handleChange=(e)=>{
        setFormData({...formData, [e.target.name]:e.target.value});
    }
// Below is the function for handling sub,itting and updating of data
const handleSubmit=async(e)=>{
    e.preventDefault();
    const result= await Swal.fire({
        title:"Are you sure?",
        text:"You want to add or edit some data",
        icon:"info",
        showCancelButton:true,
        cancelButtonColor:"red",
        cancelButtonText:"No",
        confirmButtonColor:"green",
        confirmButtonText:"Yes ..add/edit"
    })
    if(!result.isConfirmed) return;
    try{
        const url=isEditing?`http://localhost:9092/Client/api/edit/${formData.id}`
        : "http://localhost:9092/Client/api/add";
        const method=isEditing?"PUT":"POST"
        const res= await fetch(url,{
            method:method,
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify(formData)
        })
        if(!res.ok){
            throw new error("failed to save record");
        }
        const updatedData=res.json();
        if(isEditing){
            setCashPaymentData((prev)=>prev.map((items)=>items.id===id?updatedData:items));
        }
        else{
            setCashPaymentData((prev)=>[...prev, updatedData]);
        }
     

    }
    catch(err){
        Swal.fire("Errors", err.message,"error");

    }
}
//Below is the function for fetching data
    const fetchCashData=async()=>{
        setIsLoaading(true);
        try{
            const res=await fetch("http://localhost:9094/pettycash/add");
            if(!res.ok){
                throw new Error("failed to load data");
            }
            const data=await res.json();
            setCashPaymentData(data);
        }
        catch(err){
            setError(err.message);
        }
        finally{
            setIsLoaading(false);
        }  
    }
    //handle edit
    const handleEdit=(items)=>{
             setIsEditing(true);
             setFormData(items);
             setShowForm(true);
    }
    const handleDelete=async(id)=>{
        const result=await Swal.fire({
            title:"Are you sure",
            text:"You want to delete this item",
            icon:"warning",
            showCancelButton:true,
            cancelButtonColor:"red",
            confirmButtonColor:"green",
            cancelButtonText:"Yes",
            confirmButtonText:"Yes .. Delete"
        })
        if(!result.isConfirmed) return;
        try{
            const res=await fetch(`http://localhost:9092/client/api/delete/${id}`,{
                method:"DELETE"
             })
             if(!res.ok){
                throw new error("Failed to delete item");
             }
             setCashPaymentData((prev)=>prev.filter((items)=>items.id!==id))


        }
        catch(err){
            Swal.fire("Error", err.message, "error");
            
        }
       
          
    }
    return(
        <div className="Container mt-5">
            <div className="table-responsive">
                <table table-bordered table-hover>
                    <thead className="table-dark">
                    <tr>
                        {Object.keys(cashPaymentData[0]).map((key,index)=>(
                            
                                <th key={index}>{key.toUpperCase()}</th>
                        ))}
                        <th colSpan={2}>Action</th>
                           </tr>

                    </thead>
                    <tbody>
                        {cashPaymentData.map((items, index)=>(
                            <tr key={index}>
                                {Object.values(items).map((values, idx)=>(
                                    <td key={idx}>{values}</td>
                                ))}
                                <td><button className="btn btn-warning bg-primary" onClick={()=>handleEdit(items)}>edit</button></td>
                                <td><button className="btn btn-danger bg-red" onClick={()=>handleDelete(items.id)}>delete</button></td>
                           
                            </tr>
                        ))}
                       
                    </tbody>
                </table>
            </div>
            {showForm &&
                 <form onSubmit={handleSubmit} className="mb-4">
                    <div className="row">
                        {Object.keys(initialFormData).map((key, index)=>(
                            <div className="col-md-4 mb-3" key={index}>
                                <label>{key.replace(/([A-Z])/g, "$1").replace(/^./,str=>str.toUpperCase())}</label>
                                <input
                                 type={key.includes("date")?
                                    "date":key.includes(amaountIn)||key.includes(amountOut)?"number":"text"
                                }
                                name={key}
                                placeholder={key.replace(/([A-Z])/g,"$1").replace(/^./, str=>str.toLowerCase)}
                                value={formData[key]}
                                onChange={handleChange}
                                className="form-control"
                                required={["date","amountIn","clientName"].includes(key)}

                               />
                            </div>
                        ))}
                        <button type="submit" className="btn btn-success">Save</button>
                    </div>

                 </form>
            }
        </div>

    )
}
export default cashPayment;