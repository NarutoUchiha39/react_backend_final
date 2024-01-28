// import React from 'react'
import { Outlet } from "react-router-dom";
import { Link } from "react-router-dom";
import "../css/Sidebar.css"
function Sidebar() {
  return (
    <>


        <div className="wrapper-bar">
            <div className="sideBar">
                <div className="feature" >
                  <Link to={"/Home"}><i className="fa fa-dashboard"></i>&nbsp;&nbsp;Dashboard</Link>  
                </div>

                <div className="feature" style={{marginTop:"7vh"}} >
                   <Link to={"/GuestEntries"}><i className="fa fa-user" aria-hidden="true"></i>&nbsp;&nbsp;Guest Entries</Link> 
                </div>

                <div className="feature" style={{marginTop:"7vh"}} >
                   <Link to={"/LogDetails/Student"}><i className="fa fa-user-graduate" aria-hidden="true"></i>&nbsp;&nbsp;Student Entries</Link> 
                </div>

                <div className="feature" style={{marginTop:"7vh"}} >
                   <Link to={"/LogDetails/Teacher"}><i className="fas fa-chalkboard-teacher" aria-hidden="true"></i>&nbsp;&nbsp;Teacher Entries</Link> 
                </div>
            </div>

            
            <Outlet/>
        </div>

    </>
    )
}

export default Sidebar