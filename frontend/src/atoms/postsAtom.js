import { atom } from "recoil";

const postsAtom = atom({
	key: "postsAtom",
	default: [], //because we have posts in array so default is an empty array
});

export default postsAtom;