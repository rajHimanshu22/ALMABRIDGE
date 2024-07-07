import { VStack,Box, Flex, Text, Link, Menu , MenuButton, MenuItem, MenuList, Portal, useToast } from "@chakra-ui/react";
import { Avatar } from "@chakra-ui/react";
import { BsInstagram } from "react-icons/bs";
import { CgMoreO } from "react-icons/cg";
import { useRecoilValue } from "recoil";
import { Link as RouterLink } from "react-router-dom";
import { useState } from "react";
import userAtom from "../atoms/userAtom";
import { Button } from "@chakra-ui/react";
import useShowToast from "../hooks/useShowToast";
import useFollowUnfollow from "../hooks/useFollowUnfollow";


const UserHeader = ({user}) => {
    
    const toast = useToast();
    const currentUser = useRecoilValue(userAtom); //logged in user
    //console.log(currentUser)
    //const [following, setFollowing] = useState(user?.followers?.includes(currentUser?._id));
    //console.log(following);
    //const showToast = useShowToast();
    //const [updating,setUpdating] = useState(false);
    const { handleFollowUnfollow, following, updating } = useFollowUnfollow(user); // call the function

    const copyURL = () => {
        //console.log(window)
        const currentURL = window.location.href;
        navigator.clipboard.writeText(currentURL).then(() => {
            //console.log("URL copied to clipboard");
            toast({
				title: "Success.",
				status: "success",
				description: "Profile link copied.",
				duration: 3000,
				isClosable: true,
			});
        });
    };

    // const handleFollowUnfollow = async() => {

    //     //if not logged in user
    //     if (!currentUser) {
	// 		showToast("Error", "Please login to follow", "error");
	// 		return;
	// 	}
	// 	if (updating) return;

	// 	setUpdating(true);
    //     try {
    //         const res = await fetch(`/api/users/follow/${user?._id}`, {
	// 			method: "POST",
	// 			headers: {
	// 				"Content-Type": "application/json",
	// 			},
	// 		});
	// 		const data = await res.json();
	// 		if (data.error) {
	// 			showToast("Error", data.error, "error");
	// 			return;
	// 		}

    //         //increasing decreasing the followers count
    //         if (following) {
	// 			showToast("Success", `Unfollowed ${user.name}`, "success");
	// 			user.followers.pop(); // simulate removing from followers - follow kr rhe hai to unfollow ht jayega array me se pop ho kr so array ka length se phir likh skege follower count ko
	// 		} else {
	// 			showToast("Success", `Followed ${user.name}`, "success");
	// 			user.followers.push(currentUser?._id); // simulate adding to followers
	// 		}

    //          setFollowing(!following);
            
    //         console.log(data);
    //     } catch (error) {
    //         showToast("Error", error, "error");
    //     } finally {
	// 		setUpdating(false);
	// 	}
    // }


    return (
        <VStack gap={4} alignItems={"start"}>
            <Flex justifyContent={"space-between"} w={"full"}>
                <Box>
                    <Text fontSize={"2xl"} fontWeight={"bold"}>
                        {user?.name}
                    </Text>
                    <Flex gap={2} alignItems={"center"}>
                        <Text fontSize={"sm"}>{user?.username}</Text>
                        <Text fontSize={"xs"} bg={"gray.dark"} color={"gray.light"} p={1} borderRadius={"full"}>
                            threads.net
                        </Text>
                    </Flex>
                </Box>
                <Box>
                    {user?.profilePic && (<Avatar name={user?.name} src={user?.profilePic} size={{base:"md", md:"xl"}}/>)}
                    {!user?.profilePic && (<Avatar name={user?.name} src='https://bit.ly/broken-link' size={{base:"md", md:"xl"}}/>)}
                </Box>
            </Flex>

            <Text>{user?.bio}</Text>

            {currentUser?._id === user?._id && (
				<Link as={RouterLink} to='/update'>
					<Button size={"sm"}>Update Profile</Button>
				</Link>
			)}
			{currentUser?._id !== user?._id && (
                <Button size={"sm"} onClick={handleFollowUnfollow} isLoading={updating}>
                    {following ? "Unfollow" : "Follow"}
                </Button>
            )}

            <Flex w={"full"} justifyContent={"space-between"}>
                <Flex gap={2} alignItems={"center"}>
                    <Text color={"gray.light"}>{user?.followers?.length} followers</Text>
                    <Box w='1' h='1' bg={"gray.light"} borderRadius={"full"}></Box>
                    <Link color={"gray.light"}>instagram.com</Link>
                </Flex>
                <Flex>
                    <Box className="icon-container">
                        <BsInstagram size={24} cursor={"pointer"}/>
                    </Box>
                    <Box className="icon-container">
                        <Menu>
                            <MenuButton>
                                <CgMoreO size={24} cursor={"pointer"}/>
                            </MenuButton>
                            <Portal>
                                <MenuList bg={"gray.dark"}>
                                    <MenuItem bg={"gray.dark"} onClick={copyURL}>Copy Link</MenuItem>
                                </MenuList>
                            </Portal>
                        </Menu>
                        {/* menu- predefined commponent to get list like copy item aisa pura list aa skta hai just put in menuitem */}
                        
                    </Box>
                </Flex>
            </Flex>
            <Flex w={"full"}>
                <Flex flex={1} borderBottom={"1.5px solid white"} justifyContent={"center"} pb={3} cursor={"pointer"}>
                    <Text fontWeight={"bold"}>Threads</Text>
                </Flex>
                <Flex
                  flex={1} borderBottom={"1px solid gray"} justifyContent={"center"} color={"gray.light"} pb="3" cursor={"pointer"}
                >
                    <Text fontWeight={"bold"}> Replies</Text>
                </Flex>
            </Flex>
        </VStack>
    );
};

export default UserHeader;

//-----------------------------------------------
// flex=1 means ki baki ka jitna hai uska alawa jitna bcha wo sb iss element ka
// ye tbhi lgega jb parent flex ho aur uska children ho