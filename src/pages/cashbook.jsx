import { Button } from "bootstrap";
import React from "react";
import { useState,useEffect } from "react";
import Swal from "sweetalert2";
const cashBook=()=>{
    const [cashBookData,setCashBookData]=useState([]);
    const [isloanding, setIsLoaading]=useState(false);
    const [showForm, setShowForm]=useState(false);
    const [error, setError]=("");
    const[isEditing, setIsEditing]=useState(false);

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
     const handleEdit=async(item)=>{

     }
     const fetchCashBookData=async()=>{
         setIsLoaading(true);
        try{
            const res=await fetch("http:localhost:9093/cashbook/api/all");
            if (!res.ok){
                throw new Error("failed to load data");
            }
            const fetchedDta=res.json();
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