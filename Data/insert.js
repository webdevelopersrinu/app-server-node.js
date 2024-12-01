const mongoose = require("mongoose");
const dotenv = require("dotenv");
const FoodModel = require("../Model/FoodModel");
const fs = require("fs");

dotenv.config({ path: "./../config.env" });

// db connection
mongoose
  .connect(process.env.DB_CON)
  .then(() => console.log("db connection is successfull..."))
  .catch(() => console.log("db connection is fail some error occured....."));

// data
const data = JSON.parse(fs.readFileSync("./data.json", "utf-8"));

function dataInsert() {
  FoodModel.create(data)
    .then(() => console.log("data insert seccusfully...."))
    .catch(() => console.log("data is not insert some error occured...."));
}
function dataDelete() {
  FoodModel.deleteMany()
    .then(() => console.log("data delete seccusfully...."))
    .catch(() => console.log("data is not delete some error occured...."));
}
dataInsert();
