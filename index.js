import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import multer from "multer";

import path from "path";
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import approuter from "./routes/routes.js";

dotenv.config();
const app = express();
const mongo_url = process.env.MONGO_DB_URL;
const port = 8000;


// console.log(mongo_url)
app.use(morgan("dev"));
app.use(cors());
app.use(express.json({ limit: "30mb", extended: true }));
// app.use("/public", express.static(path.join(__dirname, "public")));
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// app.use(express.static('public'));
// app.use(express.static('uploads'));
mongoose.connect(mongo_url).then(()=>{
    app.listen(port,()=> console.log(`server running on port ${port}`))
}).catch((error)=>console.log(error))

app.use("/api",approuter )