const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { errorResponse } = require("../utils/response");


const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return errorResponse(res, 401, "Access denied. No token provided.");
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return errorResponse(res, 401, "User belonging to this token no longer exists.");
    }

    req.user = user; 
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return errorResponse(res, 401, "Token has expired. Please log in again.");
    }
    if (error.name === "JsonWebTokenError") {
      return errorResponse(res, 401, "Invalid token. Please log in again.");
    }
    return errorResponse(res, 500, "Authentication error.");
  }
};


const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        403,
        "You do not have permission to perform this action."
      );
    }
    next();
  };
};

module.exports = { protect, restrictTo };