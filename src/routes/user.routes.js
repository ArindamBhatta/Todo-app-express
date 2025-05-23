import { Router } from "express";

import {
  registerUser,
  loginUser,
  logoutUser,
  regenerateAccessToken,
  changeCurrentPassword,
  updateAccountDetails,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/file.upload.js";

import { verifyJwt } from "../middlewares/auth.js";

import { clearCookies } from "../middlewares/cookie.clear.js";

const router = Router();

router.route("/register").post(
  //middleware
  upload.fields([
    {
      name: "avatar", //this must match the field name in your form or Postman
      maxCount: 1,
    },
  ]),
  registerUser,
);
router.route("/login").post(loginUser);

router.route("/logout").post(verifyJwt, logoutUser, clearCookies);

router.route("/refresh-token").post(regenerateAccessToken);

router.route("/change-password").post(verifyJwt, changeCurrentPassword);

router.route("/update-account").patch(verifyJwt, updateAccountDetails);

// router
//   .route("/avatar")
//   .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);

export default router;
