const express = require("express");
const router = express.Router();

const {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

const { protect } = require("../middlewares/authMiddleware");
const {
  createTaskValidator,
  updateTaskValidator,
} = require("../middlewares/validateMiddleware");

router.use(protect);

router.route("/")
  .post(createTaskValidator, createTask)
  .get(getAllTasks);

router.route("/:id")
  .get(getTaskById)
  .put(updateTaskValidator, updateTask)
  .delete(deleteTask);

module.exports = router;