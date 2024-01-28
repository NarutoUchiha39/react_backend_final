import { Link } from "react-router-dom"
import '../css/Navbar.css'
//import PropTypes from 'prop-types';

function Navbar()
{
    function logout()
    {
        fetch("https://hostedwebsitebackend-pqob.onrender.com/auth/logout",
        {
            method : "POST",
            headers : {"Content-Type":"application/json"},
            body: JSON.stringify(
                {
                    csrf:sessionStorage.getItem("csrf")
                }
            )
        }
        ).then(()=>{
            sessionStorage.clear()
            window.location='/'
        })
    }
  
  
    return(
        <nav>
            <div className="wrapper">
                <div className="wrapper-logo">
                    <div className="logo">
                        <div className="image"><img src="/kjsce.png" alt="" /></div>
                    </div>

                    <div className="name" style={{marginLeft:"9px"}}>                            
                           <Link to={"/Home"}>People Counter</Link> 
                    </div>

                </div>

                <div className="credentials">
                    <div className="login">
                        {!sessionStorage.getItem("csrf")?<Link to={"/authenticate"}>Login </Link>:<Link onClick={logout}>Logout</Link>}
                        
                    </div>
                </div>

                
            </div>

        </nav>
    )

}


export default Navbar