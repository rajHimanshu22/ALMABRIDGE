import { Avatar } from "@chakra-ui/avatar";
import { Image } from "@chakra-ui/image";
import { Box, Flex, Text } from "@chakra-ui/layout";
import { Link, useNavigate } from "react-router-dom";
import Actions from "./Actions";
import { useEffect, useState } from "react";
import useShowToast from "../hooks/useShowToast";
import { formatDistanceToNow } from "date-fns";
import { DeleteIcon } from "@chakra-ui/icons";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import postsAtom from "../atoms/postsAtom";

const Post = ({post,postedBy}) => {
  
  const showToast = useShowToast();
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const currentUser = useRecoilValue(userAtom);
  const [posts, setPosts] = useRecoilState(postsAtom);

  //fetch user to get the profilepic name - userprofile milega isse joki nhi mil rha jb sirf post fetch kr rhe in homepage.jsx
  useEffect(() => {
    const getUser = async () => {
        try {
            const res = await fetch("/api/users/profile/" + postedBy); //see the route to understand why postedBy are passed here - username chahiye route me isliye postedby likhe - here in the post we need to fetch the post from the userid
            const data = await res.json();
            //console.log(data);
            if (data.error) {
                showToast("Error", data.error, "error");
                return;
            }
            setUser(data);
        } catch (error) {
            showToast("Error", error.message, "error");
            setUser(null);
        }
    };

    getUser();
    
  },[postedBy,showToast])

  const handleDeletePost = async (e) => {
    try {
        e.preventDefault(); //pura uss post pr link hai to postpage so jb click ho tb wo postpage pr na jaye
        //if user really wants to delete it
        if (!window.confirm("Are you sure you want to delete this post?")) return;

        const res = await fetch(`/api/posts/${post._id}`, {
            method: "DELETE",
        });
        const data = await res.json();
        if (data.error) {
            showToast("Error", data.error, "error");
            return;
        }
        showToast("Success", "Post deleted", "success");
        setPosts(posts.filter((p) => p._id !== post._id));
    } catch (error) {
        showToast("Error", error.message, "error");
    }
};

  if(!user) return null; //ye likhne se ? nhi likhna parega because start me null hai user so hme ?. lgana par rha hai
    return (
        <Link to={`/${user?.username}/post/${post?._id}`}>
            <Flex gap={3} mb={4} py={5}>
                <Flex flexDirection={"column"} alignItems={"center"}>
                    <Avatar size="md" name={user?.name} src={user?.profilePic}
                      //iske avatar pr click krne pr iske profile page pr chale jaye
                      onClick={(e) => {
                        e.preventDefault(); //ye likhne se hua ki ab click krne pr post page pr nhi le jayega jo upar me likhe hai - `/${user.username}/post/${post._id}`
                        navigate(`/${user?.username}`);
                    }}
                    />
                    <Box w='1px' h={"full"} bg="gray.light" my={2}></Box>
                    {/*jo image hai 3 reply ka*/}
                    <Box position={"relative"} w={"full"}>
                    {/*if there are no replies*/}
                    {post?.replies?.length === 0 && <Text textAlign={"center"}>🥱</Text>}
                    {/*if there are replies then render the first 3 replies*/}
						{post?.replies[0] && (
							<Avatar
								size='xs'
								name='John doe'
								src={post?.replies[0]?.userProfilePic}
								position={"absolute"}
								top={"0px"}
								left='15px'
								padding={"2px"}
							/>
						)}

						{post?.replies[1] && (
							<Avatar
								size='xs'
								name='John doe'
								src={post?.replies[1]?.userProfilePic}
								position={"absolute"}
								bottom={"0px"}
								right='-5px'
								padding={"2px"}
							/>
						)}

						{post?.replies[2] && (
							<Avatar
								size='xs'
								name='John doe'
								src={post?.replies[2]?.userProfilePic}
								position={"absolute"}
								bottom={"0px"}
								left='4px'
								padding={"2px"}
							/>
						)}
                    </Box>
                </Flex>
                <Flex flex={1} flexDirection={"column"} gap={2}>
                  <Flex justifyContent={"space-between"} w={"full"}>
                    <Flex w={"full"} alignItems={"center"}>
                      <Text fontSize="sm" fontWeight="bold" onClick={(e) => {
                        e.preventDefault(); // username pr click krne pr bhi profile page pr le jayega- ye likhne se hua ki ab click krne pr post page pr nhi le jayega jo upar me likhe hai - `/${user.username}/post/${post._id}`
                        navigate(`/${user?.username}`);
                    }}>
                        {user?.username}
                      </Text>
                      <Image src="/verified.png" w={4} ml={1}/>
                    </Flex>

                    <Flex gap={4} alignItems={"center"}>
                        {/*to show the time when posted ago*/}
                    <Text fontSize={"xs"} width={36} textAlign={"right"} color={"gray.light"}>
                      {formatDistanceToNow(new Date(post?.createdAt))} ago
                      </Text>
                      
                      {/*loggedin user ke khud ke post pr deleteicon dikhe aur kisi ke profile pr jaye to nhi dikhe*/}
                      {currentUser?._id === user?._id && <DeleteIcon size={20}  onClick={handleDeletePost}/>}
                    </Flex>
                  </Flex>
                  <Text fontSize={"sm"}>{post?.text}</Text>
                  {post?.img && (
                  <Box borderRadius={6}
                  overflow={"hidden"}
                  border={"1px solid"} borderColor={"gray.light"}>
                    <Image src={post?.img} w={"full"}/>
                  </Box>)}

                  <Flex gap={3} my={1}>
                    <Actions post={post}/>
                  </Flex>

                </Flex>
            </Flex>

        </Link>
    )
}

export default Post;

//--------------------------------------------------
// actions.jsx me preventdefault likhne se like comment pr click kr kuch hoga nhi but post me aur khi bhi click krne pr postpage khul jayege
