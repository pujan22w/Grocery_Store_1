import { Router } from "express";

import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
  getCurrentUser,
  admin,
  findUser,
  requestPasswordReset,
} from "../controller/user.controller.js";

import { verifyJWT } from "../middleware/auth.middleware.js";

import passport from "passport";

import passport from "../password.js";

const router = Router();

router.route("/register").post(registerUser);

// secure route
router.route("/login").post(loginUser);

router.route("/logout").post(verifyJWT, logoutUser);

router.route("/refresh-token").post(refreshAccessToken);

router.route("/me").get(verifyJWT, getCurrentUser);

router.route("/change-password").post(verifyJWT, changePassword);

router.route("/admin").post(admin);
router.route("/findme").post(findUser);
router.route("/forgotpassword").post(requestPasswordReset);

export default router;
