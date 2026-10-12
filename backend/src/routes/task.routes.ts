import { Router } from "express";
import { createTask, getTasks, updateTaskStatus, getAuditLogs, deleteTask } from "../services/task.service";
import { USERS } from "../constants/users";

const router = Router();

router.get("/", (req, res) => {
  const tasks = getTasks();

  return res.status(200).json(tasks);
});


router.post("/", (req, res) => {
  const { title } = req.body ?? {};

  if (typeof title !== "string" || !title.trim()) {
    return res.status(400).json({
      message: "Task title is required"
    });
  }

  const task = createTask(title);

  return res.status(201).json(task);
});

router.put("/:id/status", (req, res) => {
  const { status, actor } = req.body ?? {};
  const id = req.params.id;

  if (
    typeof status !== "string" ||
    typeof actor !== "string" ||
    !actor.trim()
  ) {
    return res.status(400).json({
      message: "Valid status and actor are required"
    });
  }

  if (!USERS.some((user) => user === actor)) {
    return res.status(400).json({
      message: "Invalid actor"
    });
  }

  const result = updateTaskStatus(id as string, status, actor.trim());

  if (result.type === "not_found") {
    return res.status(404).json({
      message: "Task not found"
    });
  }

  if (result.type === "invalid_transition") {
    return res.status(400).json({
      message: "Invalid status transition"
    });
  }

  return res.status(200).json(result);
});

router.get("/:id/audit-logs", (req, res) => {
  const taskId = req.params.id as string;

  const logs = getAuditLogs(taskId);

  return res.status(200).json(logs);
});

router.delete("/:id", (req, res) => {
  const id = req.params.id as string;

  const deleted = deleteTask(id);

  if (!deleted) {
    return res.status(404).json({
      message: "Task not found or already deleted"
    });
  }

  return res.status(200).json({
    message: "Task deleted successfully"
  });
});

export default router;