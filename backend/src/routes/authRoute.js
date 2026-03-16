const express = require("express");
const router = express.Router();

const { register, login, getMe } = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const {
  registerValidator,
  loginValidator,
} = require("../middlewares/validateMiddleware");


router.post("/register", registerValidator, register);
router.post("/login", loginValidator, login);

router.get("/me", protect, getMe);

module.exports = router;