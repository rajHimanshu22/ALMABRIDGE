import express from "express";
import { followUnFollowUser, getUserProfile, loginUser, logoutUser, signupUser, updateUser, getSuggestedUsers, freezeAccount } from "../controllers/userController.js";
import protectRoute from "../middlewares/protectRoute.js";


const router = express.Router();


router.get("/profile/:query", getUserProfile);
router.get("/suggested", protectRoute, getSuggestedUsers);
router.post("/signup", signupUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/follow/:id", protectRoute, followUnFollowUser); // Toggle state(follow/unfollow)
router.put("/update/:id", protectRoute, updateUser);
router.put("/freeze", protectRoute, freezeAccount);


// router.post("/signup", signupUser); //controller me jayega to know what func it has to perform
// router.post("/login", loginUser);
// router.post("/logout", logoutUser);
// router.post("/follow/:id", protectRoute ,followUnFollowUser); // toggle state(follow/unfollow) //we are trying to follow a user then it should have id of that user
// // we are protecting this route by adding a middleware here - protectroute is a function- the reason for this is that we cannot follow someone if i am not loggedin or not have an acc so for this we have middleware
// // we will also protect the route when we try to update our profile so if i am nor logged in cannot update my profile if i am john doe i cant update the profile of jane doe
// router.put("/update/:id", protectRoute, updateUser); //update me good practice to use put phle post se bhi chal rha
// router.get("/profile/:query", getUserProfile); //koi bhi kisi ka profile dekh skta hai thats why not protectroute



export default router;

// --------------------------------------------------
/* router.get("/signup", (req,res) => {
    res.send("signed up successfully");
});  ye aisa baar likhne pr bhot bara ho jayega so we will make controllers*/