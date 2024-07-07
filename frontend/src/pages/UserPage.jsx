import UserHeader from "../components/UserHeader";
import UserPost from "../components/UserPost";
import { useParams } from "react-router-dom";
import useShowToast from "../hooks/useShowToast";
import { Flex, Spinner } from "@chakra-ui/react";
import Post from "../components/Post";
import useGetUserProfile from "../hooks/useGetUserProfile";
import { useRecoilState } from "recoil";
import postsAtom from "../atoms/postsAtom";
import { useEffect, useState } from "react";


const UserPage = () => {

	const { user, loading } = useGetUserProfile();
    //const [user, setUser] = useState(null);
    const { username } = useParams(); //username come from useparam in param see the url path in app.jsx
	const showToast = useShowToast();
	//const [loading, setLoading] = useState(true);
	const [posts, setPosts] = useRecoilState(postsAtom);
	const [fetchingPosts, setFetchingPosts] = useState(true);

    useEffect(() => {
        //fetch data
        // const getUser = async () => {
        //     try {
        //         const res = await fetch(`/api/users/profile/${username}`);
		// 		const data = await res.json();
		// 		//console.log(data)
		// 		if (data.error) {
		// 			showToast("Error", data.error, "error");
		// 			return;
		// 		}
		// 		setUser(data);
		// 		//console.log(user);
        //     } catch (error) {
        //         showToast("Error",data.error,"error");
        //     } finally {
		// 		setLoading(false);
		// 	}
        // };
		//ye kaam useGetUserProfile se ho jayega

		//to get posts of user
		const getPosts = async () => {
			if (!user) return;
			setFetchingPosts(true);
			try {
				const res = await fetch(`/api/posts/user/${username}`);
				const data = await res.json();
				console.log(data);
				setPosts(data);
			} catch (error) {
				showToast("Error", error.message, "error");
				setPosts([]);
			} finally {
				setFetchingPosts(false);
			}
		};
        //getUser();
		getPosts();

    }, [username,showToast,setPosts, user]); //whenever username changes this useeffect run
	//showToast ko dependency me dale but because ye func hai to infinite loop ho jayega because a func will take space on each render - to solve this we will use useCallback and pass the toast inside
	console.log("posts is here and it is recoil state",posts); //jb reply ya post krne pr wo khud se ui update ho jaye without refresh kre
	// so for this we will need global state for this we use recoil here for post - we use setPost and userecoil and put postatom in recoil
	
	if(!user && loading) {
		return (
			<Flex justifyContent={"center"}>
				<Spinner size={"xl"}/>
			</Flex>
		);
	}

	if(!user && !loading) return <h1>User not found</h1>;

    // const { user, loading } = useGetUserProfile();
	// const { username } = useParams();
	// const showToast = useShowToast();
	// const [posts, setPosts] = useRecoilState(postsAtom);
	// const [fetchingPosts, setFetchingPosts] = useState(true);

	// useEffect(() => {
	// 	const getPosts = async () => {
	// 		if (!user) return;
	// 		setFetchingPosts(true);
	// 		try {
	// 			const res = await fetch(`/api/posts/user/${username}`);
	// 			const data = await res.json();
	// 			console.log(data);
	// 			setPosts(data);
	// 		} catch (error) {
	// 			showToast("Error", error.message, "error");
	// 			setPosts([]);
	// 		} finally {
	// 			setFetchingPosts(false);
	// 		}
	// 	};

	// 	getPosts();
	// }, [username, showToast, setPosts, user]);

	// if (!user && loading) {
	// 	return (
	// 		<Flex justifyContent={"center"}>
	// 			<Spinner size={"xl"} />
	// 		</Flex>
	// 	);
	// }

	// if (!user && !loading) return <h1>User not found</h1>;

    return (
        <>
        {/*
           <UserHeader user={user} />

			{!fetchingPosts && posts.length === 0 && <h1>User has not posts.</h1>}
			{fetchingPosts && (
				<Flex justifyContent={"center"} my={12}>
					<Spinner size={"xl"} />
				</Flex>
			)}

			{posts.map((post) => (
				<Post key={post._id} post={post} postedBy={post.postedBy} />
			))}
        
        */}
        <UserHeader user={user} />
        
		{!fetchingPosts && posts?.length === 0 && <h1>User has not posts.</h1>}
			{/*if fetching post show spinner*/}
			{fetchingPosts && (
				<Flex justifyContent={"center"} my={12}>
					<Spinner size={"xl"} />
				</Flex>
			)}

			{/*if we are not fetching post that means we have already fetched it*/}
			{posts.map((post) => (
				<Post key={post._id} post={post} postedBy={post.postedBy} />
			))}
        </>
    )
};

export default UserPage;