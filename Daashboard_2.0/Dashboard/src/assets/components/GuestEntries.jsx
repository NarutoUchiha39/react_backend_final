import { useEffect } from "react"
import { useState } from "react"
// import '../css/GuestEntries.css'    

function GuestEntries() {

  

    let [guests,set_guests] = useState({Name:[],number:[]})
  
    useEffect(()=>{

        // eslint-disable-next-line no-unused-vars
     

        async function fetchGuest(){

            let res =  await fetch('https://hostedwebsitebackend-pqob.onrender.com/logs/getGuestUsers',{
                headers:{"Content-Type":"application/json"},
                method:"GET"
            }).then((res)=>{
                return res.json()
            })
            
            let names = []
            let number = []
            for (let index = 0; index < res.length; index++) {
                

                names.push(res[index].name)
                number.push(res[index].number)
            }
            
            set_guests((state)=>(
                {
                   ...state, Name:names,number:number
                }
            ))

     

           
        }

        fetchGuest()
    },[])
  return (
    <>
        {guests.Name.length ==0  ? <div className="Message">No Entries yet !!</div> : 
       
        <table id="Ok">
            <thead>
                <tr>
                    <th>
                        Name
                    </th>
                    <th>
                        Number
                    </th>
                </tr>
            </thead>
            <tbody>
                
                    {guests.Name.map((element,i)=>(
                         <tr  key={i}>       
                                <td >{element}</td>
                                <td>{guests.number[i]}</td>
                        </tr>
                        
                    )

                    )}


                
            </tbody>
        </table>
       
                    }
    </>
  )
}

export default GuestEntries