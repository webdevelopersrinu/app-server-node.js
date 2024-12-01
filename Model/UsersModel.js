const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const crypto = require("crypto");
const { type } = require("os");
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "name is required"],
  },
  email: {
    type: String,
    required: [true, "email is required"],
    lowercase: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ["user", "admin", "author"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "password is required"],
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, "confirm password is required"],
    validate: {
      validator: function (value) {
        return value === this.password;
      },
      message: "confirm password and password is not match",
    },
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  passwordChangedAt: Date,
  changePasswordResetToken: String,
  changePasswordResetTokenExpaire: Date,
});

// convert encrpted
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcryptjs.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

// add softe delete functionality
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});
// password compaire
userSchema.methods.compairePassword = async function (pass, passdb) {
  return await bcryptjs.compare(pass, passdb);
};

//psaaword changed or not
userSchema.methods.isPasswordChanged = async function (JWTtimeStamp) {
  if (this.passwordChangedAt) {
    const passwordChangeTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return passwordChangeTimeStamp > JWTtimeStamp;
  }
  return false;
};

// generate password reset token
userSchema.methods.createPasswordResetToken = function () {
  let resetToken = crypto.randomBytes(32).toString("hex");
  this.changePasswordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.changePasswordResetTokenExpaire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const Users = mongoose.model("user", userSchema);
module.exports = Users;
