import { otpSender } from "../controller/otp.controller.js";

import { Router } from "express";

const router = Router();

router.route("/").post(otpSender);

export default router;
