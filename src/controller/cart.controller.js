import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";

import { asyncHandler } from "../utils/Asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/Apiresponse.js";

// Add item to cart

const addToCart = asyncHandler(async (req, res, next) => {
  const { productId, quantity } = req.body;
  const userId = req.user._id;

  const product = await Product.findById(productId);
  if (!product) {
    return next(new ApiError(404, "Product not found"));
  }

  let cart = await Cart.findOne({ userId });

  // If no cart exists for the user, create a new one
  if (!cart) {
    cart = new Cart({ userId, items: [], totalPrice: 0 });
  }

  // Check if product is already in the cart
  const existingItem = cart.items.find(
    (item) => item.productId.toString() === productId
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({ productId, quantity });
  }

  // Recalculate the total price
  cart.totalPrice = cart.items.reduce(
    (total, item) => total + item.quantity * product.price,
    0
  );

  await cart.save();

  res.status(200).json(new ApiResponse(200, "Item added to cart", cart));
});

// Remove item from cart
const removeFromCart = asyncHandler(async (req, res, next) => {
  const { productId } = req.body;
  const userId = req.user._id;

  let cart = await Cart.findOne({ userId });

  if (!cart) {
    return next(new ApiError(404, "Cart not found"));
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.productId.toString() === productId
  );

  if (itemIndex === -1) {
    return next(new ApiError(404, "Item not found in cart"));
  }

  // Remove item from the cart
  cart.items.splice(itemIndex, 1);

  // Recalculate total price
  cart.totalPrice = cart.items.reduce(
    (total, item) => total + item.quantity * item.product.price,
    0
  );

  await cart.save();

  res.status(200).json(new ApiResponse(200, "Item removed from cart", cart));
});

// Get cart for a user
const getCart = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  const cart = await Cart.findOne({ userId }).populate("items.productId");

  if (!cart) {
    return next(new ApiError(404, "Cart not found"));
  }

  res
    .status(200)
    .json(new ApiResponse(200, "Cart retrieved successfully", cart));
});

export { addToCart, getCart, removeFromCart };
