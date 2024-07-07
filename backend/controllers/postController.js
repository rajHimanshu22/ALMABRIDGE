import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";

//create post
const createPost = async (req,res) => {
    try {
		const { postedBy, text } = req.body;
		let { img } = req.body; //yahi 3 chiz hi nikale because baki sara kuch ka postmodel me default value set hai

        //if postedby and text are not provided then return and error also img is optional img ke bina bhi post create ho skta hai
		if (!postedBy || !text) {
			return res.status(400).json({ error: "Postedby and text fields are required" });
		}

		const user = await User.findById(postedBy);
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

        //kisi aur ke liye post nhi bna skte
		if (user._id.toString() !== req.user._id.toString()) {
			return res.status(401).json({ error: "Unauthorized to create post" });
		}

		const maxLength = 500; // max length of post
		if (text.length > maxLength) {
			return res.status(400).json({ error: `Text must be less than ${maxLength} characters` }); //it is agood practice to write like this because if we want to update it
		}

		if (img) {
			const uploadedResponse = await cloudinary.uploader.upload(img);
			img = uploadedResponse.secure_url;
		}

        //if no problem them new post bna post constructor se
		const newPost = new Post({ postedBy, text, img });
		await newPost.save();

		res.status(201).json(newPost);
	} catch (err) {
		res.status(500).json({ error: err.message });
		console.log(err);
	}
};

// get post
const getPost = async (req,res) => {
    try {
		const post = await Post.findById(req.params.id);

		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		res.status(200).json(post);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

//delete post
const deletePost = async (req,res) => {
    try {
        const post = await Post.findById(req.params.id);

		if(!post){
			return res.status(404).json({message: "Post not found"});
		}

		if(post.postedBy.toString() !== req.user._id.toString()){
			return res.status(401).json({ message: "unauthorized to delete post"});
		}

		//if a post has an image we should delete that image from cloudinary as well
		if (post.img) {
			const imgId = post.img.split("/").pop().split(".")[0];
			await cloudinary.uploader.destroy(imgId);
		}
		//now on delete post the post will be deleted from cloudinary as well as db
		
		await Post.findByIdAndDelete(req.params.id);

		res.status(200).json({ message: "post deleted successfully" });
		} catch (err) {
        res.status(500).json({error: err.message});
    }
}

//like and unlike post
const likeUnlikePost = async (req,res) => {
	try {
		const { id: postId } = req.params;//params se id nikal liye - id: postId rename id to postId for easy
		const userId = req.user._id;

		const post = await Post.findById(postId);

		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		//check if user liked the post
		const userLikedPost = post.likes.includes(userId); //checking in the likes array

		if (userLikedPost) {
			// Unlike post
			await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
			res.status(200).json({ message: "Post unliked successfully" });
		} else {
			// Like post
			post.likes.push(userId);
			await post.save();
			res.status(200).json({ message: "Post liked successfully" });
		}
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

//reply to post
const replyToPost = async (req,res) => {
	try {
		const { text } = req.body;
		const postId = req.params.id;
		const userId = req.user._id;
		const userProfilePic = req.user.profilePic;
		const username = req.user.username;

		//if reply doesnt exist
		if (!text) {
			return res.status(400).json({ error: "Text field is required" });
		}

		const post = await Post.findById(postId);
		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		//create reply object
		const reply = { userId, text, userProfilePic, username };

		post.replies.push(reply);
		await post.save();

		res.status(200).json(reply);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

//get feed post
const getFeedPosts = async (req,res) => {
	try {
		const userId = req.user._id;
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		//get list of users that the current user follows
		const following = user.following; //following array

		//find the posts where the posted by field is in the following array
		const feedPosts = await Post.find({ postedBy: { $in: following } }).sort({ createdAt: -1 }); //$in se jo following me hai wo ho sirf and sort(-1) se sort in descending order so that we are going to see the latest post at the top

		res.status(200).json(feedPosts);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

const getUserPosts = async (req, res) => {
	const { username } = req.params;
	try {
		const user = await User.findOne({ username }); //first find user
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		//if user hai then get the posts
		const posts = await Post.find({ postedBy: user._id }).sort({ createdAt: -1 }); //in descending order means last post will come at first

		res.status(200).json(posts);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

export {createPost, getPost, deletePost, likeUnlikePost, replyToPost, getFeedPosts, getUserPosts};

//------------------------------------------------
// jjb bhi db se  interaction kro to await lgega