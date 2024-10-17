import { asyncHandler } from "../utils/Asynchandler.js";

import { Types } from "mongoose";

import { Product } from "../models/product.model.js";

import { uploadOnCloudinary } from "../utils/productImageUpload.js";

import { ApiError } from "../utils/ApiError.js";

import { ApiResponse } from "../utils/Apiresponse.js";
import { sendmail } from "../utils/nodemailer.js";

// rgeister product

const registerProduct = asyncHandler(async (req, res) => {
  const role = req.role;

  if (role !== "admin") {
    throw new ApiError(401, "not authorize to access this route");
  }
  const { productname, category, price, stock, isavailable, weight } = req.body;
  // if (
  //   [productname, category, price, stock, isavailable].some(
  //     (field) => field?.trim() === ""
  //   )
  // ) {
  //   throw new ApiError(400, "All fields are required");
  // }

  const productLocalPath = req.file?.path;

  if (!productLocalPath) {
    throw new ApiError(400, "product image local path is  required");
  }
  const image = await uploadOnCloudinary(productLocalPath);

  if (!image) {
    throw new ApiError(400, "product image is required");
  }
  const product = await Product.create({
    productname,
    category,
    price,
    stock,
    isavailable,
    productImage: image.url,
    weight,
  });

  const productCreated = await Product.findById(product._id);

  if (!productCreated) {
    throw new ApiError(500, "something went wrong while  creating product");
  }

  const name=productname
  

  return res
    .status(201)
    .json(
      new ApiResponse(200, productCreated, " product register successfully")
    );
});

const getAllProducts = asyncHandler(async (_, res) => {
  try {
    const products = await Product.find();
    return res
      .status(201)
      .json(new ApiResponse(200, { products, nbHits: products.length }));
  } catch (error) {
    throw new ApiError(404, error?.message, " Not found");
  }
});

const filterProduct = asyncHandler(async (req, res) => {
  try {
    const { productname, category, isavailable } = req.query;
    const queryObject = {};
    if (isavailable)
      queryObject.isavailable = isavailable === "true" ? true : false;

    if (productname) {
      queryObject.productname = productname.toLowerCase();
    }

    if (category) {
      queryObject.category = category;
    }

    console.log(queryObject);
    const products = await Product.find(queryObject).select(
      " -createdAt -updatedAt -__v"
    );

    return res.status(200).json(
      new ApiResponse(200, {
        products,
        nbHits: products.length,
      })
    );
  } catch (error) {
    throw new ApiError(400, error?.message);
  }
});

const getProduct = asyncHandler(async (req, res, next) => {
  try {
    const { id: productID } = req.params;

    // Validate productID
    if (!Types.ObjectId.isValid(productID)) {
      throw new ApiError(400, "Invalid product ID format");
    }

    const product = await Product.findOne({ _id: productID }).select(
      "-_id -createdAt -updatedAt -__v"
    );

    if (!product) {
      throw new ApiError(404, "No product available");
    }

    return res.status(200).json(new ApiResponse(200, product));
  } catch (error) {
    if (error.name === "CastError") {
      next(new ApiError(400, "Invalid product ID format"));
    } else {
      next(error);
    }
  }
});

const updateProduct = asyncHandler(async (req, res, next) => {
  const role = req.role;
  console.log("Received Body", req.body);
  if (role !== "admin") {
    throw new ApiError(401, "not authorize to access this route");
  }
  try {
    const { productname, category, price, stock, isavailable, weight } =
      req.body;
    console.log("Updating Product:", {
      productname,
      category,
      price,
      stock,
      isavailable,
      weight,
    });
    const { id: productID } = req.params;
    if (!Types.ObjectId.isValid(productID)) {
      throw new ApiError(400, "Invalid product ID format");
    }

    const product = await Product.findByIdAndUpdate(
      { _id: productID },
      {
        $set: {
          productname,
          category,
          price,
          stock,
          isavailable,
          weight,
        },
      },
      { new: true }
    ).select("-_id -createdAt -updatedAt -__v");
    return res
      .status(200)
      .json(new ApiResponse(200, product, "update success"));
  } catch (error) {
    if (error.name === "CastError") {
      next(new ApiError(400, "Invalid product ID format"));
    } else {
      next(error);
    }
  }
});
const deleteProduct = asyncHandler(async (req, res) => {
  const role = req.role;

  if (role !== "admin") {
    throw new ApiError(401, "not authorize to access this route");
  }
  const { id: productID } = req.params;
  try {
    if (!Types.ObjectId.isValid(productID)) {
      throw new ApiError(400, "Invalid product ID format");
    }
    const product = await Product.findByIdAndDelete({ _id: productID });
    return res.status(200).json(new ApiResponse(200, "product removed"));
  } catch (error) {
    if (error.name === "CastError") {
      next(new ApiError(400, "Invalid product ID format"));
    } else {
      next(error);
    }
  }
});

export {
  registerProduct,
  getAllProducts,
  filterProduct,
  deleteProduct,
  updateProduct,
  getProduct,
};
