import {
	Flex,
	Image,
	Input,
	InputGroup,
	InputRightElement,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalHeader,
	ModalOverlay,
	Spinner,
	useDisclosure,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { IoSendSharp } from "react-icons/io5";
import useShowToast from "../hooks/useShowToast";
import { conversationsAtom, selectedConversationAtom } from "../atoms/messagesAtom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { BsFillImageFill } from "react-icons/bs";
import usePreviewImg from "../hooks/usePreviewImg"; // to render the img that we selected in our machine we should use this hook - this will allow us to select an img from our machine and then just render that in our app

const MessageInput = ({ setMessages }) => {

	const [messageText, setMessageText] = useState(""); // put the inputtext in the state
	const showToast = useShowToast();
	const selectedConversation = useRecoilValue(selectedConversationAtom);
	const setConversations = useSetRecoilState(conversationsAtom); // ye isliye ki after sending the message we will show the last message in the conversation left side jaha pr tick lga hua aa rha hai
	const imageRef = useRef(null);
	const { onClose } = useDisclosure(); // to close the model
	const { handleImageChange, imgUrl, setImgUrl } = usePreviewImg();
	const [isSending, setIsSending] = useState(false);

	const handleSendMessage = async (e) => {
		e.preventDefault(); // so it doesnt refresh the page once we submit that
		if (!messageText && !imgUrl) return; // if messagetext is null we will not try to send anything to db
		if (isSending) return; // if it is sending and we are still trying to send another mess it will justt return out of this func // it will prevent if user clicks multiple times to that send button

		setIsSending(true); // set it true before starting the fetch req

		try {
			const res = await fetch("/api/messages", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					message: messageText,
					recipientId: selectedConversation.userId, // these things we are sending check the messagecontroller
					img: imgUrl,
				}),
			});
			const data = await res.json();
			if (data.error) {
				showToast("Error", data.error, "error");
				return;
			}
			console.log(data);

			setMessages((messages) => [...messages, data]); // take the previous messages and append the last message
			// this will allow us to display message in ui

			// update with the last message here left side pr
			// we will go through each converstion until we find the current one
			// we find the prevconv and then we map through it then we find the curr conv we are chatting with for that conv we are just going to change the last message that will update our ui
			setConversations((prevConvs) => {
				const updatedConversations = prevConvs.map((conversation) => {
					if (conversation._id === selectedConversation._id) { // if this then we will just change the last message
						return {
							...conversation,
							lastMessage: {
								text: messageText,
								sender: data.sender,
							},
						};
					}
					return conversation;
				});
				return updatedConversations;
			});
			setMessageText(""); // ye isliye ki after sending the message the message input gets empty nhi to message bhejne ke baad bhi waha message dikha rha hai
			setImgUrl(""); // after send the img imgurl ko empty kr diye jisse ki model close ho jaye // model will open if it has imgurl
		} catch (error) {
			showToast("Error", error.message, "error");
		} finally {
			setIsSending(false);
		}
	};

    return (
        <Flex gap={2} alignItems={"center"}>
			<form onSubmit={handleSendMessage} style={{ flex: 95 }}> {/*this form is 95% and the flex is 5%*/}
				<InputGroup>
					<Input
						w={"full"}
						placeholder='Type a message'
						onChange={(e) => setMessageText(e.target.value)}
						value={messageText} // set the message input in setmessage state
					/>
					<InputRightElement onClick={handleSendMessage} cursor={"pointer"}>
						<IoSendSharp />
					</InputRightElement>
				</InputGroup>
			</form>
			<Flex flex={5} cursor={"pointer"}>
				<BsFillImageFill size={20} onClick={() => imageRef.current.click()} />
				<Input type={"file"} hidden ref={imageRef} onChange={handleImageChange} /> {/*on change se when we change this file when you select an img this func will run*/}
			</Flex> {/*so this is the common way to using input field with img or file- because it looks very ugly initially so that you have to just hide that and then 
			 with a useref hook you will be just able to when you click that you just open up the file explorer - agar hidden nhi likhe to choose file likha aayega jisko click krne pr file explore khul jayega but choose file likha hua looks ugly*/}
			{/*now this modal will be open when we select the image*/}
			<Modal
				isOpen={imgUrl} // if we have a img url that means if we select an img from our machine then this model should be open
				onClose={() => {
					onClose();
					setImgUrl("");
				}}
			>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader></ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<Flex mt={5} w={"full"}>
							<Image src={imgUrl} />
						</Flex>
						 <Flex justifyContent={"flex-end"} my={2}>
							{!isSending ? (
								<IoSendSharp size={24} cursor={"pointer"} onClick={handleSendMessage} />
							) : (
								<Spinner size={"md"} /> // if not sending show the button or if sending show the spinner
							)}
						</Flex> 
					</ModalBody>
				</ModalContent>
			</Modal>
			{/**/}
		</Flex>
    );
};

export default MessageInput;


// for db of chat
// we will have 2 collections
// conversions - will have conversion of 2 people and messages - here we store all the messages in the entire app
// conversions will have fileds : id,participants, lastmessage
//message have conversationid - which conversation does this message belong to,sender,text
//after knowing this we will make messagemodel