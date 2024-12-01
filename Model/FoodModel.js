const mongoose = require("mongoose");

const FoodIteams = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "food name is required"],
  },
  description: {
    type: String,
    required: [true, "food description is required"],
  },
  price: {
    type: Number,
    required: [true, "food price is required"],
  },
  category: {
    type: String,
    required: [true, "food category is required"],
  },
  availability: {
    type: Boolean,
    required: [true, "food availability is required"],
  },
});

const FoodModel = mongoose.model("foodmode", FoodIteams);

module.exports = FoodModel;
