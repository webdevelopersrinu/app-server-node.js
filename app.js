const express = require("express");
const cors = require("cors");
const foodRoute = require("./Routes/foodRoutes");
const CustomError = require("./Utils/CustomError");
const GlowbalErrorController = require("./Controller/GlowbalErrorController");
const authRoute = require("./Routes/authRoutes");
const rateLimitig = require("express-rate-limit");
const helmet = require("helmet");
const sanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp=require("hpp")
const app = express();


app.use(helmet());
const limiting = rateLimitig({
  max: 3,
  windowMs: 30 * 1000,
  message:
    "we have recevied too many requests from this IP . please try after one hour.",
});

app.use("/api/v1/auth/login", limiting);
app.use(cors());
app.use(express.json({ limit: "10kb" }));
app.use(xss());
app.use(sanitize());
app.use(hpp("price"))
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/foodIteams", foodRoute);
app.all("*", (req, res, next) => {
  let message = `page ${req.originalUrl}  is not found`;
  let err = new CustomError(message, 404);
  next(err);
});
app.use(GlowbalErrorController);
module.exports = app;
