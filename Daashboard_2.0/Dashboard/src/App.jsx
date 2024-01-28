import { BrowserRouter, Route, Routes } from "react-router-dom"
import Navbar from "./assets/components/Navbar"
import Home from "./assets/components/Home"
import Login from "./assets/components/Login"
import { useEffect, useState } from "react"
import BootstrapErrors from "./assets/components/BootstrapErrors";
// import Logout from "./assets/components/Logout"
import LogDetails from "./assets/components/LogDetails"
import Sidebar from "./assets/components/Sidebar";
// import GuestEntries from "./assets/components/GuestEntries";
import Table from "./assets/components/Table"
// import {io } from "socket.io-client"
function App()
{


  // const socket = io('http://localhost:4001');
  const [notifications,set_notifications] = useState({
    notification:null,
    message:null
  })
  
  const[counts,set_counts,busiest_day,busiest_hour] = useState({"in":0,"out":0,"busiest_hour":0,"busiest_day":""})
  const[counts_face,set_counts_face] = useState({"student":0,"teacher":0,"unknown":0})
  useEffect(()=>
  {
      // function check_counts(value)
      // {
      //   set_counts(value)
      // }

      // function check_counts_face(value)
      // {
      //   set_counts_face(value)
      // }

      // socket.on("Update",check_counts)
      // socket.on("Update_FaceDetection",check_counts_face)

      // return(
      //   ()=>{
      //     console.log("Switching off connection");
      //     socket.off("Update",check_counts)
      //     socket.off("Update_FaceDetection",check_counts_face)
      //   }
      // )

      async function fetch_data(){
        let res = await fetch('http://localhost:3000/connection/faces',{
          method:"GET",
          headers:{"Content-Type":"application/json"}
        })
        return await res.json()
      }

      const myTimeout = setTimeout(async()=>
      {
          let res = await fetch_data();
          let teacher = res.teacher
          let student = res.student
          let unkown = res.unknown
          let in_people = res.in
          let out_people = res.out
          let busiest_hour = res.busiest_hour
          let busiest_day = res.busiest_day
          set_counts_face((element)=>({
              ...element,teacher:teacher,student:student,unknown:unkown
          }));

          set_counts((element)=>({
            ...element,in:in_people,out:out_people,busiest_day:busiest_day,busiest_hour:busiest_hour
        }));

      },2000)

      return (()=>{
        clearTimeout(myTimeout)
      })
  },[counts,counts_face]
  )

  return(
    <>
      <BrowserRouter>
        <Navbar />
        <BootstrapErrors notifications={notifications} control = {set_notifications}/>
        <Routes>
          <Route path="/" element={<Login notifications={notifications} control = {set_notifications}/>}/>
            <Route element={<Sidebar/>}>
              <Route path="/Home" element={<Home counts = {counts} counts_face={counts_face}/>}/>
              <Route path="/LogDetails/:id" element={<LogDetails/>}/>
              <Route path="/GuestEntries" element={<Table/>}/>
            
            </Route>

        </Routes>
      </BrowserRouter>
    
    </>
  )
}

export default App