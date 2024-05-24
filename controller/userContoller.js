import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";
import { code, status } from "../ApiStatus.js";
import userModel from "../model/userModel.js";
import userotpModel from "../model/userotpModel.js";
import { sendmail } from "../helpers/Email.js";

// Export a function for user signup
export const usersignup = async (req, res) => {
    // Destructure email and password from request body
    const { email, password, name, number } = req.body;
  
    // Check if email is provided
    if (!email) {
      return res.status(code.success).json({
        message: "Email Id Required",
        code: code.failed,
        status : status.failed
      });
    }
  
    // Check if password is provided
    if (!password) {
      return res.status(code.success).json({
        message: "Password  Required",
        code: code.failed,
        status : status.failed
      });
    }
    if (!name) {
      return res.status(code.success).json({
        message: "Name  Required",
        code: code.failed,
        status : status.failed
      });
    }
    if (!number) {
      return res.status(code.success).json({
        message: "Number  Required",
        code: code.failed,
        status : status.failed
      });
    }
  
    // Try to find an existing user with the same email
    try {
      const oldUser = await userModel.findOne({ email });
  
      // If an existing user is found, return an error message
      if (oldUser) {
        return res.status(code.success).json({
          message: "Account already exists with this email address!",
          code: code.failed,
          status : status.failed
        });
      }
  
      // Hash the password using bcrypt
      const hashedPassword = await bcrypt.hash(password, 12);
      let otp =  Math.floor(100000 + Math.random() * 900000);
      // Create a new admin user with the provided email and hashed password
      const response = await userModel.create({
        email,
        password: hashedPassword,
        name,
        number,

      });
  
      // Generate a JWT token with the user's email and _id
      const token = jwt.sign(
        { email: response.email, _id: response._id },
        process.env.SECRET,
        {
          expiresIn: "10000h",
        }
      );
      const data = await userotpModel.create({
        userId: response._doc._id,
        otp,
      });
      let passedData = {
        email ,
        otp 
      }

      sendmail(passedData)
      
      // Return the created user and the token with a success message
      return res.status(201).json({
        data: {...response._doc, token},
        code: code.success,
        status: status.success,
        message: `User Signup Successfully otp sent to your email account ! ${otp}`,
      });
    } catch (error) {
      // If an error occurs, return an error message and log the error
      res.status(500).json({ message: "Something Went Wrong" });
      console.log(error);
    }
  };

  // Export a function for user signin
export const usersignin = async (req, res) => {
    // Destructure email and password from request body
    const { email, password } = req.body;
  
    // Check if email is provided
    if (!email) {
      return res.status(code.success).json({
        code: code.failed,
        status: status.failed,
        message: "Email Id Required",
      });
    }
  
    // Check if password is provided
    if (!password) {
      return res.status(code.success).json({
        code: code.failed,
        status: status.failed,
        message: "Password Required",
      });
    }
  
    // Try to find an existing user with the provided email
    try {
      const oldUser = await userModel.findOne({
        email: email,
      });
  
      // If no user is found, return an error message
      if (!oldUser) {
        return res.status(code.success).json({
          code: code.failed,
          status : status.failed,
          message: "Account Doesn't Exists!!",
        });
      }
  
      // Compare the provided password with the stored hashed password
      const isPasswordCorrect = await bcrypt.compare(password, oldUser.password);
  
      // If the passwords don't match, return an error message
      if (!isPasswordCorrect) {
        return res.status(code.success).json({
            code: code.failed,
            status : status.failed,
          message: "Invalid Credentiails",
        });
      }
  
      // Generate a JWT token with the user's email and _id
      const token = jwt.sign(
        { emailPrimary: oldUser.email, _id: oldUser._id },
        process.env.SECRET,
        { expiresIn: "10000h" }
      );
  
      // Return the user and the token with a success message
      res.status(code.success).json({
        code: code.success,
        status : status.success,
        data: {...oldUser._doc,token},
        message: 'User loggedin Successfully !',
      });
    } catch (error) {
      // If an error occurs, return an error message and log the error
      res.status(500).json({ message: "Something Went Wrong" });
      console.log(error);
    }
}

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(code.success).json({
      code: code.failed,
      status : status.failed,
      message: "Email Required",
    });
  }

  try {
    const oldUser = await userModel.findOne({
      email: email,
    });
    if (!oldUser) {
      return res.status(code.success).json({
        code: code.failed,
        status : status.failed,
        message: "Account Doesn't Exists !!",
      });
    }
    var otp = Math.floor(100000 + Math.random() * 900000);


    const response = await userotpModel.create({
      userId: oldUser._id,
      otp,
    });
    let passedData = {
      email ,
      otp 
    }
    sendmail(passedData)

    res.status(code.success).json({
      code: code.success,
      status : status.success,
      message: `Otp code sent your registered email address, ${otp} !!`,
    });
  } catch (error) {
    res.status(500).json({ message: "Something Went Wrong" });
    console.log(error);
  }
};

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email) {
    return res.status(code.success).json({
      code: code.failed,
      status : status.failed,
      message: "Email Required",
    });
  }
  if (!otp) {
    return res.status(code.success).json({
      code: code.failed,
      status : status.failed,
      message: "Otp Code Required",
    });
  }

  try {
    const oldUser = await userModel.findOne({
      email: email,
    });
    if (!oldUser) {
      return res.status(code.success).json({
        code: code.failed,
        status : status.failed,
        message: "Account Doesn't Exists !!",
      });
    }

    const response = await userotpModel.findOne({
      userId: oldUser._id,
    });
    console.log(response);
    if (response.otp == otp) {
      return res.status(code.success).json({
        code: code.success,
        status : status.success,
        message: `Otp Verified Successfully !!`,
      });
    } else {
      return res.status(code.success).json({
        code: code.failed,
        status : status.failed,
        message: `Invalid Otp !!`,
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Something Went Wrong" });
    console.log(error);
  }
};

export const changePassword = async (req, res) => {
  const { email, newpassword } = req.body;
  if (!email) {
    return res.status(code.success).json({
      code: code.failed,
      status : status.failed,
      message: "Email Required",
    });
  }
  if (!newpassword) {
    return res.status(code.success).json({
      code: code.failed,
      status : status.failed,
      message: "New Password Required",
    });
  }
  try {
    const oldUser = await userModel.findOne({
      email: email,
    });
    console.log(oldUser);
    if (!oldUser) {
      return res.status(code.success).json({
        code: code.failed,
      status : status.failed,
        message: "Account Doesn't Exists !!",
      });
    }
    const hashedPassword = await bcrypt.hash(newpassword, 12);
    oldUser.password = hashedPassword;
    await oldUser.save();
    return res.status(code.success).json({
      code: code.success,
      status : status.success,
      message: `Password changed successfully, Please Login !!`,
    });
  } catch (error) {
    res.status(500).json({ message: "Something Went Wrong" });
    console.log(error);
  }
};

export const resendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(code.success).json({
      code: code.failed,
      status : status.failed,
      message: "Email Required",
    });
  }

  try {
    const oldUser = await userModel.findOne({
      email: email,
    });
    if (!oldUser) {
      return res.status(code.success).json({
        code: code.failed,
        status : status.failed,
        message: "Account Doesn't Exists !!",
      });
    }
    var otp = Math.floor(100000 + Math.random() * 900000);

    const response = await userotpModel.findOne({
      userId: oldUser._id,
    });

    response.otp = otp;
    await response.save();
    let passedData = {
      email ,
      otp 
    }
    sendmail(passedData)

    res.status(code.success).json({
      code: code.success,
      status : status.success,
      message: `Otp code Resent your registered email address, ${otp} !!`,
    });
  } catch (error) {
    res.status(500).json({ message: "Something Went Wrong" });
    console.log(error);
  }
};

export const getuserdetails = async (req, res) => {
  console.log(req.params.id)
  const { id } = req.params;
  if (!id) {
    return res.status(code.success).json({
      message: "UserId Required",
      code: code.failed,
      status : status.failed,
    });
  }
  try {
    const data = await userModel.findOne({ _id: id });
    console.log(data);

    if (data) {
      return res.status(code.success).json(
        { data: data,     
          code: code.success,
          status : status.success, });
    } else {
      return res.status(code.success).json({ 
        message: "No user found !",
        code: code.failed,
      status : status.failed, });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};