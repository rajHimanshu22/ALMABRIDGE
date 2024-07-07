import { Server } from "socket.io";
import http from "http";  // for creatint a http server - http is a builtin module in node
import express from "express";
import Message from "../models/messageModel.js";
import Conversation from "../models/conversationModel.js";

const app = express(); // create express instance
const server = http.createServer(app); // create http server then wind it up with this express instance 

// create a socket server - in next line we are creating a socket server and then binding it or combining this with http server
// now we have both of our server there now we can handle our http req (with line 8 server) and we are able to handle any kind of socket io thing with this socket server

const io = new Server(server, {
	cors: {
		origin: "http://localhost:5000",
		methods: ["GET", "POST"],
	},
});

// now we created our server and now listen for incoming connections - how

export const getRecipientSocketId = (recipientId) => { // here userid pass kiye recipientid naam se
	return userSocketMap[recipientId]; // to get the socketid of the user which will be used/need in the messagecontroller in sending message io.to.emit()
};

const userSocketMap = {}; // userId: socketId

// line 20 ke baad
io.on("connection", (socket) => {
	console.log("user connected", socket.id); // socket in callback ko as a user just connected smjh skte hai
	const userId = socket.handshake.query.userId; // we are sending this userid from socketcontext query

	if (userId != "undefined") userSocketMap[userId] = socket.id; // if not undefined store in hashmap
	io.emit("getOnlineUsers", Object.keys(userSocketMap)); // update the online user status // object.key se we will just send an array of the userid because obj.key will convert this socketmap as an array it will put the keys into this array means id of each user

	// to listen the seen unseen event
	socket.on("markMessagesAsSeen", async ({ conversationId, userId }) => {
		try {
			await Message.updateMany({ conversationId: conversationId, seen: false }, { $set: { seen: true } }); // we will find all of the conv that in this conv jiska seen false hai we will convert it to true in second argument - updating the db
			await Conversation.updateOne({ _id: conversationId }, { $set: { "lastMessage.seen": true } }); // mess ke saath saath conv left side me bhi tick update ho - here updateone use kr rhe
			io.to(userSocketMap[userId]).emit("messagesSeen", { conversationId }); // then we will send this event to the other user // io.to will take the socket.id and it is taking the convid
		} catch (error) {
			console.log(error);
			// in catch handle the error
			// and in we will update the db
		}
	}); // now we are sending the event then listen itin client - mess container

	// handling the disconnection
	socket.on("disconnect", () => {
		console.log("user disconnected");
		delete userSocketMap[userId]; //once we have disconnect remove the userid from map
		io.emit("getOnlineUsers", Object.keys(userSocketMap)); // update the hashmap
	});
});

export { io, server, app }; // export because we need this

// create a socket server
// write this in backend - npm i socket.io is used to create our a socket server - first install this
// write this in frontend - npm i socket.io-client - from the client to interact with that server we need this package
// after creating the server now connect the server

// what we did
// in socket.js we just create a socket server by only 15 lines in the backend
// in the client we are creating a context and then we need to have a provider around it and
// it takes a children as the prop and we are returning this context provider with a value and putiing children in between
// and in order use this value that is we are returning we need to go inside the main.jsx and wrap our app with this context provider
// and by doing this we are able to use any value that is coming from here
// for eg if we return an object socket in value then we will be able to use this socket in our entire app with having a hook useSocket
// socket connection and disconnection kr diye
// now implement online user status - so we need to store our userid in the server for this create a hashmap