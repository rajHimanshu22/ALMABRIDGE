import { Avatar, Box, Flex, Image, Skeleton, Text } from "@chakra-ui/react";
import { selectedConversationAtom } from "../atoms/messagesAtom";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { BsCheck2All } from "react-icons/bs";
import { useState } from "react";

const Message = ({ownMessage, message}) => {

	const selectedConversation = useRecoilValue(selectedConversationAtom);
	const user = useRecoilValue(userAtom);
	const [imgLoaded, setImgLoaded] = useState(false); // img send hone ke baad scroll to ho rha but thora sa hi because img slowly load hota hai to fix this thing we will use this state

    return (
        <>
			{ownMessage ? (
				<Flex gap={2} alignSelf={"flex-end"}>
					{message.text && (
						<Flex bg={"green.800"} maxW={"350px"} p={1} borderRadius={"md"}>
							<Text color={"white"}>
                            {message.text}
                            </Text>
                            
							<Box
								alignSelf={"flex-end"}
								ml={1}
								color={message.seen ? "blue.400" : ""}
								fontWeight={"bold"}
							>
								<BsCheck2All size={16} />
							</Box>
						</Flex>
					)}
					{message.img && !imgLoaded && (
						<Flex mt={5} w={"200px"}>
							<Image
								src={message.img}
								hidden
								onLoad={() => setImgLoaded(true)} // if img is not loaded the img will be hidden and it will load in the background
								// once that is loaded this onLoad func will run and set the state to true
								alt='Message image'
								borderRadius={4}
							/>
							{/*jb tk img load nhi hua hai tb tk show skeleton below this img we could just show a skeleton*/}
							{/*once the img loads the state will be updated and we will not render skeleton then and then we will show the img*/}
							<Skeleton w={"200px"} h={"200px"} />
						</Flex>
					)}

					{/*if we have img and it is loaded */}
					{message.img && imgLoaded && (
						<Flex mt={5} w={"200px"}>
							<Image src={message.img} alt='Message image' borderRadius={4} />
							{/*to show the seen mess tick*/}
							<Box
								alignSelf={"flex-end"}
								ml={1}
								color={message.seen ? "blue.400" : ""}
								fontWeight={"bold"}
							>
								<BsCheck2All size={16} />
							</Box>
						</Flex>
					)}

					<Avatar src={user?.profilePic} w='7' h={7} />
				</Flex>
				// this was the mess that we are sending
				
			) : (
				// if the mess is from other user
				<Flex gap={2}>
					<Avatar src={selectedConversation?.userProfilePic} w='7' h={7} />

                    {/* <Flex bg={"gray.400"} maxW={"350px"} p={1} borderRadius={"md"}>
							<Text color={"black"}>
                             {message.text}
                            </Text>
                            
							 <Box
								alignSelf={"flex-end"}
								ml={1}
								color={message.seen ? "blue.400" : ""}
								fontWeight={"bold"}
							>
								<BsCheck2All size={16} />
							</Box>
						</Flex> */}
					{message.text && (
						<Text maxW={"350px"} bg={"gray.400"} p={1} borderRadius={"md"} color={"black"}>
							{message.text}
						</Text>
					)}
					{/*if mess is a img*/}
					{message.img && !imgLoaded && (
						<Flex mt={5} w={"200px"}>
							<Image
								src={message.img}
								hidden
								onLoad={() => setImgLoaded(true)}
								alt='Message image'
								borderRadius={4}
							/>
							<Skeleton w={"200px"} h={"200px"} />
						</Flex> 
					)}

					{/*if the img is coming from other user we need not to show the tick mark*/}
					{message.img && imgLoaded && (
						<Flex mt={5} w={"200px"}>
							<Image src={message.img} alt='Message image' borderRadius={4} />
						</Flex>
					)}
				</Flex>
			)}
		</>
    );
};

export default Message;