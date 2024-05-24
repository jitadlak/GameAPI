import express from 'express';
import { changePassword, forgotPassword, getuserdetails, resendOtp, usersignin, usersignup, verifyOtp } from '../controller/userContoller.js';

const approuter = express.Router();


approuter.post("/user-signup", usersignup);
approuter.post("/user-signin", usersignin);
approuter.post("/user-forgot", forgotPassword);
approuter.post("/user-verifyotp", verifyOtp);
approuter.post("/user-changepassword", changePassword);
approuter.post("/user-resendotp", resendOtp);
approuter.get("/user-get/:id", getuserdetails);


export default approuter;