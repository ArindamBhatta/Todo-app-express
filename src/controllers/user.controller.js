import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    console.log("Generated Access Token:", accessToken);
    console.log("Generated Refresh Token:", refreshToken);

    if (!refreshToken) {
      throw new ApiError(500, "Failed to generate refresh token");
    }

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    console.log("Saved User with Refresh Token:", user.refreshToken);

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error in generateAccessAndRefreshTokens:", error);
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token",
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  /* 
  step 1: from frontend request body ge get the user details
  step 2: check this user details are empty or not
  step 3: check if the user already exists in the database
  step 4: does user upload his avatar or not
  step 5: if user upload his avatar then upload the image to cloudinary
  step 6: upload the user details to the database
  step 7: if user is successfully registered then send the response to the frontend
*/
  const { username, email, password } = req.body;

  if ([username, email, password].some((field) => field === "")) {
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

  if (!avatar) {
    throw new ApiError(400, "Failed to upload avatar");
  }

  const user = await User.create({
    username: username,
    email: email,
    avatar: avatar.url,
    password: password,
  });

  //again call mongoDB
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  if (!createdUser) {
    throw new ApiError(500, "something went wrong while registering a user");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  /* 
    send access and refresh token cookie and body both
  */
  const { email, username, password } = req.body;
  //it's not a form field json

  const hasRequiredFields = password && (email || username);
  if (!hasRequiredFields) {
    throw new ApiError(400, "email and password is require");
  }

  //step: 1: - login means already register find that user
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User doesn't exist");
  }
  //step 2: - password is encrypt check bcrypt found okay return true
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "invalid User  credentials");
  }
  //step 3: - generate access and refresh token via bson id
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id,
  );
  //step 4: - again call database to send a response to user
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  console.log("loginUser is", loggedInUser);

  const options = {
    httpOnly: true, //document.cookie not accessible
    security: true,
  };
  /* 
  document.cookie = "test=123";  // Creates a visible cookie
  console.log(document.cookie);  // Shows "test=123"
  */

  return (
    res
      .status(200)
      //If you add httpOnly: true, it's not accessible to JS, which is great for security. Works only in browsers — not on Android/iOS apps.
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            user: loggedInUser,
            accessToken,
            refreshToken,
          },
          "User login successfully",
        ),
      )
  );
});

const logoutUser = asyncHandler(async (req, _, next) => {
  /* 
1. verifyJwt → when login, frontend send us a encrypted access token in body also header file use this token in header Bearer xxxxxxx
2. logoutUser → Unset refreshToken from DB.
3. clearCookies → Clears the access token from the client.
*/
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    //This tells MongoDB to remove the refreshToken field from the document.
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    },
  );
  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }
  next();
});

const regenerateAccessToken = asyncHandler(async (req, res) => {
  /* 
1. access token expired, 
2. frontend send the refresh token 
3. backend match the refresh token 
4. if match backend send a new access token
5. change refresh token internally.
6. send to frontend again
*/
  const frontendSendRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  console.log("Frontend Refresh Token:", frontendSendRefreshToken);
  console.log("Cookies:", req.cookies);
  console.log("Body:", req.body);

  if (!frontendSendRefreshToken)
    throw new ApiError(401, "Unauthorized request: No refresh token provided");

  try {
    const decodedToken = jwt.verify(
      frontendSendRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );
    console.log("Decoded Token:", decodedToken);

    const user = await User.findById(decodedToken?._id);
    if (!user) throw new ApiError(401, "Invalid Refresh Token: User not found");

    console.log("Database Refresh Token:", user?.refreshToken);
    if (frontendSendRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token expired or used");
    }

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
    };

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);
    console.log("New Refresh Token:", newRefreshToken);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access Token and Refresh token regenerated successfully",
        ),
      );
  } catch (error) {
    console.error("Error in regenerateAccessToken:", error);
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { username, email } = req.body;

  if (!username || !email) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        username: username,
        email: email,
      },
    },
    { new: true },
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

const loginWithGoogle = asyncHandler(async (req, res) => {});

export {
  registerUser,
  loginUser,
  logoutUser,
  regenerateAccessToken,
  changeCurrentPassword,
  updateAccountDetails,
};
