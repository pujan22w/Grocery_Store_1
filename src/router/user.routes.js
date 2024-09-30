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
  googleLoginSuccess,
  googleLoginFailed,
  googleAuth,
  googleCallback,
  googleLogout,
} from "../controller/user.controller.js";

import { verifyJWT } from "../middleware/auth.middleware.js";

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

router.route("/login/success").get(googleLoginSuccess);

router.route("/google/login/failed").get(googleLoginFailed);
router.route("/google").get(googleAuth);
router.route("/google/callback").get(googleCallback);
router.route("/google/logout").get(googleLogout);

export default router;
