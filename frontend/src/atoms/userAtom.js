import { atom } from "recoil";

const userAtom = atom({
	key: "userAtom",
	default: JSON.parse(localStorage.getItem("user-threads")), //default value we get from local storage so once if we initially refresh our page or visit our page for first time the default value for our user is whatever in the local storage
});
//ye check krega ki user hai ya nhi
//homepage ke liye ye

export default userAtom;