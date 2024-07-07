import express from "express";
import protectRoute from "../middlewares/protectRoute.js";
import { sendMessage, getMessages, getConversations } from "../controllers/messageController.js";

const router = express.Router();

router.get("/conversations", protectRoute, getConversations); //get all the conversation for user
router.get("/:otherUserId", protectRoute, getMessages); //get all the messages of conversation between me and the other user
router.post("/", protectRoute, sendMessage);
// all this should be protected because jb tk login nhi hai tb tk chat ka kuch nhi dekh skte

export default router;