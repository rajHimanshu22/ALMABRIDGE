import express from "express";
import { createPost, deletePost, getFeedPosts, getPost, getUserPosts, likeUnlikePost, replyToPost } from "../controllers/postController.js";
import protectRoute from "../middlewares/protectRoute.js";

const router = express.Router();

router.get("/feed", protectRoute, getFeedPosts); //protectroute isliye ki jiska bhi account nhi ho wo feed post nhi dekh skta jo acc bnayega wo hi apna feed post dekh skta hai
router.get("/:id", getPost); //id is post id
router.get("/user/:username", getUserPosts);
router.post("/create", protectRoute ,createPost);
router.delete("/:id", protectRoute ,deletePost);
router.put("/like/:id", protectRoute, likeUnlikePost);
router.put("/reply/:id", protectRoute, replyToPost); //like and reply ko put kr diye because ye update ho skta - its number


export default router;

//order in which routes likh rkh rhe hai wo bhi important hai
//agar aisa route nhi likhe to aisa error dega - "Cast to ObjectId failed for value "feed" (type string) at path "_id" for model "Post""
//---solution
//It may be the problem of how you arrange your routes in your server-side code.
/* router.get("/search", getPostsBySearch);
router.get("/", getPosts);
router.get("/:id", auth, getPost); # routes with id need to come after other routes

*/