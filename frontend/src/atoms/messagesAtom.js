import { atom } from "recoil";

// left side wale sare conversation
export const conversationsAtom = atom({
	key: "conversationsAtom",
	default: [],
});

// hme baar baar prop me na pass krna pre isliye we will create global state
export const selectedConversationAtom = atom({
	key: "selectedConversationAtom",
	default: {
		_id: "", // id of conversation
		userId: "", // userid of the person we are chatting with
		username: "", // recipient ka username
		userProfilePic: "", // profilepic
	},
});