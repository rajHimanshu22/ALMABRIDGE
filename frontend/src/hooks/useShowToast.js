import { useToast } from "@chakra-ui/toast";
import { useCallback } from "react";

const useShowToast = () => {
	const toast = useToast();

	const showToast = useCallback(
		(title, description, status) => {
			toast({
				title,
				description,
				status,
				duration: 3000,
				isClosable: true,
				//ye toast return ho rha hai //why usecallback - to solve infinite loop problem
			});
		},
		[toast]
	);

	return showToast;
};

export default useShowToast;

// [username,showToast] - showToast ko dependency me dale but because ye func hai to infinite loop ho jayega because a func will take space on each render - to solve this we will use useCallback and pass the toast inside

//This is how to create a custom hook