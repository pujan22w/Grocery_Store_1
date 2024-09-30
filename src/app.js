import express from "express";

import cookieParser from "cookie-parser";

import cors from "cors";

import passport from "./password.js";

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

import session from "express-session";

app.use(express.static("public"));

app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET,
  })
);

app.use(cookieParser());

app.use(passport.initialize());
app.use(passport.session());

import userRouter from "./router/user.routes.js";

import productRouter from "./router/porduct.routes.js";

import orderRoute from "./router/order.routes.js";

import otpRoute from "./router/otp.routes.js";

app.get("/", (req, res) => {
  res.send("up and running");
});

app.use("/api/v1/users", userRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/order", orderRoute);
app.use("/api/v1/otp", otpRoute);

export { app };

/* TODO:make payment track order */
