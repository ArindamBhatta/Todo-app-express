import { ApiResponse } from "../utils/ApiResponse.js";

const clearCookies = (_, res) => {
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
  };

  res.clearCookie("accessToken", options);
  res.clearCookie("refreshToken", options);

  const response = new ApiResponse(200, "User logged out successfully");

  res.json(response);
};

export { clearCookies };
