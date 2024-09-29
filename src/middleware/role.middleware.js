import { ApiError } from "../utils/ApiError.js";
export function verifyAdmin(req, _, next) {
  if (req.role !== "admin") {
    throw new ApiError(401, "Not authorized to access this route");
  }
  next();
}
