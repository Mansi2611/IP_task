import React from 'react';
import loginImg from "../assets/Images/login.webp"
import Template from "../components/core/Auth/Template"

function Login() {
  return (
    <Template
      title="Welcome Back Login to your account!"
      image={loginImg}
      formType="login"
    />
  )
}

export default Login
