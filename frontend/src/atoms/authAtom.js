import { atom } from "recoil";


const authScreenAtom = atom({
    key: 'authScreenAtom', //this is needed in order to recoil just differentiate which atom(state) is which one
    default: "login",
});

export default authScreenAtom;