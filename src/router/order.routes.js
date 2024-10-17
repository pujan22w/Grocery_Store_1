import { Router } from "express";
import { verifyAdmin } from "../middleware/role.middleware.js";

import {
  createOrder,
  getCurrentUserOrder,
  getAllOrder,
  cancleOrder,
  deleteOrder,
} from "../controller/order.controller.js";

import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

//user route

router.route("/").post(verifyJWT, createOrder);
router.route("/me").get(verifyJWT, getCurrentUserOrder);
router.route("/cancle/:orderId").patch(verifyJWT, cancleOrder);

router.route("/delete/order/:id").delete(verifyJWT, manageOrder);
router.route("/delete/order/:id").delete(verifyJWT, deleteOrder);
// >> 8606c75a334b51ece495f12a0137eedcb243fef3

// admin only route

router.route("/").get(verifyJWT, verifyAdmin, getAllOrder);

export default router;
