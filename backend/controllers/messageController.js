import Conversation from "../models/conversationModel.js";
import Message from "../models/messageModel.js";
import { getRecipientSocketId, io } from "../socket/socket.js";
import { v2 as cloudinary } from "cloudinary";

async function sendMessage(req, res) {
	try {
		const { recipientId, message } = req.body; //ye sb frontend se aayega
		let { img } = req.body;
		const senderId = req.user._id;

        // check that if a conversation has been created or not that means phle kbhi message bheja hai ya nhi
		// so if sending the first message create a conversation and phle se message agar kiya hai to we will just add more and more messages into that conversation
        let conversation = await Conversation.findOne({
			participants: { $all: [senderId, recipientId] },
		});

        //if no conversation create one
		if (!conversation) {
			conversation = new Conversation({
				participants: [senderId, recipientId],
				lastMessage: {
					text: message,
					sender: senderId,
				},
			});
			await conversation.save(); //after conversation save it
		}

        //if conversation hai to we just need to create a message

		if (img) {
			const uploadedResponse = await cloudinary.uploader.upload(img); // if we have first upload it to cloudinary
			img = uploadedResponse.secure_url; // this will give the url to img var
		}

		const newMessage = new Message({
			conversationId: conversation._id,
			sender: senderId,
			text: message,
			img: img || "",
		});

        // 2 things we will do first save the message in db and also we will update that last message field to this new message
		// promise.all is faster and happening concurrently it will be an array
        await Promise.all([
			newMessage.save(), // saving the message into db
			conversation.updateOne({
				lastMessage: {
					text: message,
					sender: senderId,
				},
			}),
		]);

		// for immediately send the message to the client(receiver) - in order to send to only one user we need to use io.to(socketid).emit()
		const recipientSocketId = getRecipientSocketId(recipientId); // receipientid we are getting from client
		if (recipientSocketId) {
			io.to(recipientSocketId).emit("newMessage", newMessage); // send the new message
		}

		res.status(201).json(newMessage);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
}

async function getMessages(req, res) {
	const { otherUserId } = req.params;
	const userId = req.user._id; //current user id
	try {
        //find the conversation between these two user
		const conversation = await Conversation.findOne({
			participants: { $all: [userId, otherUserId] },
		});

        // if conversation not found
		if (!conversation) {
			return res.status(404).json({ error: "Conversation not found" });
		}

        //find all the messages with this userid
		const messages = await Message.find({
			conversationId: conversation._id,
		}).sort({ createdAt: 1 }); //older message at top newer message at bottom

		res.status(200).json(messages);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
}

async function getConversations(req, res) {
	const userId = req.user._id;
	try {
        //go inside the conversation model to fetch the conversation
        //find all the conversation with this userid
        // also we dont only want the conversation - conversation only have the last message and participant but we also want the userprofilepic and the username - for this we have populate in mongoose instead of sending fetch request
		const conversations = await Conversation.find({ participants: userId }).populate({
			path: "participants", // reference to the usermodel - // path me which fields this is looking into
			select: "username profilePic", // select me jo field hme chahiye it eill select those
		});
        //populate se hm model jisko refer kr rha hai uska field le skte hai

		// remove the current user from the participants array - so that we can get the name of the sender in conversation
		// we will do this for each conversation - this will make it easy to work on frontend
		conversations.forEach((conversation) => {
			conversation.participants = conversation.participants.filter(
				(participant) => participant._id.toString() !== userId.toString() //removing ourself from participant array
			);
		});
		res.status(200).json(conversations);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
}


export { sendMessage, getMessages, getConversations}; 