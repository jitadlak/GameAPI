import mongoose from "mongoose";

const UserSchema = mongoose.Schema({

    createdAt: {
        type: Date,
        required: true,
        default:  Date.now()
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    number: {
        type: Number,
        required: true,
    },
    accountStatus: {
        type: Number,
       default:0
    },
    role :{
        type: Number,
        default : 0
    }
   
})

export default mongoose.model("Users",UserSchema)