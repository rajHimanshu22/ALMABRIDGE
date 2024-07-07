import { createContext, useContext, useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import io from "socket.io-client";
import userAtom from "../atoms/userAtom";

const SocketContext = createContext(); // created a context here

// to use the return value we need this hook - so when we want to use this value which is socket we will just call this hook
// and it will give this socket for us
export const useSocket = () => {
	return useContext(SocketContext);
};

// socketcontextprovider is a functional component it will take props
export const SocketContextProvider = ({ children }) => {
	const [socket, setSocket] = useState(null); // to create socket instance - it mean we will just connect socket server
	const [onlineUsers, setOnlineUsers] = useState([]);
	const user = useRecoilValue(userAtom);

    // connect with socket server
	useEffect(() => {
		const socket = io("/", {
			query: {
				userId: user?._id,  // every time when we refresh page the socket id changes that we pass in console from backend
			},
		});
		// so even though the same user the socketid changes //so we can say that the socketid changes on every login
		//for that reason we are sending this socketid because we are going to store that in a hashmap and we will determine which user is online and which one is not

		setSocket(socket);

		// when it is connected - so we are using socket.on because we are in client and are listening for events that is coming from the server
		socket.on("getOnlineUsers", (users) => {
			setOnlineUsers(users); // taking the user and set it with our state
		}); // here listening for online user it will immediately update the new users with the state

        //closeup function
		return () => socket && socket.close();
	}, [user?._id]);
	
	//console.log(onlineUsers,"online users") // we can see the id on the current user
	// so jitna bhi user online rhega wo sb isme dikhega

	return <SocketContext.Provider value={{ socket, onlineUsers }}>{children}</SocketContext.Provider>;
}; // online user bhi return kiye jisse ki entire app me isko use kr ske jisse ki online status dikha skte conv me in chatpage



//one common way of implementing socket is to use context - for this create context folder
// this context is an api that is coming with react
// learn how context works
// we will create (a context) a socket instance here and then we will wrap our app with that and inside our entire app we will be able to use that socket