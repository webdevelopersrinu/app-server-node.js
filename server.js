const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const mongoose = require("mongoose");

// uncaught Exception handel
// process.on("uncaughtException", (err) => {
//   console.log(`Error Name : ${err.name}`);
//   console.log(`Error Message : ${err.message}`);
//   console.log("uncaught Exception is occured shutdown server");
//   process.exit(1);
// });

const app = require("./app");

// start server
const server = app.listen(process.env.PORT, () => {
  console.log("server is start runing......");
});

// db connection
mongoose
  .connect(process.env.DB_CON)
  .then(() => console.log("db connection is successful"))
  .catch(() => console.log("db connection is connected some error occured!"));

// // handel unhandle rejection
// process.on("unhandledRejection", (err) => {
//   console.log(`Error Name : ${err.name}`);
//   console.log(`Error Message : ${err.message}`);
//   console.log("unhandle rejection is occured shutdown server");
//   server.close(() => {
//     process.exit(1);
//   });
// });

