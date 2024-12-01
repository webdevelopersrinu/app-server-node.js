const CustomError = require("../Utils/CustomError");

// development error
function devError(res, err) {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stackTrace: err.stack,
    err,
  });
}

// production error
function proError(res, err) {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: "Error",
      message: "something went worng place try leter",
    });
  }
}

// ValidationErrorHnadeler

function ValidationErrorHnadeler(err) {
  let message = Object.values(err.errors)
    .map((val) => val.message)
    .join(". ");
  return new CustomError(message, 400);
}

// CastErrorhandeler

function CastErrorhandeler(err) {
  let message = `invalid value ${err.path} :${err.value}`;
  return new CustomError(message, 400);
}

// duplicateKeyHnadeler
function duplicateKeyHnadeler(err) {
  let message = `user with ${Object.keys(err.keyValue)} : ${Object.values(
    err.keyValue
  )} is alredy exsite!`;
  return new CustomError(message, 400);
}

// JsonWebTokenErrorHandeler
function JsonWebTokenErrorHandeler(err) {
  return new CustomError("not valid token", 401);
}
// TokenExpiredErrorHamdeler
function TokenExpiredErrorHamdeler(err) {
  return new CustomError("jwt is expaired login again",401);
}
const GlowbalErrorController = (err, req, res, next) => {
  err.status = err.status || "Error";
  err.statusCode = err.statusCode || 500;
  if (process.env.NODE_ENV === "development") {
    devError(res, err);
  }
  if (process.env.NODE_ENV === "production") {
    if (err.name === "ValidationError") {
      err = ValidationErrorHnadeler(err);
    }
    if (err.name === "CastError") {
      err = CastErrorhandeler(err);
    }
    if (err.code === 11000) {
      err = duplicateKeyHnadeler(err);
    }
    if (err.name === "JsonWebTokenError") {
      err = JsonWebTokenErrorHandeler(err);
    }
    if (err.name === "TokenExpiredError") {
      err = TokenExpiredErrorHamdeler(err);
    }
    proError(res, err);
  }
};
module.exports = GlowbalErrorController;

