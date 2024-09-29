import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    require: true,
  },
  otp: {
    type: String,
    require: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    get: (timestamp) => timestamp.getTime(),
    set: (timestamp) => new Date(timestamp),
  },
});

export const OTP = mongoose.model("Otp", otpSchema);
