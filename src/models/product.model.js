import mongoose from "mongoose";

//how to interact with other scheam using mongoose

const productSchema = new mongoose.Schema(
  {
    productname: {
      type: String,
      required: true,
      index: true,
    },
    category: {
      type: String,
      require: true,
      enum: ["fruits", "vegetables", " juice", "chocolates", "snacks"],
      index: true,
    },
    price: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
      default: 0,
    },
    isavailable: {
      type: Boolean,
      default: false,
    },
    weight: {
      type: String,
      required: true,
    },
    productImage: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

productSchema.pre("save", function (next) {
  this.productname = this.productname.toLowerCase();
  next();
});
productSchema.pre("save", function (next) {
  // Set isAvailable to false only when stock is exactly 0
  this.isAvailable = this.stock !== undefined && this.stock > 0;
  next();
});

export const Product = mongoose.model("product", productSchema);
