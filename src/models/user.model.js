import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

import moment from "moment";
const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
      lowercase: true,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
    },
    dateOfBirth: {
      type: Date, // Specifies that the field should be a Date type
      required: true, // This field is required
      validate: {
        validator: function (v) {
          return moment(v, moment.ISO_8601, true).isValid(); // Validate if the date is in a valid ISO format
        },
        message: (props) => `${props.value} is not a valid date format!`, // Error message
      },
    },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female"],
      lowercase: true,
    },

    address: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlenght: 8,
    },
    phonenumber: {
      type: Number,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    refreshToken: {
      type: String,
    },
  },

  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcryptjs.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcryptjs.compare(password, this.password);
};
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRE,
    }
  );
};
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESS_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESS_TOKEN_EXPIRE,
    }
  );
};

export const User = mongoose.model("User", userSchema);
