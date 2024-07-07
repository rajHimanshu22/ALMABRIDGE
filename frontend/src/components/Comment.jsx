import { Divider,Avatar, Flex,Text } from "@chakra-ui/react";

const Comment = ({reply, lastReply}) => {
    //const [liked,setLiked] = useState(false);
    return (
        <>
        <Flex gap={4} py={2} my={2} w={"full"}>
            <Avatar src={reply.userProfilePic} size={"sm"}/>
            <Flex gap={1} w={"full"} flexDirection={"column"}>
                <Flex w={"full"} justifyContent={"space-between"} alignItems={"center"}>
                    <Text fontSize={"sm"}  fontWeight={"bold"}>{reply.username}</Text>
                </Flex>
                <Text>{reply.text}</Text>
                
            </Flex>
        </Flex>
        {/*agar last reply nhi hai to show divider otherwise null*/}
        {!lastReply ? <Divider/> : null} 
        </>
    );
};

export default Comment;

//-------------------------------
// because comment krne wala sb ka username,img, id alag hoga isliye we will have to write props
// cookie parser - it is needed in order to once we want to get the cookies from request and then send some cookies inside response