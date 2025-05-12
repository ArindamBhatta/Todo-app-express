import { ApiResponse } from "../utils/ApiResponse.js";

const clearCookies = (_, res) => {
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
  };

  res.clearCookie("accessToken", options);
  res.clearCookie("refreshToken", options);

  // Correct the ApiResponse to use statuscode as a number
  const response = new ApiResponse(200, "User logged out successfully"); // Ensure 200 is passed as the status code

  res.json(response); // This should now work without error
};

export { clearCookies };
