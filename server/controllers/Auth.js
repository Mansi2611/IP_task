const bcrypt = require("bcrypt")
const User = require("../models/User")
const OTP = require("../models/OTP")
const jwt = require("jsonwebtoken")
const ipinfo = require('ipinfo');
const otpGenerator = require("otp-generator")
const mailSender = require("../utils/mailSender")
require("dotenv").config()
const express = require("express");
const requestIp = require("request-ip");

const app = express();

// Middleware to get the user's IP address
app.use(requestIp.mw());
exports.signup = async (req, res) => {
  try {
    // Destructure fields from the request body
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      contactNumber,
      otp,
    } = req.body

    // Access the user's IP address using req.clientIp
    const ipAddress = req.clientIp;
    // const ipAddress = "127.0.0.1";
    console.log("User's IP address:", ipAddress);

    const ipInfo = await ipinfo(ipAddress);
    console.log(" ipInfo :",ipInfo)
    // Extract the country code from the ipInfo object
    const userCountryCode = ipInfo.country;

    // Define the allowed country codes
    const allowedCountryCodes = ['IN',"127.0.0.1"]; 

    // Check if the user's country code is in the allowed list
    if (!allowedCountryCodes.includes(userCountryCode) ) {
      return res.status(403).json({
        success: false,
        message: "User registration is not allowed from your location.",
      });
    }
    // Check if All Details are there or not
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp 
    ) {
      return res.status(403).send({
        success: false,
        message: "All Fields are required",
      })
    }
    // Check if password and confirm password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Password and Confirm Password do not match. Please try again.",
      })
    }

    if(!ipAddress){
      return res.status(400).json({
        success: false,
        message:
          "User Ip not found!",
      })
    }
    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists. Please sign in to continue.",
      })
    }

    // Find the most recent OTP for the email
    const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1)
    console.log(response)
    if (response.length === 0) {
      // OTP not found for the email
      return res.status(400).json({
        success: false,
        message: "The OTP is not valid",
      })
    } else if (otp !== response[0].otp) {
      // Invalid OTP
      return res.status(400).json({
        success: false,
        message: "The OTP is not valid",
      })
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)
  

    const user = await User.create({
      firstName,
      lastName,
      email,
      contactNumber,
      password: hashedPassword,
      ipAddress: ipAddress
      
    })

    return res.status(200).json({
      success: true,
      user,
      message: "User registered successfully",
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "User cannot be registered. Please try again.",
    })
  }
}



exports.login = async (req, res) => {
  try {
    // Get email and password from request body
    const { email, password } = req.body
     console.log("email here:",email )
    // Check if email or password is missing
    if (!email || !password) {
      // Return 400 Bad Request status code with error message
      return res.status(400).json({
        success: false,
        message: `Please Fill up All the Required Fields`,
      })
    }

    // Find user with provided email
    const user = await User.findOne({ email })

    // If user not found with provided email
    if (!user) {
      return res.status(401).json({
        success: false,
        message: `User is not Registered with Us Please SignUp to Continue`,
      })
    }

    // Generate JWT token and Compare Password
    if (await bcrypt.compare(password, user.password)) {
      const token = jwt.sign(
        { email: user.email, id: user._id, role: user.role },
        process.env.JWT_SECRET,
        {
          expiresIn: "24h",
        }
      )

      // Save token to user document in database
      user.token = token
      user.password = undefined
      // Set cookie for token and return success response
      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      }
      res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: `User Login Success`,
      })
    } else {
      return res.status(401).json({
        success: false,
        message: `Password is incorrect`,
      })
    }
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: `Login Failure Please Try Again`,
    })
  }
}





exports.sendotp = async (req, res) => {
  try {
    console.log("here inside otp api")
    const { email } = req.body;

    // Check if user is already present
    const checkUserPresent = await User.findOne({ email });

    // If user found with provided email
    if (checkUserPresent) {
      console.log("User is already registered:", email);
      return res.status(400).json({
        success: false,
        message: `User is Already Registered`,
      });
    }

    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    // Check if the generated OTP is unique
    let result = await OTP.findOne({ otp });
    console.log("Result in Generate OTP Func");
    console.log("Generated OTP:", otp);
    console.log("Result from Database:", result);

    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
      });
      result = await OTP.findOne({ otp });
      console.log("Generated a new OTP:", otp);
    }

    const otpPayload = { email, otp };
    const otpBody = await OTP.create(otpPayload);
    console.log("OTP Body:", otpBody);

    // Log and return a successful response
    console.log("OTP Sent Successfully:", email);
    res.status(200).json({
      success: true,
      message: `OTP Sent Successfully`,
      otp,
    });
  } catch (error) {
    // Log and return an error response
    console.error("Error:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};



