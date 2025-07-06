import { Request, Response } from "express";
import { CreateTaskRequest, UpdateTaskRequest } from "../domain/types";
import { TaskService } from "../services/TaskService";

export class TaskController {
  private taskService: TaskService;

  constructor() {
    this.taskService = TaskService.getInstance();
  }

  createTask = async (req: Request, res: Response) => {
    try {
      const { title, description, projectId, creatorId } = req.body;

      // 基本驗證
      if (!title || !description || !projectId || !creatorId) {
        return res.status(400).json({
          error: "Missing required fields",
          message: "title, description, projectId, and creatorId are required",
        });
      }

      const request: CreateTaskRequest = {
        title,
        description,
        projectId,
        creatorId,
      };

      const task = this.taskService.createTask(request);

      res.status(201).json({
        success: true,
        data: task.toData(),
      });
    } catch (error) {
      res.status(500).json({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  updateTask = async (req: Request, res: Response) => {
    try {
      const { taskId } = req.params;
      const { title, description, updatedBy } = req.body;

      // 基本驗證
      if (!updatedBy) {
        return res.status(400).json({
          error: "Missing required fields",
          message: "updatedBy is required",
        });
      }

      const request: UpdateTaskRequest = {
        title,
        description,
        updatedBy,
      };

      const task = this.taskService.updateTask(taskId, request);

      res.status(200).json({
        success: true,
        data: task.toData(),
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "任務不存在") {
          return res.status(404).json({
            error: "Task not found",
            message: error.message,
          });
        }
        if (error.message === "您沒有權限修改此任務") {
          return res.status(403).json({
            error: "Permission denied",
            message: error.message,
          });
        }
      }

      res.status(500).json({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  deleteTask = async (req: Request, res: Response) => {
    try {
      const { taskId } = req.params;
      const { deletedBy } = req.body;

      // 基本驗證
      if (!deletedBy) {
        return res.status(400).json({
          error: "Missing required fields",
          message: "deletedBy is required",
        });
      }

      const isDeleted = this.taskService.deleteTask(taskId, deletedBy);

      res.status(200).json({
        success: true,
        message: "Task deleted successfully",
        data: { taskId, deleted: isDeleted },
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "任務不存在") {
          return res.status(404).json({
            error: "Task not found",
            message: error.message,
          });
        }
        if (error.message === "您沒有權限刪除此任務") {
          return res.status(403).json({
            error: "Permission denied",
            message: error.message,
          });
        }
      }

      res.status(500).json({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  getTasks = async (req: Request, res: Response) => {
    try {
      const { userId } = req.query;

      // 基本驗證
      if (!userId || typeof userId !== "string") {
        return res.status(400).json({
          error: "Missing required query parameter",
          message: "userId is required as query parameter",
        });
      }

      const tasks = this.taskService.getTasks(userId);

      res.status(200).json({
        success: true,
        message: "Tasks retrieved successfully",
        data: {
          tasks,
          count: tasks.length,
        },
      });
    } catch (error) {
      res.status(500).json({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
}
