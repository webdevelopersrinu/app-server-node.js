const JWT = require("jsonwebtoken");
const util = require("util");
const AsyncError = require("../Utils/AsyncError");
const Users = require("./../Model/UsersModel");
const CustomError = require("../Utils/CustomError");
const sendEmail = require("../Utils/Email");
const crypto = require("crypto");
function genToken(id) {
  let token = JWT.sign({ id }, process.env.SCRET_STR, {
    expiresIn: process.env.LOGIN_EXPAIR,
  });
  return token;
}
// create login jwt Token

function loginJwtGenerate(user, statusCode, res) {
  let token = genToken(user._id);
  const options = {
    maxAge: process.env.LOGIN_EXPAIR,
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }
  res.cookie("jwt", token, options);
  user.password = undefined;
  user.active = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    user,
  });
}

exports.signup = AsyncError(async (req, res, next) => {
  let userData = await Users.create(req.body);
  loginJwtGenerate(userData, 200, res);
});

exports.login = AsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  // check provide name email and password
  if (!email || !password) {
    let err = new CustomError("Enter Email And Password!", 401);
    return next(err);
  }
  //   check user exsite this email or not
  let user = await Users.findOne({ email }).select("+password");
  if (!user) {
    let err = new CustomError("user with email id is not exsit", 404);
    return next(err);
  }
  let isMatch = await user.compairePassword(password, user.password);
  if (!isMatch) {
    let err = new CustomError("password is worng!", 400);
    return next(err);
  }
  loginJwtGenerate(user, 200, res);
});

exports.protucte = AsyncError(async (req, res, next) => {
  // check token exsit or not
  let testToken = req.headers.authorization;
  let token;
  if (testToken && testToken.startsWith("Bearer")) {
    token = testToken.split(" ")[1] === "null" ? null : testToken.split(" ")[1];
  }
  if (!token) {
    let err = new CustomError("login to accese the content", 401);
    return next(err);
  }

  //   decode the token
  let deCodeToken = await util.promisify(JWT.verify)(
    token,
    process.env.SCRET_STR
  );
  //   check the user exsit or not
  let user = await Users.findById(deCodeToken.id);
  if (!user) {
    let err = new CustomError("user is not exsite in this token", 401);
    next(err);
  }
  // check password modifide or not
  if (await user.isPasswordChanged(deCodeToken.iat)) {
    let err = new CustomError(
      "psaaword is changed after create jwt so login again!",
      401
    );
    return next(err);
  }
  // pass next middelware
  req.user = user;
  next();
});

// restrict

// exports.restrict = (role) => {
//   return (req, res, next) => {
//     if (req.user.role != role) {
//       const err = new CustomError(
//         "you do not permission to perform this action",
//         403
//       );
//       return next(err);
//     }
//     next();
//   };
// };

exports.restrict = (...role) => {
  return (req, res, next) => {
    if (!role.includes(req.user.role)) {
      const err = new CustomError(
        "you do not permission to preform tis action",
        403
      );
      return next(err);
    }
    next();
  };
};

exports.forgetPassword = AsyncError(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    let err = new CustomError("provied email your accounte!", 404);
    return next(err);
  }
  // get the user in posted email
  let user = await Users.findOne({ email });
  if (!user) {
    let err = new CustomError("Email is not exsite account!", 404);
    return next(err);
  }
  // genaret token
  let resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  // send email
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/psswordReset/${resetToken}`;
  const message = `we have reseve the password reset request.fllowing likn to reset the password. \n \n ${resetUrl}`;
  try {
    await sendEmail({
      email: user.email,
      subject: "password change request risived",
      message,
    });
    res.status(200).json({
      status: "success",
      message: "password reset token send successfully",
    });
  } catch (err) {
    user.changePasswordResetToken = undefined;
    user.changePasswordResetTokenExpaire = undefined;
    user.save({ validateBeforeSave: false });
    let message =
      "there was an error sending password reset! place try angain leter....";
    return next(new CustomError(message, 500));
  }
});

exports.psswordReset = AsyncError(async (req, res, next) => {
  const token = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await Users.findOne({
    changePasswordResetToken: token,
    changePasswordResetTokenExpaire: { $gt: Date.now() },
  });
  if (!user) {
    let err = new CustomError("invalid reset token or token is expaired!", 400);
    return next(err);
  }
  console.log(user);
  // change password
  const { password, confirmPassword } = req.body;
  if (!password && !confirmPassword) {
    let err = new CustomError("provied password and confirmPassword", 403);
    return next(err);
  }
  user.password = password;
  user.confirmPassword = confirmPassword;
  if (user.password !== user.confirmPassword) {
    let err = new CustomError(
      "password and confirmPassword is not match! ",
      403
    );
    return next(err);
  }
  user.changePasswordResetToken = undefined;
  user.changePasswordResetTokenExpaire = undefined;
  user.passwordChangedAt = Date.now();
  console.log("password :- " + password);
  user.save();
  // login user
  loginJwtGenerate(user, 200, res);
});
// a b   d

exports.updatePassword = AsyncError(async (req, res, next) => {
  const { currentPassword, password, confirmPassword } = req.body;
  // check values are exesit or not
  if (!currentPassword || !password || !confirmPassword) {
    let err = new CustomError(
      "enter currentPassword and password and confirmPassword ",
      400
    );
    return next(err);
  }
  // check user exsite or not
  const user = await Users.findById(req.user._id);
  // check password is correct or not
  const isMatch = await user.compairePassword(currentPassword, user.password);
  if (!isMatch) {
    let err = new CustomError("password is worng!", 400);
    return next(err);
  }
  // updata password in db
  if (password !== confirmPassword) {
    let err = new CustomError(
      "password and confirmPassword is not match!",
      403
    );
    return next(err);
  }
  user.password = password;
  user.confirmPassword = confirmPassword;
  user.passwordChangedAt = Date.now();
  await user.save();
  // login user & send JWT
  loginJwtGenerate(user, 200, res);
});

exports.updateMe = AsyncError(async (req, res, next) => {
  if (req.body.password || req.body.confirmPassword) {
    let err = new CustomError("password is not Change this End point", 400);
    return next(err);
  }
  function patchDataObj(obj, ...arr) {
    const newObj = {};
    Object.keys(obj).forEach((item) => {
      if (arr.includes(item)) {
        newObj[item] = obj[item];
      }
    });
    return newObj;
  }
  const updataData = patchDataObj(req.body, "name", "email");
  // find user
  let userData = await Users.findByIdAndUpdate(req.user._id, updataData, {
    runValidators: true,
    new: true,
  });
  res.status(200).json({
    status: "success",
    message: "data is updated",
  });
});

exports.deleteMe = AsyncError(async (req, res, next) => {
  let deleteUser = await Users.findByIdAndUpdate(req.user._id, {
    active: false,
  });
  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getAllUsers = AsyncError(async (req, res, next) => {
  let userData = await Users.find();
  res.status(200).json({
    status: "success",
    length: userData.length,
    userData,
  });
});
