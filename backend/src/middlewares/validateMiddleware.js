const { body, validationResult } = require("express-validator");
const { TASK_STATUSES } = require("../models/taskModel");
const { errorResponse } = require("../utils/response");

// Run after validation rules — returns 400 if there are errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    return errorResponse(res, 400, messages[0]); // Return the first error message
  }
  next();
};

// ─── Auth Validators ────────────────────────────────────────────────────────

const registerValidator = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please enter a valid email"),
  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  validate,
];

const loginValidator = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please enter a valid email"),
  body("password")
    .notEmpty().withMessage("Password is required"),
  validate,
];

// ─── Task Validators ─────────────────────────────────────────────────────────

const createTaskValidator = [
  body("title")
    .trim()
    .notEmpty().withMessage("Task title is required")
    .isLength({ min: 3 }).withMessage("Title must be at least 3 characters")
    .isLength({ max: 100 }).withMessage("Title cannot exceed 100 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage("Description cannot exceed 500 characters"),
  body("status")
    .optional()
    .isIn(TASK_STATUSES).withMessage(`Status must be one of: ${TASK_STATUSES.join(", ")}`),
  body("assignedTo")
    .optional()
    .isMongoId().withMessage("assignedTo must be a valid user ID"),
  validate,
];

const updateTaskValidator = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3 }).withMessage("Title must be at least 3 characters")
    .isLength({ max: 100 }).withMessage("Title cannot exceed 100 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage("Description cannot exceed 500 characters"),
  body("status")
    .optional()
    .isIn(TASK_STATUSES).withMessage(`Status must be one of: ${TASK_STATUSES.join(", ")}`),
  validate,
];

module.exports = {
  registerValidator,
  loginValidator,
  createTaskValidator,
  updateTaskValidator,
};