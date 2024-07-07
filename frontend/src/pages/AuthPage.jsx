import { useRecoilValue } from "recoil";
import LoginCard from "../components/LoginCard";
import SignupCard from "../components/SignUpCard";
import authScreenAtom from "../atoms/authAtom";

const AuthPage = () => {
  const authScreenState = useRecoilValue(authScreenAtom); //grab the state //it is kind of like the useState() where whenever we want we get this first value and this setValue func
  //const [value,setValue]=useState("login"); for the setter value func (-setValue) we can use useSetRecoilState(authScreenAtom - here pass which atom we want to use) - this will give the setter func

  console.log(authScreenState);
  return (
    <>
      {authScreenState === "login" ? <LoginCard /> : <SignupCard />} 
      {/* when we click on signup on login page then the state should change and then change the ui*/}
      {/* by default the value will be login */}
    </>
  );
};

export default AuthPage;

//-------------------------------------------------------------------------
//useRecoilValue( pass the atom)
//Returns the value of an atom or selector (readonly or writeable) and subscribes the components to future updates of that state.
