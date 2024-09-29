import { Router } from "express";

const router = Router();

import { verifyAdmin } from "../middleware/role.middleware.js";
import { Upload } from "../middleware/multer.middleware.js";

import { verifyJWT } from "../middleware/auth.middleware.js";

import {
  registerProduct,
  getAllProducts,
  filterProduct,
  deleteProduct,
  updateProduct,
  getProduct,
} from "../controller/product.controller.js";

router.route("/").get(getAllProducts);
router.route("/filter").get(filterProduct);
router.route("/:id").get(getProduct);

// admin routes

router
  .route("/register")
  .post(verifyJWT, verifyAdmin, Upload.single("productImage"), registerProduct);
router
  .route("/:id")
  .patch(verifyJWT, verifyAdmin, updateProduct)
  .delete(verifyJWT, verifyAdmin, deleteProduct);

export default router;
