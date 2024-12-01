const AsyncError = require("./../Utils/AsyncError");
const FoodModel = require("./../Model/FoodModel");
const CustomError = require("../Utils/CustomError");
exports.getAllFood = AsyncError(async (req, res, next) => {
  let foodData = await FoodModel.find();
  res.status(200).json({
    status: "success",
    length: foodData.length,
    foodData,
  });
});

exports.postFood = AsyncError(async (req, res, next) => {
  let foodData = await FoodModel.create(req.body);
  res.status(200).json({
    status: "success",
    message: "post iteam",
    length: foodData.length,
    foodData,
  });
});

exports.getFood = AsyncError(async (req, res, next) => {
  let foodData = await FoodModel.findById(req.params.id);
  if (!foodData) {
    let err = new CustomError("resource is not found", 404);
    return next(err);
  }
  res.status(200).json({
    status: "success",
    length: foodData.length,
    foodData,
  });
});

exports.patchFood = AsyncError(async (req, res, next) => {
  let foodData = await FoodModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!foodData) {
    let err = new CustomError("resource is not found", 404);
    return next(err);
  }
  res.status(200).json({
    status: "success",
    message: "update iteam",
    length: foodData.length,
    foodData,
  });
});

exports.deleteFood = AsyncError(async (req, res, next) => {
  let foodData = await FoodModel.findByIdAndDelete(req.params.id);
  if (!foodData) {
    let err = new CustomError("resource is not found", 404);
    return next(err);
  }
  res.status(200).json({
    status: "success",
    message: "delete iteam",
    length: foodData.length,
    foodData,
  });
});
