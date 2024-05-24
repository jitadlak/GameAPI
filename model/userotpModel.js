import mongoose from "mongoose";

const userOtpSchema = mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    otp: {
        type: Number,
        required: true,
    },
  
})

export default mongoose.model("Otp",userOtpSchema )