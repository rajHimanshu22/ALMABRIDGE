import {
	Avatar,
	AvatarBadge,
	Box,
	Flex,
	Image,
	Stack,
	Text,
	WrapItem,
	useColorMode,
	useColorModeValue,
} from "@chakra-ui/react";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { BsCheck2All, BsFillImageFill } from "react-icons/bs";
import { selectedConversationAtom } from "../atoms/messagesAtom";

const Conversation = ({conversation, isOnline}) => {

	const user = conversation?.participants[0]; //after removing ourself from participnt array // this is the user we are chatting with
	const currentUser = useRecoilValue(userAtom);
	const lastMessage = conversation?.lastMessage;
	const [selectedConversation, setSelectedConversation] = useRecoilState(selectedConversationAtom); // jb kisi conversation pr click kre tb uske sath wala pura conversation open ho jaye so onclick set the state
	const colorMode = useColorMode(); // colormode just determines we are in light mode or not basically in which mode

	//console.log("selectedConverstion", selectedConversation);

    return (
        <Flex
			gap={4}
			alignItems={"center"}
			p={"1"}
			_hover={{
				cursor: "pointer",
				bg: useColorModeValue("gray.600", "gray.dark"),
				color: "white",
			}}
			onClick={() =>
				setSelectedConversation({
					_id: conversation?._id,
					userId: user?._id,
					userProfilePic: user?.profilePic,
					username: user?.username,
					mock: conversation?.mock, // this will determine if this is mock or not
				})
			}
			bg={
				selectedConversation?._id === conversation?._id ? (colorMode === "light" ? "gray.400" : "gray.dark") : "" // if this is the selected conversation we will change the colour depending on light or dark mode
			}
			borderRadius={"md"}
		>
            {/*for each conversation we want to have a profilepic and the username on right side as well as the conversation*/}
			<WrapItem>
				<Avatar
					size={{
						base: "xs",
						sm: "sm",
						md: "md",
					}}
                    //src="https://bit.ly/broken-link"
					 src={user?.profilePic}
				>
                {/* <AvatarBadge boxSize='1em' bg='green.500' /> */}
				{isOnline ? <AvatarBadge boxSize='1em' bg='green.500' /> : ""}
				</Avatar>
			</WrapItem>

			<Stack direction={"column"} fontSize={"sm"}>
				<Text fontWeight='700' display={"flex"} alignItems={"center"}> {/*username on left and verified badge on right*/}
					{user?.username} <Image src='/verified.png' w={4} h={4} ml={1} />
				</Text>

                {/*message*/}
				<Text fontSize={"xs"} display={"flex"} alignItems={"center"} gap={1}>
					
					{/*if we have send the last message show the check sign in the conversation*/}
                    {currentUser?._id === lastMessage?.sender ? (
						<Box color={lastMessage?.seen ? "blue.400" : ""}>
							<BsCheck2All size={16} />
						</Box>
					) : (
						""
					)}
					{/*truncate the message in conversation part using substring method can also use slice method*/}
					{lastMessage.text.length > 18
						? lastMessage?.text?.substring(0, 18) + "..."
						: lastMessage?.text || (!lastMessage?.text.length ? "send an message to start conversation 👋" : <BsFillImageFill size={16} />)} 
				</Text>
			</Stack>
		</Flex>
    );
};
export default Conversation;