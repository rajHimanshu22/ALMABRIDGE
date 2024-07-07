import { Avatar, Divider, Flex, Image, Skeleton, SkeletonCircle, Text, useColorModeValue } from "@chakra-ui/react";
import Message from "./Message";
import MessageInput from "./MessageInput";
import { useEffect, useRef, useState } from "react";
import useShowToast from "../hooks/useShowToast";
import { conversationsAtom, selectedConversationAtom } from "../atoms/messagesAtom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import { useSocket } from "../context/SocketContext.jsx";
import messageSound from "../assets/sounds/message.mp3";

const MessageContainer = () => {

	const showToast = useShowToast();
	const selectedConversation = useRecoilValue(selectedConversationAtom);
	const [loadingMessages, setLoadingMessages] = useState(true);
	const [messages, setMessages] = useState([]); // not global state because we will not use in other component or may be in 1 component // storing the message // so for any incoming(new) message we will grab and put them in setmessage state
	const currentUser = useRecoilValue(userAtom);
	const { socket } = useSocket();
	const setConversations = useSetRecoilState(conversationsAtom);
	const messageEndRef = useRef(null); // once we send the new message it just scroll automatically for this useref will use

	// now to immediately send the message
	useEffect(() => { // to listen in both server and client socket.on
		socket.on("newMessage", (message) => {
			if (selectedConversation._id === message.conversationId) { // if we are looking for the selected conv and mess are coming from there then update the state
				setMessages((prev) => [...prev, message]); // message lekr put them into setmessage state
			}

			//make a sound if the window is not focused - means if we are in a different tab we will hear the notification sound
			if (!document.hasFocus()) {
				const sound = new Audio(messageSound);
				sound.play();
			}

			// message sent krne ke baad receiver end pr last message update nhi ho rha conv (left side) me- so to update that
			setConversations((prev) => {
				const updatedConversations = prev.map((conversation) => { // gooing through each conv
					if (conversation._id === message.conversationId) { // if the conv is on selected one
						return {
							...conversation,
							lastMessage: {
								text: message.text,
								sender: message.sender,
							},
						};
					}
					return conversation;
				});
				return updatedConversations;
			});
		});

		return () => socket.off("newMessage"); // once this componet unmounts we will just remove the listener to this new message //not listen for it
	}, [socket, selectedConversation, setConversations]);

	// message seen unseen
	useEffect(() => {
		const lastMessageIsFromOtherUser = messages.length && messages[messages.length - 1].sender !== currentUser._id; // mess[mess.len-1] is the last mess
		// if this is true send the event
		if (lastMessageIsFromOtherUser) {
			socket.emit("markMessagesAsSeen", {
				conversationId: selectedConversation._id,
				userId: selectedConversation.userId,
			});
		} // now that we send the event now lets listen this event in the server

		socket.on("messagesSeen", ({ conversationId }) => {
			if (selectedConversation._id === conversationId) {
				setMessages((prev) => {  // update the state
					const updatedMessages = prev.map((message) => { // map for each prev mess and if mess is not seen return the obj with spread mess and it also updates the seen field to true
						if (!message.seen) {
							return {
								...message,
								seen: true,
							};
						}
						return message;
					});
					return updatedMessages;
				});
			}
		});
	}, [socket, currentUser._id, messages, selectedConversation]);

	useEffect(() => {
		messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	// scroll automatically on new message
	// to implement this - having a messageref and we are going to bind it to latest message and once we get the component this is just going to scroll for this message
	useEffect(() => {
		messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]); // whenever this messages state change change run this useeffect


	// fetch the messages
	useEffect(() => {
		const getMessages = async () => {
			setLoadingMessages(true); // initially true loading shimmer
			setMessages([]); // when we first try to fetch it uss time empty message
			
			try {
				if (selectedConversation.mock) return; // because mock me phle se koi conv nhi hoga
				const res = await fetch(`/api/messages/${selectedConversation?.userId}`); // id of the other user - it is in the selectedconversation
				const data = await res.json();
				if (data.error) {
					showToast("Error", data.error, "error");
					return;
				}
				//console.log(data)
				setMessages(data);
			} catch (error) {
				showToast("Error", error.message, "error");
			} finally {
				setLoadingMessages(false);
			}
		};

		getMessages();
	}, [showToast, selectedConversation.userId, selectedConversation.mock]); 

    return (
        <Flex
			flex='70'
			bg={useColorModeValue("gray.200", "gray.dark")}
			borderRadius={"md"}
			p={2}
			flexDirection={"column"}
		>
			{/* Message header */}
			<Flex w={"full"} h={12} alignItems={"center"} gap={2}>
				<Avatar src={selectedConversation.userProfilePic} size={"sm"} /> {/*{selectedConversation.userProfilePic}*/}
				<Text display={"flex"} alignItems={"center"}>
					{selectedConversation.username} <Image src='/verified.png' w={4} h={4} ml={1} />
				</Text>
			</Flex>

			<Divider />

            {/*messages*/}
			<Flex flexDir={"column"} gap={4} my={4} p={2} height={"400px"} overflowY={"auto"}>
				{loadingMessages &&
					[...Array(5)].map((_, i) => (
						<Flex
							key={i}
							gap={2}
							alignItems={"center"}
							p={1}
							borderRadius={"md"}
							alignSelf={i % 2 === 0 ? "flex-start" : "flex-end"} //agar i even hai to start se aayega shimmer odd pr right end me show hoga
						>
							{i % 2 === 0 && <SkeletonCircle size={7} />}  {/*jb even hoga tb circle phle and line baad me*/}
							<Flex flexDir={"column"} gap={2}>
								<Skeleton h='8px' w='250px' /> {/*line ke liye*/}
								<Skeleton h='8px' w='250px' />
								<Skeleton h='8px' w='250px' />
							</Flex>
							{i % 2 !== 0 && <SkeletonCircle size={7} />} {/*jb odd hoga tb line phle circle baad me*/}
						</Flex>
					))}

                    {/*message ke liye - for each message just return this message component*/}
				{!loadingMessages &&
					messages.map((message) => (
						<Flex
							key={message._id}
							direction={"column"}
							ref={messages.length - 1 === messages.indexOf(message) ? messageEndRef : null} // using messageendref to scroll to bottom if new message
						> {/*mess.len-1 is the latest mess which is equal to index of mess // so this line does is to find the latest message and just put the ref into that and if it is not latest mess dont put ref*/}
							<Message message={message} ownMessage={currentUser._id === message.sender} /> {/*ownmessage se pta chalega ki message ko left me ya right me dikhana hai*/}
						    {/*if this is true currentUser._id === message.sender - then own message will also be true*/}
						</Flex>
					))}
			</Flex>

            {/* <MessageInput /> */}
			<MessageInput setMessages={setMessages} /> {/*just pass the setter function and when click the send the message will set into setmessage state*/}
		</Flex>
    );
};

export default MessageContainer;

//this will have chat message