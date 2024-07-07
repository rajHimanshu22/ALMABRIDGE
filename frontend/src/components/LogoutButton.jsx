import { Button } from "@chakra-ui/button";
import { useSetRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import useShowToast from "../hooks/useShowToast";
import { FiLogOut } from "react-icons/fi";

//logout - clear the user from local storage destroy cookies and update our db
const LogoutButton = () => {
	const setUser = useSetRecoilState(userAtom); // to update the state
	const showToast = useShowToast();

	const handleLogout = async () => {
		try {
			const res = await fetch("/api/users/logout", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
			});
			const data = await res.json();
            console.log(data);

			if (data.error) {
				showToast("Error", data.error, "error"); //custom hook so that the code look cleaner
				return;
			}
            //agar koi error nhi hai to local storage se hta do loggedin user ko

			localStorage.removeItem("user-threads");
			setUser(null); //logout ke baad user null - clear our state
		} catch (error) {
			showToast("Error", error, "error");
		}
	};
	return (
		<Button position={"fixed"} top={"30px"} right={"30px"} size={"sm"} onClick={handleLogout}>
			<FiLogOut size={20} />
		</Button>
	);
};

export default LogoutButton;