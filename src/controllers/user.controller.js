import { asyncHandler } from "../utils/asyncHandler.js";

import { ApiError } from "../utils/ApiError.js";

import { User } from "../models/user.model.js";

import { ApiResponse } from "../utils/ApiResponse.js";

/* 
  step 1: from frontend request body ge get the user details
  step 2: check this user details are empty or not
  step 3: check if the user already exists in the database
  step 4: does user upload his avatar or not
  step 5: if user upload his avatar then upload the image to cloudinary
  step 6: upload the user details to the database
  step 7: if user is successfully registered then send the response to the frontend
*/

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, fullName, password } = req.body;
  console.log("email:", email);

  //2. create a array and use method some to check if any of the fields are empty
  if ([username, email, fullName, password].some((field) => field === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email and username already exist");
  }

  const avatar = req.files?.avatar[0]?.path;

  if (!avatar) {
    throw new ApiError(400, "Avatar is required");
  }

  const user = await User.create({
    fullName: fullName,
    avatar: avatar.url,
  });
});
export { registerUser };
