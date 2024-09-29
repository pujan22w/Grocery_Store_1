import { Router } from "express";
import { verifyAdmin } from "../middleware/role.middleware.js";

import {
  createOrder,
  getCurrentUserOrder,
  getAllOrder,
  cancleOrder,
  manageOrder,
} from "../controller/order.controller.js";

import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

//user route

router.route("/").post(verifyJWT, createOrder);
router.route("/me").get(verifyJWT, getCurrentUserOrder);
router.route("/cancle/:orderId").patch(verifyJWT, cancleOrder);
router.route("/delete/order/:orderId").delete(verifyJWT, manageOrder);

// admin only route

router.route("/").get(verifyJWT, verifyAdmin, getAllOrder);

export default router;
