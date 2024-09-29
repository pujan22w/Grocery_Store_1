import express from "express";

import cookieParser from "cookie-parser";

import cors from "cors";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
); // who can send u request
app.use(express.json({ limit: "16kb" })); // limit the size of json
app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  })
);
app.use(express.static("public"));

app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET,
  })
);


app.use(cookieParser());

import userRouter from "./router/user.routes.js";

import productRouter from "./router/porduct.routes.js";

import orderRoute from "./router/order.routes.js";

import otpRoute from "./router/otp.routes.js";
import { session } from "passport";

app.get("/", (req, res) => {
  res.send("up and running");
});

app.use("/api/v1/users", userRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/order", orderRoute);
app.use("/api/v1/otp", otpRoute);

export { app };

/* TODO:make payment track order */
