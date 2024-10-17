import mongoose from "mongoose";

const orderItemsSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  quantity: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
});

const orderSchema = new mongoose.Schema(
  {
    totalPrice: {
      type: Number,
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    shippingAddress: {
      type: String,
      required: true,
    },
    user: {
      type: String,
      require: true,
    },
    email: {
      type: String,
      require: true,
    },

    orderItems: {
      type: [orderItemsSchema],
    },

    status: {
      type: String,
      enum: ["PENDING", "CANCELED", "SHIPPED", "DELIVERED"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);
export const Order = mongoose.model("Order", orderSchema);
