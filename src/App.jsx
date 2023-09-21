import "./App.css"
import React from 'react';
import { Route, Routes} from "react-router-dom"
import Error from "./pages/Error"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import VerifyEmail from "./pages/VerifyEmail"
import AfterLoggin from "./services/operations/AfterLoggin"

function App() {


  return (
    <div className="flex min-h-screen w-screen flex-col bg-richblack-900 font-inter">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="login"
          element={<Login />        
          }
        />

      

        <Route
          path="signup"
          element={
              <Signup />
          }
        />
        <Route
          path="verify-email"
          element={
              <VerifyEmail />
          }
        />
        
        <Route
         path="operations/AfterLoggin"
          element={<AfterLoggin/>
          } />

         

        {/* 404 Page */}
        <Route path="*" element={<Error />} />
      </Routes>
    </div>
  )
}

export default App
