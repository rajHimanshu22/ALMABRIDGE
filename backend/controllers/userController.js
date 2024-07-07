import User from "../models/userModel.js";
import Post from "../models/postModel.js";
import bcrypt from "bcryptjs"
import generateTokenAndSetCookie from "../utils/helpers/generateTokenAndSetCookie.js";
import mongoose from "mongoose";
import {v2 as cloudinary} from "cloudinary";

//Signup user
// route se yaha controller pr aaya to know the func
// controller DB se contact me rhega to make changes in it like storing (etc other work also) of data
const signupUser = async(req,res) => {
        try {
            const { name, email, username, password } = req.body; // we are able to parse these data from req.body because of the middleware that we have express.json()
            const user = await User.findOne({ $or: [{ email }, { username }] }); // check if user exists try to find User from email and uname
    
            if (user) {
                return res.status(400).json({ error: "User already exists" });
            }
            //hash the password
            const salt = await bcrypt.genSalt(10); //jitna big no, utna jyada secure but that will also take more time but 10 is also good
            const hashedPassword = await bcrypt.hash(password, salt);
    
            //create new user
            const newUser = new User({
                name,
                email,
                username,
                password: hashedPassword,
            });
            await newUser.save(); //save the new user in db
    
            //send newuser as res
            if (newUser) {
                //for generating the token and sending the cookie
                generateTokenAndSetCookie(newUser._id, res); //we are passing res because we are setting the cookie in the resonse (see func and res.cookies)
    
                res.status(201).json({
                    _id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    username: newUser.username,
                    bio: newUser.bio,
                    profilePic: newUser.profilePic,
                });
            } else {
                res.status(400).json({ error: "Invalid user data" });
            }
        } catch (err) {
            res.status(500).json({ error: err.message });
            console.log("Error in signupUser: ", err.message);
        }
}

//login user
const loginUser = async (req,res) => {
    try {
        const { username, password } = req.body;
		const user = await User.findOne({ username });
		const isPasswordCorrect = await bcrypt.compare(password, user?.password || ""); //bcrypt will compare the input password with the hashed password in the db 
        //also yaha user?.password likhe agar normal user.pass likhte to jb user nhi milta agar to user null ho jata hai and thats why we use ?.
        // also "" ye isliye || or me likhe because if the username is incorrect then bcrypt cant compare password which is string to user?.password
        // which is null so for this we write "" empty string so yaha se ab next line me chala jaye jaha pr ye check hai ki if user not found

		if (!user || !isPasswordCorrect) return res.status(400).json({ error: "Invalid username or password" });

		if (user.isFrozen) {
			user.isFrozen = false;
			await user.save();
		}

		generateTokenAndSetCookie(user._id, res); // as the auth is completed now we can generate the cookie

		res.status(200).json({
			_id: user._id,
			name: user.name,
			email: user.email,
			username: user.username,
			bio: user.bio,
			profilePic: user.profilePic,
        });
     } catch(error) {
        res.status(500).json({ error: error.message });
		console.log("Error in loginUser: ", error.message);
    }
};

//logout user
const logoutUser = async(req,res) => {
    try{
        //we are trying to clear the cookie "jwt"
        res.cookie("jwt", "", { maxAge: 1 }); // after 1ms it just gonna clear it
		res.status(200).json({ message: "User logged out successfully" });
    } catch (err){
        res.status(500).json({ error: err.message });
		console.log("Error in signupUser: ", err.message);
    }
}

//follow/unfollow user
const followUnFollowUser = async (req,res) =>{
    try{
        const { id } = req.params; //jb bhi url se koi value nnikalna hota hai we use req.params
		const userToModify = await User.findById(id); //jis user ko follow ya unfollow krna
		const currentUser = await User.findById(req.user._id); //we are jo login hai - this is where we put he object jo middleware se aa rha

        //user trying follow himself - id coming from url
		if (id === req.user._id.toString()) //yaha agar toString() nhi lgayege to user khud ko bhi follow kr lega
			return res.status(400).json({ error: "You cannot follow/unfollow yourself" });

        // if this user exists or not
		if (!userToModify || !currentUser) return res.status(400).json({ error: "User not found" });

        //check if we following or not
		const isFollowing = currentUser.following.includes(id);

        //if follow kr rha hoga then unfollow otherwise follow
        // here we will do two things first we will modify the currentuser following - the following array of him, and then modify the followers of usertomodify
        //  unfollow hoga to pull operation in mongoose aur follow hoga to push func
		if (isFollowing) {
			// Unfollow user
			await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
			await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
			res.status(200).json({ message: "User unfollowed successfully" });
		} else {
			// Follow user
			await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
			await User.findByIdAndUpdate(req.user._id, { $push: { following: id } }); //just add the id
			res.status(200).json({ message: "User followed successfully" });
		}
    }
    catch(err){
        res.status(500).json({ error: err.message });
		console.log("Error in followUnFollowUser: ", err.message);
    }
}

//update user
const updateUser = async(req,res) => {
    const { name, email, username, password, bio } = req.body;
	let { profilePic } = req.body;

	const userId = req.user._id; //cookies ke through aaya ye value req.user._id
	try {
		let user = await User.findById(userId); //we will change the variable thats why let
		if (!user) return res.status(400).json({ error: "User not found" });

        //if we are logged in using jane then we shouldnt be able to update profile of others
		if (req.params.id !== userId.toString()) //as userId is req.user._id that is it is mongodb object which we need to change it to string to compare it with param ka id - string!=object hoga so change need to change it
			return res.status(400).json({ error: "You cannot update other user's profile" });

        //if user tries to update the password we should first hash it
		if (password) {
			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(password, salt);
			user.password = hashedPassword;
		}

		//if profile pic is provided from the frontend then check it and upload it to cloudinary
		if (profilePic) {
			//ye check isliye hai user can change profilepic(avatar) baar baar to wo sara pic cloudinary me baar baar save jayega so ye likhne se old wala will be replaced/changed with new one
			//if we are trying to upload a profilepic and the user already has a profilepic we just need to delete the old one and upload the new one
			if (user.profilePic) {
				await cloudinary.uploader.destroy(user.profilePic.split("/").pop().split(".")[0]); //to destroy pass pic id
			}

			const uploadedResponse = await cloudinary.uploader.upload(profilePic); //yaha pr agar kuch additional option hai to usko object bnakr pass kr skte hai , dekr
			profilePic = uploadedResponse.secure_url; //after uploaded to cloudinary this will return a object -isme a field called secureurl jisme ye img hoga
		    //yaha pr profilepic me kuch assign kr rhe hai jo possible nhi hoga agar const rkhege profile pic ko to
		}

		user.name = name || user.name; //if user tries to update his name or || if name value is null then we will set the name of the user like it was before
		user.email = email || user.email; //same for all
		user.username = username || user.username;
		user.profilePic = profilePic || user.profilePic; //after above cloudinary part we will save the pic in db
		user.bio = bio || user.bio;

		user = await user.save();//save the entire value in db

		// Find all posts that this user replied and update username and userProfilePic fields - ab jaha jaha reply hoga waha pr ab fetch krega pic and name from backend - jisse ki updated value aaye reply me
		//updateMany() has 3 objects first one is filter second update and third options
		await Post.updateMany(//updateMany use kr rhe hai because we have multiple post that we have commented
			{ "replies.userId": userId },
			{
				$set: {
					"replies.$[reply].username": user.username, //update
					"replies.$[reply].userProfilePic": user.profilePic,
				},
			},
			{ arrayFilters: [{ "reply.userId": userId }] }
		);

		// password should be null in response
		user.password = null;

		res.status(200).json(user);
	} catch (err) {
		res.status(500).json({ error: err.message });
		console.log("Error in updateUser: ", err.message);
	}
};

//see profile
const getUserProfile = async (req,res) => {
    // We will fetch user profile either with username or userId - post.jsx se smjh skte ki kyu sirf username nhi hoga because post se sirf userid aa rha hai postedby se
	// query is either username or userId
	const { query } = req.params;

	try {
		let user;

		// query is userId
		if (mongoose.Types.ObjectId.isValid(query)) {
			user = await User.findOne({ _id: query }).select("-password").select("-updatedAt"); //these 2 things will not be shown updated at field bhi nhi dikhega
		} else {
			// query is username
			user = await User.findOne({ username: query }).select("-password").select("-updatedAt"); //these 2 things will not be shown
		}

		if (!user) return res.status(404).json({ error: "User not found" });

		res.status(200).json(user);
	} catch (err) {
		res.status(500).json({ error: err.message });
		console.log("Error in getUserProfile: ", err.message);
	}
};

// get suggested user
const getSuggestedUsers = async (req, res) => {
	try {
		// exclude the current user from suggested users array and exclude users that current user is already following
		const userId = req.user._id;

		const usersFollowedByYou = await User.findById(userId).select("following");

		const users = await User.aggregate([
			{
				$match: {
					_id: { $ne: userId }, // ne means not equal to
				}, // this will match for some query // this will basically exclude the authenticated user after this match
			},
			{
				$sample: { size: 10 }, // give us size of 10 users
			},
		]);

		// now filters out the user that we follow
		const filteredUsers = users.filter((user) => !usersFollowedByYou.following.includes(user._id));
		const suggestedUsers = filteredUsers.slice(0, 4); // return 4 users

		suggestedUsers.forEach((user) => (user.password = null)); // remove passwords

		res.status(200).json(suggestedUsers);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// so what we did : first find the users that we follow this will give an array inside the following obj(select me) and then we try to fetch 10 users randomly from our db
// and then in filtereduser we will just filter out the followed user now from the suggesteduser just show only the 4 users
// before we send users we just want to remove passwords from the response

// freeze Account
const freezeAccount = async (req, res) => {
	try {
		const user = await User.findById(req.user._id);
		if (!user) {
			return res.status(400).json({ error: "User not found" });
		}

		user.isFrozen = true; // simply do like this
		await user.save(); // save into the db

		res.status(200).json({ success: true });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

export {signupUser, loginUser, logoutUser, followUnFollowUser, updateUser, getUserProfile, getSuggestedUsers, freezeAccount};

//--------------------------------------------------------
//$or in mongodb
/*The $or operator performs a logical OR operation on an array of one or more <expressions> and selects the documents that satisfy at least one of the <expressions>.*/
//Max-Age= Optional Number of seconds until the cookie expires. A zero or negative number will expire the cookie immediately. If both Expires and Max-Age are set, Max-Age has precedence.
//res.cookie()
// Sets a cookie with name (name) and value (value) to be sent along with the response.

// Usage
// #
// res.cookie(name, value [,options]);

//req.param()
/*The req.params property is an object containing properties mapped to the named route “parameters”. 
An object containing parameter values parsed from the URL path.
For example, if you have the route /student/:id, then the “id” property is available as req.params.id. This object defaults to {}.  */