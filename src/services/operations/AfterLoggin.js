import React from 'react'
import { useState } from "react"
// import { logout } from "../../../services/operations/authAPI"
import { toast } from "react-hot-toast"

import { setLoading, setToken } from "../../slices/authSlice"

import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"


import ConfirmationModal from "../../components/Common/ConfirmationModal"

function AfterLoggin() {
      const [confirmationModal, setConfirmationModal] = useState(null)
      
      const dispatch = useDispatch()
      const navigate = useNavigate()


      function logout(navigate) {
        return (dispatch) => {
          dispatch(setToken(null))
          toast.success("Logged Out")
          navigate("/")
        }
      }
  return (
    <div className='mb-14 text-3xl font-medium text-richblack-5'>
      <h1>after login</h1>
        <button
       onClick={() =>
              setConfirmationModal({
                text1: "Are you sure?",
                text2: "You will be logged out of your account.",
                btn1Text: "Logout",
                btn2Text: "Cancel",
                btn1Handler: () => dispatch(logout(navigate)),
                btn2Handler: () => setConfirmationModal(null),
              })
            }
            className="px-8 py-2 text-sm font-medium text-richblack-5"
          >
            <div className="flex items-center text-richblack-5 gap-x-2">
              <span>Logout</span>
            </div>
          </button> 
          {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}

    </div>
  )
}

export default AfterLoggin
