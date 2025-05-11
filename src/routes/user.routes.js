import { Router } from "express";

import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

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

export default router;
