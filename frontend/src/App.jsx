import { Box, Button, Container } from "@chakra-ui/react";
import { Navigate, Routes, useLocation } from "react-router-dom";
import { Route } from "react-router-dom";
import UserPage from "./pages/UserPage";
import PostPage from "./pages/PostPage";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import { useRecoilValue } from "recoil";
import userAtom from "./atoms/userAtom";
import LogoutButton from "./components/LogoutButton";
import UpdateProfilePage from "./pages/UpdateProfilePage";
import CreatePost from "./components/CreatePost";
import ChatPage from "./pages/ChatPage";
import { SettingsPage } from "./pages/SettingsPage";

function App() {
  const user = useRecoilValue(userAtom); //to check if we have a user or not user hai ya nhi means loggedin hai ya nhi koi
  //console.log(user);

  const {pathname} = useLocation(); // this will give location obj which we will destructure
  // and this pathname is going to be whatever we have after the url localhost:5000

  return (
    <Box position={"relative"} w={"full"}>

    <Container maxW={pathname === "/" ? { base: "620px", md: "900px" } : "620px"}> {/*on homepage i have to show the suggested user thats why it has larger width*/}
      <Header/>
      <Routes>
        <Route path="/" element={ user ? <HomePage /> : <Navigate to="/auth"/>} /> {/*if we have a user we just want to see the homepage otherwise navigate the user to auth page */}
        <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to= "/"/>} /> {/* if user nhi hai to auth page pr le jao hai to homepage pr le jao*/}
        <Route path="/update" element={user ? <UpdateProfilePage /> : <Navigate to= "/auth"/>} />
       
        <Route
						path='/:username'
						element={
							user ? (
								<>
									<UserPage />
									<CreatePost />
								</>
							) : (
								<UserPage />
							) //jo login ho usko hi bs create post ka icon dikhe
						}
					/>
        <Route path="/:username/post/:pid" element={<PostPage/>}/>
        <Route path='/chat' element={user ? <ChatPage /> : <Navigate to={"/auth"} />} />
        <Route path='/settings' element={user ? <SettingsPage /> : <Navigate to={"/auth"} />} />
      </Routes>

      {/*logout button - user login hai to show logout button*/}
      {/* {user && <LogoutButton />} */}
      {/*jb iss logout btn pr click krega to user state null ho jayega tb ye auth page pr le aayega - above code se line 14 21 22 */}

    </Container>
    </Box>
  )
}

export default App

//------------------------------------------
// Container is like box in the centre in chakra and it is fluid means size bdhao ghatao but ye khud adjust kr lega khud ko ki wo centre me rhe
