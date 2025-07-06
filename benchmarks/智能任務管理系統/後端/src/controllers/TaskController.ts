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
      const { deletedBy } = req.query;

      // 基本驗證
      if (!deletedBy || typeof deletedBy !== "string") {
        return res.status(400).json({
          error: "Missing required query parameter",
          message: "deletedBy is required as query parameter",
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

  // 高級查詢任務
  queryTasks = async (req: Request, res: Response) => {
    try {
      const {
        status,
        projectId,
        assigneeId,
        search,
        startDate,
        endDate,
        sortBy,
        sortDirection,
        page,
        pageSize,
      } = req.query;

      // 構建查詢選項
      const queryOptions: any = {};

      if (status) queryOptions.status = status;
      if (projectId) queryOptions.projectId = projectId;
      if (assigneeId) queryOptions.assigneeId = assigneeId;
      if (search) queryOptions.search = search;
      if (startDate) queryOptions.startDate = new Date(startDate as string);
      if (endDate) queryOptions.endDate = new Date(endDate as string);
      if (sortBy) queryOptions.sortBy = sortBy;
      if (sortDirection) queryOptions.sortDirection = sortDirection;
      if (page) queryOptions.page = parseInt(page as string);
      if (pageSize) queryOptions.pageSize = parseInt(pageSize as string);

      const result = this.taskService.queryTasks(queryOptions);

      res.status(200).json({
        success: true,
        message: "Tasks queried successfully",
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  // 批量更新任務
  batchUpdateTasks = async (req: Request, res: Response) => {
    try {
      const { taskIds, updates, operatorId, transactionMode } = req.body;

      // 基本驗證
      if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
        return res.status(400).json({
          error: "Missing required fields",
          message: "taskIds must be a non-empty array",
        });
      }

      if (!updates || typeof updates !== "object") {
        return res.status(400).json({
          error: "Missing required fields",
          message: "updates must be an object",
        });
      }

      if (!operatorId) {
        return res.status(400).json({
          error: "Missing required fields",
          message: "operatorId is required",
        });
      }

      const batchRequest = {
        taskIds,
        updates,
        operatorId,
        transactionMode: transactionMode || "partial",
      };

      const result = this.taskService.batchUpdateTasks(batchRequest);

      res.status(200).json({
        success: true,
        message: "Batch update completed",
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
}
