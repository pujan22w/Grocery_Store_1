import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();
import fs from "fs";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return `could not find file path`;
    // upload file  on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // file has upload sucessfully
    console.log("file has upload sucessfully", response.url);
    return response;
  } catch (error) {
    console.log("error from cloudinery", error);
    fs.unlinkSync(localFilePath); //remove the locally save file
    return null;
  }
};

export { uploadOnCloudinary };
