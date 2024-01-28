import { useState } from "react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
// import '.././css/GuestEntries.css'
function LogDetails()
{
    const {id} = useParams()
    let[Person,Set_Person] = useState({Name:[],Attribute:[],timeStamp:[]})
    let[category,Set_Category] = useState({Category:"",Attribute:""})
    useEffect(()=>{
            async function non_ultra_plus(){

                await fetch(`https://hostedwebsitebackend-pqob.onrender.com/logs/general/${id}`,{
                headers:{"Content-Type":"application/json"},
                method:"GET"
            }).catch((err)=>{
                console.log(err)
            }).then((data)=>{
                return data.json()
            }).then((data)=>
            {
                let Name = []
                let Attribute = []
                let timestamp = []
                data.map((element)=>{
                    Name.push(element.Email)
                    timestamp.push(element.timestamp)
                    Attribute.push(element.Email)
                })

                Set_Person((state)=>({...state,Name:Name,Attribute:Attribute,timeStamp:timestamp}))
                
                


                console.log(data,id)
            })
                
               
            }

            non_ultra_plus()
    },[id]        
    )
    useEffect(()=>{
        if( id == "Student"){
            Set_Category((state)=>({...state,Category:"Student",Attribute:"Roll Number"}))
        }else{
            Set_Category((state)=>({...state,Category:"Teacher",Attribute:"Email"}))
        }
        let timr = setInterval(
        async ()=>{
            await fetch(`https://hostedwebsitebackend-pqob.onrender.com/logs/general/${id}`,{
                headers:{"Content-Type":"application/json"},
                method:"GET"
            }).catch((err)=>{
                console.log(err)
            }).then((data)=>{
                return data.json()
            }).then((data)=>
            {
                let Name = []
                let Attribute = []
                let timestamp = []
                data.map((element)=>{
                    Name.push(element.Email)
                    timestamp.push(element.timestamp)
                    Attribute.push(element.Email)
                })

                Set_Person((state)=>({...state,Name:Name,Attribute:Attribute,timeStamp:timestamp}))



                console.log(data,id)
            })
        },(5*1000)
    )
    
    return(
        ()=>{
            console.log("ok");
            clearInterval(timr)
        }
    )
    },[id])
    
    return(
    <>
  
    {Person.Name.length ==0  ? <div className="Message">No Entries yet !!</div> : 
    <div className="oo">
    <table>
        <thead>
            <tr>
                <th>
                    {category.Category}
                </th>
                <th>
                    {category.Attribute}
                </th>

                <th>
                    Time Stamp
                </th>
            </tr>
        </thead>

        <tbody>
            {
                Person.Name.map((element,i)=>(
                    <tr key={i}>
                        <td>
                        {element}
                        </td>
                        <td>
                            {Person.Attribute[i]}
                        </td>

                        <td>
                            {Person.timeStamp[i]}
                        </td>
                        
                    </tr>

                    
                ))
            }
           
        </tbody>
    </table>
    </div>
        
    }
  
    </>
)}

export default LogDetails