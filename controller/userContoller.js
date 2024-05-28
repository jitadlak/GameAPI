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
        ResponseCode: code.failed,
        ResponseMessage: "Email Id Required",
        succeeded : status.failed
      });
    }
  
    // Check if password is provided
    if (!password) {
      return res.status(code.success).json({
        ResponseCode: code.failed,
        ResponseMessage: "Password  Required",
        succeeded : status.failed
      });
    }
    if (!name) {
      return res.status(code.success).json({
        ResponseCode: code.failed,
        ResponseMessage: "Name  Required",
        succeeded : status.failed
      });
    }
    if (!number) {
      return res.status(code.success).json({
        ResponseCode: code.failed,
        ResponseMessage: "Number  Required",
        succeeded : status.failed
      });
    }
  
    // Try to find an existing user with the same email
    try {
      const oldUser = await userModel.findOne({ email });
  
      // If an existing user is found, return an error message
      if (oldUser) {
        return res.status(code.success).json({
          ResponseCode: code.failed,
          ResponseMessage: "Account already exists with this email address!",
          succeeded : status.failed
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
        ResponseCode: code.success,
        ResponseMessage: `User Signup Successfully otp sent to your email account ! ${otp}`,
        succeeded: status.success,
        responseBody: {...response._doc, token},
      });
    } catch (error) {
      // If an error occurs, return an error message and log the error
      res.status(500).json({    
         ResponseCode: code.failed,
         ResponseMessage: "Something Went Wrong",
         succeeded: status.failed,
        });
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
        ResponseCode: code.failed,
        ResponseMessage: "Email Id Required",
        succeeded: status.failed,
      });
    }
  
    // Check if password is provided
    if (!password) {
      return res.status(code.success).json({
        ResponseCode: code.failed,
        ResponseMessage: "Password Required",
        succeeded: status.failed,
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
          ResponseCode: code.failed,
          ResponseMessage: "Account Doesn't Exists!!",
          succeeded : status.failed,
        });
      }
  
      // Compare the provided password with the stored hashed password
      const isPasswordCorrect = await bcrypt.compare(password, oldUser.password);
  
      // If the passwords don't match, return an error message
      if (!isPasswordCorrect) {
        return res.status(code.success).json({
          ResponseCode: code.failed,
          ResponseMessage: "Invalid Credentiails",
          succeeded : status.failed,
        });
      }
  
      // Generate a JWT token with the user's email and _id
      const token = jwt.sign(
        { email: oldUser.email, _id: oldUser._id },
        process.env.SECRET,
        { expiresIn: "10000h" }
      );
  
      // Return the user and the token with a success message
      res.status(code.success).json({
        ResponseCode: code.success,
        ResponseMessage: 'loggedin Successfully !',
        succeeded : status.success,
        responseBody: {...oldUser._doc,token},
      });
    } catch (error) {
      // If an error occurs, return an error message and log the error
      res.status(500).json({    
        ResponseCode: code.failed,
        ResponseMessage: "Something Went Wrong",
        succeeded: status.failed,
       });
      console.log(error);
    }
}

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(code.success).json({
      ResponseCode: code.failed,
      ResponseMessage: "Email Required",
      succeeded : status.failed,
    });
  }

  try {
    const oldUser = await userModel.findOne({
      email: email,
    });
    if (!oldUser) {
      return res.status(code.success).json({
        ResponseCode: code.failed,
        ResponseMessage: "Account Doesn't Exists !!",
        succeeded : status.failed,
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
      ResponseCode: code.success,
      ResponseMessage: `Otp code sent your registered email address, ${otp} !!`,
      succeeded : status.success,
    });
  } catch (error) {
    res.status(500).json({    
      ResponseCode: code.failed,
      ResponseMessage: "Something Went Wrong" ,
      succeeded: status.failed,
    });
    console.log(error);
  }
};

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email) {
    return res.status(code.success).json({
      ResponseCode: code.failed,
      ResponseMessage: "Email Required",
      succeeded : status.failed,
    });
  }
  if (!otp) {
    return res.status(code.success).json({
      ResponseCode: code.failed,
      ResponseMessage: "Otp Code Required",
      succeeded : status.failed,
    });
  }

  try {
    const oldUser = await userModel.findOne({
      email: email,
    });
    if (!oldUser) {
      return res.status(code.success).json({
        ResponseCode: code.failed,
        ResponseMessage: "Account Doesn't Exists !!",
        succeeded : status.failed,
      });
    }

    const response = await userotpModel.findOne({
      userId: oldUser._id,
    });
    console.log(response);
    if (response.otp == otp) {
      return res.status(code.success).json({
        ResponseCode: code.success,
        ResponseMessage: `Otp Verified Successfully !!`,
        succeeded : status.success,
      });
    } else {
      return res.status(code.success).json({
        ResponseCode: code.failed,
        ResponseMessage: `Invalid Otp !!`,
        succeeded : status.failed,
      });
    }
  } catch (error) {
    res.status(500).json({    
      ResponseCode: code.failed,
      ResponseMessage: "Something Went Wrong",
      succeeded: status.failed,
     });
    console.log(error);
  }
};

export const changePassword = async (req, res) => {
  const { email, newpassword } = req.body;
  if (!email) {
    return res.status(code.success).json({
      ResponseCode: code.failed,
      ResponseMessage: "Email Required",
      succeeded : status.failed,
    });
  }
  if (!newpassword) {
    return res.status(code.success).json({
      ResponseCode: code.failed,
      ResponseMessage: "New Password Required",
      succeeded : status.failed,
    });
  }
  try {
    const oldUser = await userModel.findOne({
      email: email,
    });
    console.log(oldUser);
    if (!oldUser) {
      return res.status(code.success).json({
        ResponseCode: code.failed,
        ResponseMessage: "Account Doesn't Exists !!",
        succeeded : status.failed,
      });
    }
    const hashedPassword = await bcrypt.hash(newpassword, 12);
    oldUser.password = hashedPassword;
    await oldUser.save();
    return res.status(code.success).json({
      ResponseCode: code.success,
      ResponseMessage: `Password changed successfully, Please Login !!`,
      succeeded : status.success,
    });
  } catch (error) {
    res.status(500).json({    
      ResponseCode: code.failed,
      ResponseMessage: "Something Went Wrong",
      succeeded: status.failed,
     });
    console.log(error);
  }
};

export const resendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(code.success).json({
      ResponseCode: code.failed,
      ResponseMessage: "Email Required",
      succeeded : status.failed,
    });
  }

  try {
    const oldUser = await userModel.findOne({
      email: email,
    });
    if (!oldUser) {
      return res.status(code.success).json({
        ResponseCode: code.failed,
        ResponseMessage: "Email Required",
        succeeded : status.failed,

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
      ResponseCode: code.success,
      ResponseMessage: `Otp code Resent your registered email address, ${otp} !!`,
      succeeded : status.success,
    });
  } catch (error) {
    res.status(500).json({    
      ResponseCode: code.failed,
      ResponseMessage: "Something Went Wrong",
      succeeded: status.failed,
     });
    console.log(error);
  }
};

export const getuserdetails = async (req, res) => {
  console.log(req.params.id)
  const { id } = req.params;
  if (!id) {
    return res.status(code.success).json({
      ResponseCode: code.failed,
      ResponseMessage: "UserId Required",
      succeeded: status.failed,
      
    });
  }
  try {
    const data = await userModel.findOne({ _id: id });
    console.log(data);

    if (data) {
      return res.status(code.success).json(
        { 
          ResponseCode: code.success,
          ResponseMessage: "user found !",
          succeeded: status.success,
          responseBody: data,     
     });
    } else {
      return res.status(code.success).json({ 
        ResponseCode: code.failed,
        ResponseMessage: "No user found !",
        succeeded: status.failed,
      
     });
    }
  } catch (err) {
    res.status(500).json({    
      ResponseCode: code.failed,
      ResponseMessage: "Something Went Wrong",
      succeeded: status.failed,

     });
  }
};

export const withdrawcoins = async(req, res)=>{
  const { uid, coins } = req.body;
  if (!uid) {
    return res.status(code.success).json({
      ResponseCode: code.failed,
      ResponseMessage: "UserId Required",
      succeeded : status.failed,
    });
  }
  if (!coins) {
    return res.status(code.success).json({
      ResponseCode: code.failed,
      ResponseMessage: "Coins Required",
      succeeded : status.failed,
    });
  }
  try {
    const oldUser = await userModel.findOne({
      _id: uid,
    });
    console.log(oldUser);
    if (!oldUser) {
      return res.status(code.success).json({
        ResponseCode: code.failed,
        ResponseMessage: "Account Doesn't Exists !!",
        succeeded : status.failed,
      });
    }
    if (!oldUser || oldUser.coins < coins) {
      return res.status(400).json({ error: 'Insufficient coins in the wallet, Please contact admin' });
    }
   oldUser.coins -= coins;
    await oldUser.save();
    return res.status(code.success).json({
      ResponseCode: code.success,
      succeeded : status.success,
      ResponseMessage: `withdraw request sent to admin !, please contact admin `,
    });
  } catch (error) {
    res.status(500).json({    
      ResponseCode: code.failed,
      succeeded: status.failed,
      ResponseMessage: "Something Went Wrong" });
    console.log(error);
  }
};

export const getusercoins = async(req, res)=>{
  const uid = req.params.id;
  if (!uid) {
    return res.status(code.success).json({
      ResponseCode: code.failed,
      succeeded : status.failed,
      ResponseMessage: "UserId Required",
    });
  }
  try {
    const oldUser = await userModel.findOne({
      _id: uid,
    });
    console.log(oldUser);
    if (!oldUser) {
      return res.status(code.success).json({
        ResponseCode: code.failed,
        succeeded : status.failed,
        ResponseMessage: "Account Doesn't Exists !!",
      });
    }
  
    return res.status(code.success).json({
      ResponseCode: code.success,
      succeeded : status.success,
      responseBody : {
        coins : oldUser.coins
      },
      ResponseMessage: `User coins fetched  `,
    });
  } catch (error) {
    res.status(500).json({    
      ResponseCode: code.failed,
      succeeded: status.failed,
      ResponseMessage: "Something Went Wrong" });
    console.log(error);
  }
};