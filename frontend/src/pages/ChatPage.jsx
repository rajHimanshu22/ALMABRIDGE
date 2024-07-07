import { SearchIcon } from "@chakra-ui/icons";
import { Box, Button, Flex, Input, Skeleton, SkeletonCircle, Text, useColorModeValue } from "@chakra-ui/react";
import Conversation from "../components/Conversation";
import { GiConversation } from "react-icons/gi";
import MessageContainer from "../components/MessageContainer";
import { useEffect, useState } from "react";
import useShowToast from "../hooks/useShowToast";
import { useRecoilState, useRecoilValue } from "recoil";
import { conversationsAtom, selectedConversationAtom } from "../atoms/messagesAtom";
import userAtom from "../atoms/userAtom";
import { useSocket } from "../context/SocketContext";

const ChatPage = () => {

    const [searchingUser, setSearchingUser] = useState(false);
	const [loadingConversations, setLoadingConversations] = useState(true);
	const [searchText, setSearchText] = useState(""); // to search into the left side conversation
	const [selectedConversation, setSelectedConversation] = useRecoilState(selectedConversationAtom); // we will have state and setter function of that state thats why we are going to use a atom for this
	const [conversations, setConversations] = useRecoilState(conversationsAtom); //we want to store this conversations in state - we will use global state instead of useState because we might want to use this conversation state in multiple components like conversation or message container in message container messagecomponent or message input
    // so instead of creating that state in the chat page and then send them as a prop into the component we will create a atom which is going to be a global state and then we will just fetch it with or its going to be available for us with only one hook - messageAtom
	const currentUser = useRecoilValue(userAtom); // user logged in
	const showToast = useShowToast();
	const { socket, onlineUsers } = useSocket();

	// to listen for the mess seen event - using the chatpage because it contains both conv(left side) and mess cont(right side)
	// so conv model me add kiye then socket me se event send kiye then listen it here in chatpage then update in ui conv.jsx
	useEffect(() => {
		socket?.on("messagesSeen", ({ conversationId }) => {
			setConversations((prev) => {
				const updatedConversations = prev.map((conversation) => {
					if (conversation._id === conversationId) {
						return {
							...conversation,
							lastMessage: {
								...conversation.lastMessage,
								seen: true,
							},
						};
					}
					return conversation;
				});
				return updatedConversations;
			});
		});
	}, [socket, setConversations]);


    useEffect(() => {
		const getConversations = async () => {
			try {
				const res = await fetch("/api/messages/conversations");
				const data = await res.json();
				if (data.error) {
					showToast("Error", data.error, "error");
					return;
				}
				console.log(data);
				setConversations(data);
			} catch (error) {
				showToast("Error", error.message, "error");
			} finally {
				setLoadingConversations(false); //loading shimmer
			}
		};

		getConversations();
	}, [showToast, setConversations]);

	// for search function of conversation
	const handleConversationSearch = async (e) => {
		e.preventDefault();
		setSearchingUser(true);
		try {
			const res = await fetch(`/api/users/profile/${searchText}`); // get the username which is in the state search text
			const searchedUser = await res.json();
			if (searchedUser.error) {
				showToast("Error", searchedUser.error, "error");
				return;
			}

			// messaging khud ko - if user is trying to message themselves
			const messagingYourself = searchedUser._id === currentUser._id;
			if (messagingYourself) {
				showToast("Error", "You cannot message yourself", "error");
				return;
			}

			// if user is already in a conversation with the searched user - will go with each conversation then equate the ids of search kiya gya user and check with the participient list
			const conversationAlreadyExists = conversations.find(
				(conversation) => conversation.participants[0]._id === searchedUser._id
			);

			// if user mila then open the chat right side of coversation
			if (conversationAlreadyExists) {
				setSelectedConversation({
					_id: conversationAlreadyExists._id,
					userId: searchedUser._id,
					username: searchedUser.username,
					userProfilePic: searchedUser.profilePic,
				});
				return;
			}

			// search for the conversation jisse kbhi baat nhi hua hai
			// for this we want ki uska name and profilepic aaye as a conversation on left side and when we click on it we should get the message box chat wala pura
			// so what we are doing is when we search we are creating a mock conversation because we are creating that at the backend - if search and if we dont send a message it shouldnt be creating the conv thats why we will fake it first
			const mockConversation = {
				mock: true,
				lastMessage: {
					text: "",
					sender: "", // both empty because there is no last message
				},
				_id: Date.now(), // a random no.
				participants: [
					{
						_id: searchedUser._id,
						username: searchedUser.username,
						profilePic: searchedUser.profilePic,
					},
				],
			}; 
			// then add it to conv state
			setConversations((prevConvs) => [...prevConvs, mockConversation]); // take all prev conv and set this message at end
		} catch (error) {
			showToast("Error", error.message, "error");
		} finally {
			setSearchingUser(false);
		}
	};

    return (
        <Box position={"absolute"}
        left={"50%"}
        w={{ base: "100%", md: "80%", lg: "750px" }} //chatapp will have larger screen than other parts of app 
        p={4}
        transform={"translateX(-50%)"}
        >
            <Flex
				gap={4}
				flexDirection={{ base: "column", md: "row" }}
				maxW={{
					sm: "400px",
					md: "full",
				}}
				mx={"auto"} //this will take it to middle on small screens
			>
                {/*left side chat people and right side chatting space - 2 flex*/}
				<Flex flex={30} gap={2} flexDirection={"column"} maxW={{ sm: "250px", md: "full" }} mx={"auto"}>
					<Text fontWeight={700} color={useColorModeValue("gray.600", "gray.400")}>
						Your Conversations
					</Text>
					<form onSubmit={handleConversationSearch}>
						<Flex alignItems={"center"} gap={2}>
							<Input placeholder='Search for a user' onChange={(e) => setSearchText(e.target.value)} />
							<Button size={"sm"} onClick={handleConversationSearch} isLoading={searchingUser}> {/*once we click then loading se spinner aayega*/}
								<SearchIcon />
							</Button>
						</Flex>
					</form>

                    {/*when we search for a coversation we will have a loading shimmer of 5 people*/}
					{loadingConversations &&
						[0, 1, 2, 3, 4].map((_, i) => (
							<Flex key={i} gap={4} alignItems={"center"} p={"1"} borderRadius={"md"}>
								<Box>
									<SkeletonCircle size={"10"} />
								</Box>
								<Flex w={"full"} flexDirection={"column"} gap={3}>
									<Skeleton h={"10px"} w={"80px"} />
									<Skeleton h={"8px"} w={"90%"} />
								</Flex>
							</Flex>
						))}

                    {/*after loading is completed this will load conversation*/}
					{!loadingConversations &&
						conversations.map((conversation) => (
							<Conversation
								key={conversation._id}
								// to check if the user we have a conv is in this onlineusers array by comparing id
								isOnline={onlineUsers.includes(conversation.participants[0]._id)} // when we display each conv we will send a prop // taking from onlineusers array
								conversation={conversation}
							/>
						))}
				</Flex>
				
				{/* for intial state - in the beginning when no conversation is are selected - render the state that is why we are using global state*/}
				{!selectedConversation._id && (
					<Flex
						flex={70}
						borderRadius={"md"}
						p={2}
						flexDir={"column"}
						alignItems={"center"}
						justifyContent={"center"}
						height={"400px"}
					>
						<GiConversation size={100} />
						<Text fontSize={20}>Select a conversation to start messaging</Text>
					</Flex>
				)}

                {/*if we have selected conversation then show message container*/}
				{selectedConversation._id && <MessageContainer />}
			</Flex>

        </Box>
    )
}

export default ChatPage;