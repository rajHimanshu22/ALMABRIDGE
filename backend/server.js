import path from "path";
import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/connectDB.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import {v2 as cloudinary} from "cloudinary";
import {app,server} from "./socket/socket.js"

dotenv.config();

connectDB();
//const app = express(); // we created this (express instance) in socket so no need of this now

const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})
//this connects to our cloudinary account

//builtin express Middleware
app.use(express.json({limit:"50mb"})); // To parse JSON data in the req.body // middleware is express.json - use func ko call kr ke pass kr diye middleware
// express.json() - it allows us to parse the incoming data from the req obj (body)
//error - payload too large image upload krte time aaya - express.json this allows to parse the req.body -limit: likhne se we can upload large files can change the limit
app.use(express.urlencoded({extended:true})); // To parse form data in the req.body
// extended:true krne se even if the req body has some nested object it can parse it without any problem
app.use(cookieParser()); // it allows to get the cookie from the req and send the cookie inside the res //reach and access the cookies from req and res

//Routes
app.use("/api/users",userRoutes); //base route sara bnayege and link it with req route
app.use("/api/posts",postRoutes);
app.use("/api/messages", messageRoutes);

// http://localhost:3000 => backend frontend

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/frontend/dist")));

	// react app
	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
	});
}

//app.listen(PORT, () => console.log(`Server started at http://localhost:${PORT}`));
server.listen(PORT, () => console.log(`Server started at http://localhost:${PORT}`)); // instead of listening this express app we will just listen our express server that we created
// and now just by changing that app with the server variable we are now able to handle http req as well as socket related things (socket server)
// itna hi krna hota hai just to setuo our socket server

// http://localhost:3000 => backend
// http://localhost:5000 => frontend


//-----------------------
//const express = require("express");
//aise krne ki jagah package.json me "type":"module" krke ke ab import krke likh skte hai
//baar baar isko start krne ke liye node server.js na likhna pre isliye thats why we install nodemon
//"dev": "nodemon server.js", - this is when we developing stuff
//   "start": "node server.js" - this is for production
// ab khud se refresh hoga everytime we change something in code