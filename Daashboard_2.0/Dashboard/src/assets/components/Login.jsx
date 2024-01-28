
//import axios from 'axios';
import { GoogleOAuthProvider,GoogleLogin } from '@react-oauth/google';
import '../css/Login.css';
//import { redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
function Login(props) {


  function handleSubmit(event)
    {
        
        event.preventDefault()
        let password = event.target.password.value
        let email = event.target.email.value

        fetch("https://hostedwebsitebackend-pqob.onrender.com/auth/login",{

          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({
          "email":email,
          "password":password
          })
        })
        .then(response=>{
          return response.json()
        }
        )
        .then(
          data=>{
            if(data["authenticated"]){
              let csrf = data["csrf"]
              
              sessionStorage.setItem("csrf",csrf)
              sessionStorage.setItem("email",data["Email"])
              sessionStorage.setItem("name",data["Name"])
              window.location="/Home"
            }

            else{
              props.control({notification:"error",message:data["error"]})
              setTimeout(()=>
                {
                    props.control({notification:null,message:null})
                },10000
              )
              console.log(data["error"]);
            }

            
          }
          
        )
        
      
    }

  return (
    
    <>

      <form onSubmit={handleSubmit}>
        <div className="wrapper-form">
          <div className="Email_Cred">
            <label htmlFor="Email">Enter Email</label>
            <input type="email" id="Email" name="email" />
          </div>

          <div className="password-cred">
            <label htmlFor="password">Enter Password</label>
            <input type="password" name="password" />
          </div>
          <div className="submit" style={{display:'flex'}}>
              <input
                type="submit"
                value="submit"
                style={{ width: '20%', marginLeft: '10%',marginRight:'2vh'}}
              />
            
            <GoogleOAuthProvider clientId="149620841284-1eebrqih8ge705pdt2ieubsea0astvav.apps.googleusercontent.com" >
              
                  <GoogleLogin
                  onSuccess={credentialResponse => {
                    console.log(credentialResponse);
                  }}
                  onError={() => {
                    console.log('Login Failed');
                  }}
                />
            </GoogleOAuthProvider>
            </div>
        </div>
      </form>
    </>
  )
}

Login.propTypes={
  notifications : PropTypes.object,
  control:PropTypes.func
}

export default Login;





