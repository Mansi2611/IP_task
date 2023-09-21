import React from 'react';
import signupImg from "../assets/Images/signup.webp"
import Template from "../components/core/Auth/Template"

function Signup() {
  return (
    <Template
      title="Sign Up First to get access !"
       image={signupImg}
      formType="signup"
    />
  )
}

export default Signup
