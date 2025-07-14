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
      const { title, description, projectId, creatorId, status, priority } = req.body;

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
        status,
        priority,
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
        data: { deleted: isDeleted },
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
      console.log("queryTasks 被調用，查詢參數:", req.query);
      const {
        userId,
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
        priority,
      } = req.query;

      // 基本驗證 - userId 是必需的
      if (!userId || typeof userId !== "string") {
        return res.status(400).json({
          error: "Missing required query parameter",
          message: "使用者ID為必填參數",
        });
      }

      // 構建查詢選項
      const queryOptions: any = { userId };

      // 狀態映射 - 將中文狀態轉換為英文
      if (status) {
        const statusMap: { [key: string]: string } = {
          "待處理": "TODO",
          "進行中": "in_progress", 
          "已完成": "completed",
          "已取消": "cancelled"
        };
        queryOptions.status = statusMap[status as string] || status;
      }
      if (projectId) queryOptions.projectId = projectId;
      if (assigneeId) queryOptions.assigneeId = assigneeId;
      if (search) queryOptions.search = search;
      
      // 優先級映射
      if (priority) {
        const priorityMap: { [key: string]: string } = {
          "高": "high",
          "中": "medium", 
          "低": "low"
        };
        queryOptions.priority = priorityMap[priority as string] || priority;
      }
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
        tasks: result.tasks,
        totalCount: result.totalCount,
        statistics: {
          total: result.totalCount,
          currentPage: result.currentPage || 1,
          totalPages: result.totalPages || 1,
        },
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
      const { operation, taskIds, data, userId } = req.body;

      // 基本驗證
      if (!operation) {
        return res.status(400).json({
          error: "Missing required fields",
          message: "operation is required",
        });
      }

      if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
        return res.status(400).json({
          error: "Missing required fields",
          message: "taskIds must be a non-empty array",
        });
      }

      if (!userId) {
        return res.status(400).json({
          error: "Missing required fields",
          message: "userId is required",
        });
      }

      // 驗證操作類型
      if (!["update_status", "delete", "update_assignee", "update_priority"].includes(operation)) {
        return res.status(400).json({
          error: "Invalid operation type",
          message: "不支援的操作類型",
        });
      }

      let results: any[] = [];
      let successCount = 0;
      let failedCount = 0;

      for (const taskId of taskIds) {
        try {
          const task = this.taskService.getTaskById(taskId);
          if (!task) {
            failedCount++;
            results.push({ taskId, error: "任務不存在" });
            continue;
          }

          // 權限檢查
          if (task.creatorId !== userId && task.assigneeId !== userId) {
            throw new Error("無權限操作他人任務");
          }

          if (operation === "delete") {
            this.taskService.deleteTask(taskId, userId);
            successCount++;
            results.push({ taskId, status: "deleted" });
          } else if (operation === "update_status" && data?.status) {
            this.taskService.updateTask(taskId, { 
              status: data.status, 
              updatedBy: userId 
            });
            successCount++;
            results.push({ taskId, status: "updated", newStatus: data.status });
          } else {
            failedCount++;
            results.push({ taskId, error: "無效的操作或數據" });
          }
        } catch (error) {
          if (error instanceof Error && error.message === "無權限操作他人任務") {
            return res.status(403).json({
              error: "Permission denied",
              message: "無權限操作他人任務",
            });
          }
          failedCount++;
          results.push({ taskId, error: error instanceof Error ? error.message : "未知錯誤" });
        }
      }

      const responseData: any = {
        success: true,
        results,
      };

      if (operation === "delete") {
        responseData.deletedCount = successCount;
      } else {
        responseData.updatedCount = successCount;
      }

      console.log("批量操作回應:", JSON.stringify(responseData, null, 2));
      console.log("回應中的 results:", responseData.results);
      console.log("results.length:", responseData.results ? responseData.results.length : "undefined");
      res.status(200).json(responseData);
    } catch (error) {
      res.status(500).json({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
}
