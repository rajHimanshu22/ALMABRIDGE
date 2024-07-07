import jwt from "jsonwebtoken";

//create the jwt token - we use sign()
const generateTokenAndSetCookie = (userId, res) => {
    // call it using sign() inside sign func the first thing is the (object) payload in the token so we are passing userid that we are getting as parameter and then after this object we will put some jwt secret which we put in env and after this secret we have another object which is when this token will expire
	const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
		expiresIn: "15d",
	});
    // created the token now set it as cookie

    //in cookie first is name (this name can be seen in the postan when we signup and cookies me jwt name dikha dega) and then pass the token that we created and one more object that is the options
	res.cookie("jwt", token, {
		httpOnly: true, // more secure //that is this cookie cannot be accessible by JS (browser) that will make it more secure
		maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days in millisec
		sameSite: "strict", // CSRF - its kimd of security vu;nerability and by adding this we are just make it more protecting it
        });
	return token;
    };

export default generateTokenAndSetCookie;

/* you need to create a JWT and assign it to a user when they successfully login into your application.

You can create and sign a JWT using the jsonwebtoken.sign() method. This method takes three arguments, a payload, a token secret, and a configuration object.

The payload can be user data, such as the username or email.

The token secret is a random string used to encrypt and decrypt data.
This string should be as long and as random as possible to make the authorization process harder for malicious users.*/