import dotenv from "dotenv";

import { ApiError } from "../utils/ApiError.js";

import { asyncHandler } from "../utils/asyncHandler.js";

import jwt from "jsonwebtoken";

import { User } from "../models/user.model.js";
/* 
steps: - 
step 1: - If token is not found in cookies, try to get it from the Authorization header if native device
headers are set in requests, not stored like cookies.
JWT = the letter
    Bearer = the envelope that says “Deliver this as-is — trust whoever is carrying it”
 Bearer Token -> 	The method of sending the token -> Authorization: Bearer <JWT>   
*/
export const verifyJwt = asyncHandler(async (req, _, next) => {
  try {
    let token = req.cookies?.accessToken;
    console.log("Access token from cookie", token);

    if (!token) {
      const authHeader = req.header("Authorization");
      console.log("Authorization Header:", authHeader);

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new ApiError(401, "Authorization header missing or malformed");
      }

      token = authHeader.split(" ")[1];
      console.log("get the token from frontend:", token);
    }

    if (!token || token.split(".").length !== 3) {
      throw new ApiError(401, "Malformed or missing token");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (!decodedToken) {
      throw new ApiError(401, "miss match token");
    }

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken",
    );
    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("JWT verification error:", error);
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});
