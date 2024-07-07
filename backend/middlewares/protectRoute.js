import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

const protectRoute = async (req, res, next) => {
	try {
		const token = req.cookies.jwt; //first we will get the token req.cookies.jwt me jwt is name of the token so they should match

		if (!token) return res.status(401).json({ message: "Unauthorized" }); // if nothing in token that means nobody loggedin

        //decode the jwt token - we do so by using verify func
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //find the user- here userId is the payload that we put in the cookie(check line 3 generatetokenandcookie)- this value should be same as that in the token create wala func
		const user = await User.findById(decoded.userId).select("-password"); //we only want to return the user and not the password thats why we use select()

		req.user = user;//inside the req obj we are adding a user field and its going to be this user that we just got it from db

		next(); // call the next middleware or function
	} catch (err) {
		res.status(500).json({ message: err.message });
		console.log("Error in signupUser: ", err.message); // should be the name of the current function
	}
};

export default protectRoute;

//----------------------------------------------------------
// const protectRoute = async (req, res, next) => {} middleware me next is pass because we want ki jb middleware function execute ho jaye to wo next function ko call kr de
//jaise yaha pr router.post("/follow/:id", protectRoute ,followUnFollowUser); protectroute middleware successfully execute hone ke baad followunfollowUser func chale so for that next is written



//-----------------------------------------
//create routes and interact with the models

// A MIDDLEWARE is a function that runs between the req and res