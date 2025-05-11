import { asyncHandler } from "../utils/asyncHandler.js";

import { ApiError } from "../utils/ApiError.js";

import { User } from "../models/user.model.js";

import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

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

  if ([username, email, fullName, password].some((field) => field === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  let avatarLocalPath; //file name & file type But it does not send the destination or saved path that part is handled by the Multer

  if (
    req.files &&
    Array.isArray(req.files.avatar) &&
    req.files.avatar.length > 0
  ) {
    avatarLocalPath = req.files.avatar[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  console.log(avatar);

  if (!avatar) {
    throw new ApiError(400, "Failed to upload avatar");
  }

  const user = await User.create({
    username: username,
    email: email,
    fullName: fullName,
    avatar: avatar.url,
    password: password,
  });

  //again call mongoDB
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  console.log(
    "Create user after removing password and refresh-Token",
    createdUser,
  );

  if (!createdUser) {
    throw new ApiError(500, "something went wrong while registering a user");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

export { registerUser };
