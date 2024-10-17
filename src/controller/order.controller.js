import { Order } from "../models/order.model.js";
import { Types } from "mongoose";
import { User } from "../models/user.model.js";
import { Product } from "../models/product.model.js";
import { asyncHandler } from "../utils/Asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { sendmail } from "../utils/nodemailer.js";
// TODO:  reduce the product stock after order is made

const createOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress } = req.body; // orderItems contains product IDs and quantities

  // Fetch the user making the order
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(401, "Login first to order a product");
  }

  // Use provided shipping address or default address from user
  const finalShippingAddress = shippingAddress || user.address;

  if (!finalShippingAddress) {
    throw new ApiError(400, "Shipping address is required");
  }
  if (!orderItems) {
    throw new ApiError(400, "order item not found");
  }
  // Validate and fetch product details
  const populatedOrderItems = await Promise.all(
    orderItems.map(async (item) => {
      const product = await Product.findById(item.productId);
      if (!product) {
        throw new ApiError(404, `Product with ID ${item.productId} not found`);
      }
      if (product.stock < item.quantity) {
        throw new ApiError(
          400,
          `Only ${product.stock} units of stock are available for  ${product.productname}`
        );
      }
      console.log(
        `product.stock=${product.stock} product.productname ${product.productname} item.quantity${item.quantity} `
      );
      product.stock -= item.quantity;

      await product.save();
      console.log(product.stock);

      return {
        productId: product._id,
        quantity: item.quantity,
        name: product.productname,
        image: product.productImage,
      };
    })
  );
  // Calculate the total price
  const totalPrice = await populatedOrderItems.reduce(
    async (totalPromise, item) => {
      const total = await totalPromise;
      const product = await Product.findById(item.productId);
      if (!product) {
        throw new ApiError(
          404,
          `Product with ID ${item.productId} not found during price calculation`
        );
      }
      return total + product.price * item.quantity;
    },
    Promise.resolve(0)
  );

  // Create the order
  const newOrder = new Order({
    totalPrice: totalPrice,
    customer: req.user._id,
    shippingAddress: finalShippingAddress, // Provided or default address  User who created the order
    orderItems: populatedOrderItems,
  });

  // Save the order to the database
  const savedOrder = await newOrder.save();

  const userOrder = await Order.findById(savedOrder._id).select(
    "orderItems.name   orderItems.image totalPrice shippingAddress status createdAt orderItems.quantity"
  );

  // Send the response
  res
    .status(201)
    .json(new ApiResponse(201, "Order created successfully", userOrder));
});

const getCurrentUserOrder = asyncHandler(async (req, res) => {
  console.log(req.body);
  const userId = req.user._id;
  if (!Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "please login first");
  }
  const order = await Order.find({ customer: userId }).select(
    "orderItems.name orderItems.quantity orderItems.image  totalPrice shippingAddress status createdAt"
  );
  if (!order) {
    throw new ApiError(400, "no order  have been made");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, "your order are", { order, nmhits: order.length })
    );
});

const cancleOrder = asyncHandler(async (req, res) => {
  console.log(req.body);
  const userId = await User.findById(req.user._id).select(" _id");
  if (!userId) {
    throw new ApiError(400, "user not register");
  }
  const order = await Order.findOne({ customer: userId });

  if (!order) {
    throw new ApiError(400, "no  order are made");
  }
  if (order.status === "SHIPPED" || order.status === "DELIVERED") {
    throw new ApiError(
      400,
      " cannot cancle order your order is  already on its  way to you"
    );
  }
  if (order.status === "CANCELED") {
    new ApiError(400, "order already cancled");
  }
  console.log(typeof order);

  if (order.orderItems && Array.isArray(order.orderItems)) {
    await Promise.all(
      order.orderItems.map(async (item) => {
        const product = await Product.findById(item.productId);
        if (product) {
          product.stock += item.quantity;
          await product.save();
        }
      })
    );
  } else {
    throw new ApiError(400, "Order items are not defined or not an array");
  }

  order.status = "CANCELED";
  await order.save();

  res.status(200).json(new ApiResponse(200, "order cancled", order));
});

const manageOrder = asyncHandler(async (req, res) => {
  try {
    const { id: orderId } = req.params;
    console.log(orderId);
    const ORDER_STATUS_THAT_CAN_BE_REMOVED = ["CANCELED", "DELIVERED"];
    const order = await Order.findById({ _id: orderId });
    if (!order) {
      throw new ApiError(404, "no order has been made");
    }

    if (!ORDER_STATUS_THAT_CAN_BE_REMOVED.includes(order.status)) {
      throw new ApiError(400, ` ${order.status} order cannot be  deleted `);
    }

    await Order.findByIdAndDelete(orderId);

    res.status(200).json(200, "order removed ");
  } catch (error) {
    console.log(error.message);

    throw new ApiError(500, "error while removing the cancle order");
  }
});

//admin controller

const getAllOrder = asyncHandler(async (_, res) => {
  try {
    const order = await Order.find();
    res.status(200).json( new ApiResponse(200, { order, nbHits: order.length }));
  } catch (error) {
    throw new ApiError(400, error?.message, " error while getting all orders");
  }
});
export {
  createOrder,
  getCurrentUserOrder,
  cancleOrder,
  getAllOrder,
  manageOrder,
};
