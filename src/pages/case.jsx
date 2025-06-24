import React from "react";
import { useState } from "react";
import Swal from "sweetalert2";

const caseManagement=()=>{
    const [formData,setFormData]=useState(initialFormDta);
    const[caseData,setCaseData]=useState([]);
    const[isEditing,setIsEditing]=useState(false);
    const[showForm, setShowForm]=useState(false);
    const[isloanding,setIsLoaading]=useState(false);
    constp[error,setError]-=useState("");
    const handleDelete=async(id)=>{
        const result= await Swal.fire({
            title:"Are you sure ",
            text:"Yu want to remove this record?",
            icon:"warning",
            showCancelButton:true,
            cancelButtonColor:"red",
            confirmButtonColor:"green",
            cancelButtonText:"No",
            confirmButtonText:"Yes ...Delete"

        })
        if(!result.isConfirmed)return;
        try{
            const res=await fetch(`http://localhost:9092/client/api/delete/${id}`,{
                method:"DELETE"
            });
            if(!res.ok){
                Swal.fire("failed to delete record");
            }
        setCaseData((prev)=>prev.filter((item)=>item.id!==id));

        }
        catch(err){
            Swal.fire("Error", err.message, "error");

        }
    }
    const fetchCaseData=async()=>{
        try{
            setIsLoaading(!isloanding);
            const res=await fetch("http://localhost:9099/case/all");
            if(!res.ok){
                throw new console.error("no record found");
                
            }
            const data=await res.json();
            setCaseData(data);

        }
        catch(err){
            setError(err.message);

        }
        finally{
            setIsLoaading(false);
        }
    }
                 return(
                    <div className="Container mt-4">
                        <div className="table-Responsive">
                            <table className="table table-bordered table-hover">
                                <thead className="table-dark">
                                    <tr>
                                    {Object.keys(caseData[0]).map((key, index)=>(
                                        <th key={index}>{key.toUpperCase()}</th>
                                    ))}
                                    <th colSpan={2}><Action></Action></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {caseData.map((item,id)=>
                                    <tr key={id}>
                                        {Object.values(item).map((value, idx)=>(
                                            <td key={idx}>{value}</td>
                                        ))}
                                        <td><button className="btn btn-waring" onClick={()=>handleUpdate(item)}>Edit</button></td>
                                        <td><button className="btn btn-danger" onClick={()=>handleDelete(item.id)}>delete</button></td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>

                    </div>

                 );

}
export default caseManagement;