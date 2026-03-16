const express = require("express");
const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/auth", require("./routes/authRoute"));
app.use("/tasks", require("./routes/taskRoute"));

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Collabzz Task Manager API is running 🚀",
    version: "1.0.0",
  });
});

// 404 handler — must come after all routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler — must be the last middleware
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;