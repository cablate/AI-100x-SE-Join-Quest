import { Router } from "express";
import { TaskController } from "../controllers/TaskController";

const router = Router();
const taskController = new TaskController();

// GET /api/tasks - 查詢任務
router.get("/", taskController.getTasks);

// POST /api/tasks - 創建任務
router.post("/", taskController.createTask);

// PUT /api/tasks/:taskId - 更新任務
router.put("/:taskId", taskController.updateTask);

// DELETE /api/tasks/:taskId - 刪除任務
router.delete("/:taskId", taskController.deleteTask);

export default router;
