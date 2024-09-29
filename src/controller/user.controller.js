import { asyncHandler } from "../utils/Asynchandler.js";
import { OTP } from "../models/otp.model.js";

import { ApiError } from "../utils/ApiError.js";

import { User } from "../models/user.model.js";

import { ApiResponse } from "../utils/Apiresponse.js";
import jwt from "jsonwebtoken";

import cookieParser from "cookie-parser";

import { otpSender } from "./otp.controller.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while generating  refresh token"
    );
  }
};

// user Register

const registerUser = asyncHandler(async (req, res) => {
  if (!req.body) {
    throw new ApiError(400, "All fields are required");
  }
  const {
    address,
    otp,
    email,
    fullName,
    password,
    phone,
    role,
    gender,
    dateOfBirth,
  } = req.body;
  function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  if (!validateEmail(email)) throw new ApiError(400, "Invalid email address");

  function validatePhoneNumber(phone) {
    const regex = /(\+977)?[9][6-9]\d{8}/;
    return regex.test(phone);
  }
  if (!validatePhoneNumber(phone)) {
    throw new ApiError(400, "invalid phone number");
  }

  // if (
  //   [fullname, address, email, username, password, phone].some(
  //     (fields) => fields?.trim() === ""
  //   )
  // ) {
  //   throw new ApiError(400, "All fields are required");
  // }
  const lowercasefullName = fullName.toLowerCase();

  const existUserByEmail = await User.findOne({ email });
  if (existUserByEmail) {
    throw new ApiError(409, "Email already  register");
  }

  const checkOtp = await OTP.findOne({ email: email });

  if (!checkOtp) {
    throw new ApiError(400, " OTP not found or expired");
  }

  const otpemail = checkOtp.email;
  const dbotp = checkOtp.otp;

  if (email !== otpemail || otp !== dbotp) {
    throw new ApiError(401, "invalid email  or otp ");
  }

  const user = await User.create({
    fullName: lowercasefullName,
    email,
    password,
    phone,
    address,
    role,
    dateOfBirth,
    gender,
  });

  await OTP.deleteOne({ email: email });

  const createUser = await User.findById(user._id).select(
    " -password -refreshToken"
  );
  if (!createUser) {
    throw new ApiError(500, "something  went wrong while  regestering user");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, createUser, "user register successfully"));
});

// login user
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    throw new ApiError(400, "email is required");
  }
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "user doesnot exit");
  }
  const ispasswordValid = await user.isPasswordCorrect(password);

  if (!ispasswordValid) {
    throw new ApiError(401, "invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  const loggedInuser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200),
      {
        user: loggedInuser,
        accessToken,
        refreshToken,
      },
      "user logged in successfully"
    );
});

//logout user
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: null,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user loged out"));
});

//refresh  the token
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incommingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incommingRefreshToken) {
    throw new ApiError(401, "unathorize request");
  }

  try {
    const decodedToken = jwt.verify(
      incommingRefreshToken,
      process.env.REFRESS_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "invalid refresh token");
    }
    if (incommingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "refresh token is expired");
    }

    const options = {
      httpsOnly: true,
      secure: true,
    };

    const { accessToken, newrefreshToken } =
      await generateAccessAndRefreshToken(user._id);
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookies("refreshToken", newrefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newrefreshToken },
          "access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message, "invalid  refresh toke");
  }
});

// change password
const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user?._id);
  const IsPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!IsPasswordCorrect) {
    throw new ApiError(400, "invalid  old password");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, "password change successfully"));
});

// get current user
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user fetch"));
});

const admin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    throw new ApiError(400, "email is required");
  }
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "user doesnot exit");
  }
  const ispasswordValid = await user.isPasswordCorrect(password);

  if (!ispasswordValid) {
    throw new ApiError(401, "invalid user credentials");
  }

  const { role } = user;
  if (role !== "admin")
    throw new ApiError(403, "not authorize to access this route");

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  const loggedInuser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200),
      {
        user: loggedInuser,
        accessToken,
        refreshToken,
      },
      "user logged in successfully"
    );
});

const findUser = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) {
    throw new ApiError(400, "user does not exit");
  }

  const userinfo = await User.find({ email: email }).select(
    "fullName email phone"
  );
  return res.status(200).json(new ApiResponse(200, userinfo, "user found"));
});

const requestPasswordReset = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const user = await User.findOne({ email: email });

  if (!user) {
    throw ApiError(400, "email address doesnt exit");
  }

  const dbOtp = await OTP.findOne({ email: email });
  if (!dbOtp) {
    throw new ApiError(201, "otp not found or expire");
  }

  const otpEmail = dbOtp.email;
  const Otp = dbOtp.otp;

  if (email !== otpEmail || otp !== Otp) {
    throw new ApiError(201, "invalid email or otp");
  }
  user.password = newPassword;
  await user.save();

  await OTP.deleteOne({ email });

  return res
    .status(201)
    .json(new ApiResponse(201, "password changed successfully"));
});
export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
  getCurrentUser,
  admin,
  findUser,
  requestPasswordReset,
};
