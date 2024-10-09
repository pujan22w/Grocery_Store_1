import { OTP } from "../models/otp.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/Apiresponse.js";

import { asyncHandler } from "../utils/Asynchandler.js";

import { sendmail } from "../utils/nodemailer.js";
import otpGenerator from "otp-generator";

const otpSender = asyncHandler(async (req, res) => {
  const { email } = req.body;
  function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
  if (!validateEmail(email)) throw new ApiError(400, "Invalid email address");
  const existEmail = await OTP.findOne({ email: email });

  if (existEmail) {
    await OTP.findOneAndDelete({ email: email });
  }

  const otp = otpGenerator.generate(7, {
    upperCaseAlphabets: false,
    specialChars: false,
  });

  await OTP.create({
    email,
    otp: otp,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });

  const subject = "your OTP code ";
  const message = `<p>Your OTP code is: <b>${otp}</b>. It will expire in 5 minutes.</p>`;

  await sendmail(email, subject, message);

  return res.status(201).json(new ApiResponse(201, `otp send to ${email}`));
});

export { otpSender };
