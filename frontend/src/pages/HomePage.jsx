// import { Button, Flex } from "@chakra-ui/react";
// import { Link } from "react-router-dom";
// import useShowToast from "../hooks/useShowToast";
// import { useEffect, useState } from "react";
// import Post from "../components/Post";
import { Box, Flex, Spinner } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import useShowToast from "../hooks/useShowToast";
import Post from "../components/Post";
import { useRecoilState } from "recoil";
import postsAtom from "../atoms/postsAtom";
import SuggestedUsers from "../components/SuggestedUsers";


const HomePage = () => {
  const showToast = useShowToast();
  const [posts, setPosts] = useRecoilState(postsAtom); //create states to store the posts
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    
    const getFeedPosts = async () => {
      setLoading(true);
      setPosts([]); //to solve flickering effect
      try {
        const res = await fetch("/api/posts/feed");
        const data = await res.json();
        
        if (data.error) {
					showToast("Error", data.error, "error");
					return;
				}
        console.log(data);
        setPosts(data);

      } catch (error) {
        showToast("Error", error.message, "error");
      } finally {
        setLoading(false);
      }
    }
    getFeedPosts();

  },[showToast,setPosts]);

    return (
      <Flex gap='10' alignItems={"flex-start"}> {/*flex start se jitna bara content waisa hi length wo le lega*/}
			<Box flex={70}>
        {/*if not following anyone*/}
				{!loading && posts.length === 0 && <h1>Follow some users to see the feed</h1>}

				{loading && (
					<Flex justify='center'>
						<Spinner size='xl' />
					</Flex>
				)}

        {/*if posts hai*/}
				{posts.map((post) => (
					<Post key={post?._id} post={post} postedBy={post?.postedBy} />
				))}
			</Box>
			<Box
				flex={30}
				display={{
					base: "none", // small devices pr nhi dikhega
					md: "block",
				}}
			>
				<SuggestedUsers />
			</Box>
		</Flex>
    );
};

export default HomePage;

//facing the flickering effect which means when i am moving from profilepage to homepage first i am seeing the postpage and then the homepage
// to solve this flickering effect - inside the homepage before we try to fetch anythinh we will just saet posts to an empty array and then fetch posts