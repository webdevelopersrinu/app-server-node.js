const express = require("express");
const userController = require("./../Controller/userController");
const authRoute = express.Router();

authRoute.route("/signup").post(userController.signup);
authRoute.route("/login").post(userController.login);
authRoute.route("/forgetPassword").post(userController.forgetPassword);
authRoute.route("/psswordReset/:token").patch(userController.psswordReset);
authRoute.route("/getAllUsers").get(userController.getAllUsers);
authRoute
  .route("/updatePassword")
  .patch(userController.protucte, userController.updatePassword);
authRoute
  .route("/updateInfo")
  .patch(userController.protucte, userController.updateMe);
authRoute
  .route("/deleteInfo")
  .delete(userController.protucte, userController.deleteMe);
module.exports = authRoute;
