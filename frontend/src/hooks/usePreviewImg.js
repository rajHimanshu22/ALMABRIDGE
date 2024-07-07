import { useState } from "react";
import useShowToast from "./useShowToast";

const usePreviewImg = () => {
	const [imgUrl, setImgUrl] = useState(null);
	const showToast = useShowToast();
    //jb img upload kre tb preview jo chhota dikhe uske liye we use custom hook because we will use it again
	const handleImageChange = (e) => {
		const file = e.target.files[0]; //e.target will give array
		//console.log(file);//the file that we see when we upload img
		//this file has meta data which has some value name of img as name,size,type

		if (file && file.type.startsWith("image/")) {
			const reader = new FileReader();

			reader.onloadend = () => {
				setImgUrl(reader.result); //set the state
			};

			reader.readAsDataURL(file); //this will take our file that we selected and its going to it turn into bse 64 string and we will get that string and render in our ui
		} else {
			showToast("Invalid file type", " Please select an image file", "error"); //if it is not img type
			setImgUrl(null);
		}
	};

	//console.log(imgUrl); //se the a64 string
	return { handleImageChange, imgUrl, setImgUrl }; // i=handleimgchange sets the state and it sets the state
};

export default usePreviewImg;

//since it is a custom hook it will not return the jsx but an object
// file ka console.log - lastModified
// : 
// 1706955956693
// lastModifiedDate
// : 
// Sat Feb 03 2024 15:55:56 GMT+0530 (India Standard Time) {}
// name
// : 
// "Himanshu pic snp.jpg"
// size
// : 
// 152233
// type
// : 
// "image/jpeg"
// webkitRelativePath
// : 
""