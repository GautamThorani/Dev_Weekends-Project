import React, { useContext, useEffect } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import {useNavigate} from 'react-router-dom'
const EmailVerify = () => {

    axios.defaults.withCredentials = true
    const {backendUrl, isLoggedin, userData, getUserData} = useContext(AppContext)
    const navigate = useNavigate()
    const inputRefs = React.useRef([]);

    const handleInput = (e, index) => {
        if(e.target.value.length > 0 && index < inputRefs.current.length - 1) {
            inputRefs.current[index + 1].focus()
        }
    } 

const handleKeyDown = (e, index) => {
  if (e.key === 'Backspace') {
    if (e.target.value === '') {
      if (index > 0) {
        inputRefs.current[index - 1].focus();
      }
    } else {
      // Clear the value first so pressing backspace removes current digit
      e.target.value = '';
    }
  }
};

const handlePaste = (e) => {
  e.preventDefault();  // Prevent default paste behavior
  const paste = e.clipboardData.getData('text');
  const pasteArray = paste.split('');
  pasteArray.forEach((char, index) => {
    if (inputRefs.current[index]) {
      inputRefs.current[index].value = char;
      if (index < inputRefs.current.length - 1) {
        inputRefs.current[index + 1].focus();
      }
    }
  });
};

const onSubmitHandle = async (e) => {
    try {
        e.preventDefault();
        const otpArray = inputRefs.current.map(e => e.value);
        const otp = otpArray.join('');

        if (otp.length !== 6) {
            toast.error('Please enter a 6-digit OTP');
            return;
        }

        const {data} = await axios.post(backendUrl + '/api/auth/verify-email', {otp});

        if(data.success){
            toast.success(data.message);
            getUserData();
            navigate('/');
        } else {
            toast.error(data.message);
            // Clear inputs on failure
            inputRefs.current.forEach(input => input.value = '');
            inputRefs.current[0]?.focus();
        }
    } catch (error) {
        toast.error(error.response?.data?.message || error.message);
        console.error('Verification error:', error);
    }
}

useEffect(() => {
  if (isLoggedin && userData && userData.isAccountVerified) {
    navigate('/');
  }
}, [isLoggedin, userData, navigate]);
    return ( 
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-400">
        <img onClick={()=> navigate('/')} src={assets.logo} alt="" 
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"/>
        <form onSubmit = {onSubmitHandle} className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm">
            <h1 className="text-white text-2xl font-semibold text-center mb-4">Email Verify Otp</h1>
            <p className="text-center m-6 text-indigo-300">Enter the 6-digit code sent to your email</p>
            <div className="flex justify-between mb-8" onPaste={handlePaste}>
                {Array(6).fill(0).map((_, index)=>(
                    <input type="text" maxLength='1' key={index} required
                     className="w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md"
                     ref={e => inputRefs.current[index] = e}
                     onInput={(e) => handleInput(e, index) }
                     onKeyDown={(e) => handleKeyDown(e, index)}/>
                ))}
            </div>

            <button className="w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full">Verify Email</button>
        </form>
    </div> 
    )
}

export default EmailVerify;