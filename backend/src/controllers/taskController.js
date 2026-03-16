const Task = require("../models/taskModel");
const { successResponse, errorResponse } = require("../utils/response");

// ─── POST /tasks ──────────────────────────────────────────────────────────────
const createTask = async (req, res) => {
  try {
    const { title, description, status, assignedTo } = req.body;

    const task = await Task.create({
      title,
      description,
      status,
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
    });

    // Populate user info for the response
    await task.populate("createdBy", "name email");
    if (task.assignedTo) await task.populate("assignedTo", "name email");

    return successResponse(res, 201, "Task created successfully.", { task });
  } catch (error) {
    console.error("Create Task Error:", error);
    return errorResponse(res, 500, "Failed to create task.");
  }
};

// ─── GET /tasks ───────────────────────────────────────────────────────────────
// Supports: ?status=todo|in-progress|done  ?search=keyword  ?page=1  ?limit=10
const getAllTasks = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;

    // Build the query filter
    const filter = {};

    // Admins see all tasks; regular users only see tasks they created
    if (req.user.role !== "admin") {
      filter.createdBy = req.user._id;
    }

    // Filter by status
    if (status) {
      const { TASK_STATUSES } = require("../models/taskModel");
      if (!TASK_STATUSES.includes(status)) {
        return errorResponse(res, 400, `Status must be one of: ${TASK_STATUSES.join(", ")}`);
      }
      filter.status = status;
    }

    // Search by title (case-insensitive)
    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit))); // Cap at 50
    const skip = (pageNum - 1) * limitNum;

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .populate("createdBy", "name email")
        .populate("assignedTo", "name email")
        .sort({ createdAt: -1 }) // Newest first
        .skip(skip)
        .limit(limitNum),
      Task.countDocuments(filter),
    ]);

    return successResponse(res, 200, "Tasks fetched successfully.", {
      tasks,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    console.error("Get All Tasks Error:", error);
    return errorResponse(res, 500, "Failed to fetch tasks.");
  }
};

// ─── GET /tasks/:id ───────────────────────────────────────────────────────────
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email");

    if (!task) {
      return errorResponse(res, 404, "Task not found.");
    }

    // Regular users can only view their own tasks
    if (
      req.user.role !== "admin" &&
      task.createdBy._id.toString() !== req.user._id.toString()
    ) {
      return errorResponse(res, 403, "You are not authorised to view this task.");
    }

    return successResponse(res, 200, "Task fetched successfully.", { task });
  } catch (error) {
    // Handle invalid MongoDB ObjectId format
    if (error.name === "CastError") {
      return errorResponse(res, 400, "Invalid task ID format.");
    }
    console.error("Get Task By ID Error:", error);
    return errorResponse(res, 500, "Failed to fetch task.");
  }
};

// ─── PUT /tasks/:id ───────────────────────────────────────────────────────────
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return errorResponse(res, 404, "Task not found.");
    }

    // Only the task creator (or an admin) can update it
    if (
      req.user.role !== "admin" &&
      task.createdBy.toString() !== req.user._id.toString()
    ) {
      return errorResponse(res, 403, "You can only update tasks you created.");
    }

    const { title, description, status } = req.body;

    // Only update fields that were provided
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;

    await task.save();

    await task.populate("createdBy", "name email");
    if (task.assignedTo) await task.populate("assignedTo", "name email");

    return successResponse(res, 200, "Task updated successfully.", { task });
  } catch (error) {
    if (error.name === "CastError") {
      return errorResponse(res, 400, "Invalid task ID format.");
    }
    console.error("Update Task Error:", error);
    return errorResponse(res, 500, "Failed to update task.");
  }
};

// ─── DELETE /tasks/:id ────────────────────────────────────────────────────────
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return errorResponse(res, 404, "Task not found.");
    }

    // Only the task creator (or an admin) can delete it
    if (
      req.user.role !== "admin" &&
      task.createdBy.toString() !== req.user._id.toString()
    ) {
      return errorResponse(res, 403, "You can only delete tasks you created.");
    }

    await task.deleteOne();

    return successResponse(res, 200, "Task deleted successfully.");
  } catch (error) {
    if (error.name === "CastError") {
      return errorResponse(res, 400, "Invalid task ID format.");
    }
    console.error("Delete Task Error:", error);
    return errorResponse(res, 500, "Failed to delete task.");
  }
};

module.exports = { createTask, getAllTasks, getTaskById, updateTask, deleteTask };