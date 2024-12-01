const express = require("express");
const foodController = require("../Controller/foodController");
const userController = require("./../Controller/userController");
const foodRoute = express.Router();
foodRoute
  .route("/")
  .get(userController.protucte,foodController.getAllFood)
  .post(foodController.postFood);

foodRoute
  .route("/:id")
  .get(foodController.getFood)
  .delete(userController.protucte,userController.restrict("admin","author"),foodController.deleteFood)
  .patch(foodController.patchFood);
module.exports = foodRoute;
