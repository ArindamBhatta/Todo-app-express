import { Router } from "express";

import {
  registerUser,
  loginUser,
  logoutUser,
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
/* 
1. verifyJwt → Verifies token from cookie or Authorization header.
2. logoutUser → Unset refreshToken from DB.
3. clearCookies → Clears the access token from the client.
*/
export default router;
