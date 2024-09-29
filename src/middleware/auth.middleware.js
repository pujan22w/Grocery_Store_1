import { asyncHandler } from "../utils/Asynchandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    // console.log("Access Token from Cookie:", req.cookies?.accessToken);
    // console.log("Authorization Header:", req.header("Authorization"));
    // console.log("Extracted Token:", token);
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );
    const role = user.role;

    if (!user) {
      throw new ApiError(401, "invalid access token");
    }

    req.user = user;
    req.role = role;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "invalid access token");
  }
});
