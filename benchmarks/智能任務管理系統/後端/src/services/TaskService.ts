import { Task } from "../domain/Task";
import { CreateTaskRequest, UpdateTaskRequest } from "../domain/types";

export interface QueryOptions {
  status?: string;
  projectId?: string;
  assigneeId?: string;
  search?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  page?: number;
  pageSize?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface QueryResult {
  tasks: Task[];
  totalCount: number;
  currentPage?: number;
  totalPages?: number;
  pageSize?: number;
}

export interface BatchUpdateRequest {
  taskIds: string[];
  updates: {
    status?: string;
    assigneeId?: string;
  };
  operatorId: string;
  transactionMode?: "strict" | "partial";
}

export interface BatchUpdateResult {
  successCount: number;
  failedCount: number;
  totalCount: number;
  errors: string[];
}

export class TaskService {
  // 單例模式
  private static instance: TaskService;
  private static tasks: Map<string, Task> = new Map();
  private static lockedTasks: Set<string> = new Set();
  private static operationLog: string[] = [];
  private static notifications: Map<string, string[]> = new Map();
  private static notificationsEnabled: boolean = false;

  private constructor() {
    // 私有建構函式
  }

  static getInstance(): TaskService {
    if (!TaskService.instance) {
      TaskService.instance = new TaskService();
    }
    return TaskService.instance;
  }

  // 清理所有任務資料（測試用）
  static clearAll(): void {
    TaskService.tasks.clear();
    TaskService.lockedTasks.clear();
    TaskService.operationLog.length = 0;
    TaskService.notifications.clear();
    TaskService.notificationsEnabled = false;
  }

  static lockTask(taskId: string): void {
    TaskService.lockedTasks.add(taskId);
  }

  static unlockTask(taskId: string): void {
    TaskService.lockedTasks.delete(taskId);
  }

  static isTaskLocked(taskId: string): boolean {
    return TaskService.lockedTasks.has(taskId);
  }

  static addOperationLog(log: string): void {
    TaskService.operationLog.push(log);
  }

  static getOperationLog(): string[] {
    return TaskService.operationLog;
  }

  static enableNotifications(): void {
    TaskService.notificationsEnabled = true;
  }

  static sendNotification(userId: string, message: string): void {
    if (!TaskService.notificationsEnabled) return;

    if (!TaskService.notifications.has(userId)) {
      TaskService.notifications.set(userId, []);
    }
    TaskService.notifications.get(userId)!.push(message);
  }

  static getNotifications(userId: string): string[] {
    return TaskService.notifications.get(userId) || [];
  }

  createTask(request: CreateTaskRequest): Task {
    // 驗證必填欄位
    if (!request.title || request.title.trim() === "") {
      throw new Error("標題為必填欄位");
    }

    if (!request.description || request.description.trim() === "") {
      throw new Error("描述為必填欄位");
    }

    if (!request.projectId || request.projectId.trim() === "") {
      throw new Error("專案ID為必填欄位");
    }

    // 生成唯一ID
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 創建任務
    const task = new Task(taskId, request.title, request.description, request.projectId, request.creatorId);

    // 儲存任務
    TaskService.tasks.set(taskId, task);

    return task;
  }

  updateTask(taskId: string, request: UpdateTaskRequest): Task {
    // 查找任務
    const task = TaskService.tasks.get(taskId);
    if (!task) {
      throw new Error("任務不存在");
    }

    // 權限檢查：允許任務創建者和負責人修改任務
    if (task.assigneeId !== request.updatedBy && task.creatorId !== request.updatedBy) {
      throw new Error("您沒有權限修改此任務");
    }

    // 更新任務資料
    const updatedTask = task.update({
      title: request.title,
      description: request.description,
    });

    // 更新存儲
    TaskService.tasks.set(taskId, updatedTask);

    return updatedTask;
  }

  deleteTask(taskId: string, deletedBy: string): boolean {
    // 查找任務
    const task = TaskService.tasks.get(taskId);
    if (!task) {
      throw new Error("任務不存在");
    }

    // 權限檢查：只有任務負責人可以刪除
    if (task.assigneeId !== deletedBy) {
      throw new Error("您沒有權限刪除此任務");
    }

    // 刪除任務
    TaskService.tasks.delete(taskId);

    return true;
  }

  getTasks(userId: string): Task[] {
    // 查詢所有屬於該用戶的任務
    const userTasks: Task[] = [];

    TaskService.tasks.forEach((task) => {
      // 返回用戶負責的任務
      if (task.assigneeId === userId) {
        userTasks.push(task);
      }
    });

    return userTasks;
  }

  // 高級查詢功能
  queryTasks(options: QueryOptions): QueryResult {
    let allTasks = Array.from(TaskService.tasks.values());

    // 狀態過濾
    if (options.status) {
      allTasks = allTasks.filter((task) => task.status === options.status);
    }

    // 專案過濾
    if (options.projectId) {
      allTasks = allTasks.filter((task) => task.projectId === options.projectId);
    }

    // 負責人過濾
    if (options.assigneeId) {
      allTasks = allTasks.filter((task) => task.assigneeId === options.assigneeId);
    }

    // 關鍵字搜索
    if (options.search) {
      allTasks = allTasks.filter((task) => task.title.includes(options.search!) || task.description.includes(options.search!));
    }

    // 時間範圍過濾
    if (options.startDate && options.endDate) {
      allTasks = allTasks.filter((task) => task.createdAt >= options.startDate! && task.createdAt <= options.endDate!);
    }

    // 排序
    if (options.sortBy) {
      allTasks.sort((a, b) => {
        let valueA: any;
        let valueB: any;

        const sortBy = options.sortBy!; // 使用非空斷言，因為已經檢查過了

        if (sortBy === "priority") {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          valueA = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          valueB = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
        } else if (sortBy === "createdAt" || sortBy === "updatedAt") {
          valueA = new Date(a[sortBy]).getTime();
          valueB = new Date(b[sortBy]).getTime();
        } else {
          valueA = (a as any)[sortBy];
          valueB = (b as any)[sortBy];
        }

        if (options.sortDirection === "desc") {
          return valueB > valueA ? 1 : valueB < valueA ? -1 : 0;
        } else {
          return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
        }
      });
    }

    const totalCount = allTasks.length;

    // 分頁
    if (options.page && options.pageSize) {
      const startIndex = (options.page - 1) * options.pageSize;
      const endIndex = startIndex + options.pageSize;
      allTasks = allTasks.slice(startIndex, endIndex);

      return {
        tasks: allTasks,
        totalCount,
        currentPage: options.page,
        pageSize: options.pageSize,
        totalPages: Math.ceil(totalCount / options.pageSize),
      };
    }

    return {
      tasks: allTasks,
      totalCount,
    };
  }

  // 批量更新功能
  batchUpdateTasks(request: BatchUpdateRequest): BatchUpdateResult {
    const result: BatchUpdateResult = {
      successCount: 0,
      failedCount: 0,
      totalCount: request.taskIds.length,
      errors: [],
    };

    const originalTasks = new Map<string, Task>();
    const hasFailures = request.transactionMode === "strict";

    // 記錄原始狀態（用於事務回滾）
    if (hasFailures) {
      request.taskIds.forEach((taskId) => {
        const task = TaskService.tasks.get(taskId);
        if (task) {
          originalTasks.set(taskId, task);
        }
      });
    }

    for (const taskId of request.taskIds) {
      try {
        const task = TaskService.tasks.get(taskId);
        if (!task) {
          throw new Error(`任務 ${taskId} 不存在`);
        }

        // 權限檢查：允許任務創建者和負責人修改任務
        if (task.assigneeId !== request.operatorId && task.creatorId !== request.operatorId) {
          throw new Error(`您沒有權限修改此任務`);
        }

        // 檢查任務鎖定（模擬）
        if (TaskService.isTaskLocked(taskId)) {
          throw new Error(`任務正在被其他用戶修改`);
        }

        // 執行更新
        let updatedTask = task;
        if (request.updates.status) {
          updatedTask = new Task(task.id, task.title, task.description, task.projectId, task.creatorId, task.assigneeId, request.updates.status, task.priority);
          TaskService.addOperationLog(`任務 ${taskId} 狀態更新為 ${request.updates.status}`);
        }
        if (request.updates.assigneeId) {
          const oldAssigneeId = updatedTask.assigneeId;
          updatedTask = new Task(updatedTask.id, updatedTask.title, updatedTask.description, updatedTask.projectId, updatedTask.creatorId, request.updates.assigneeId, updatedTask.status, updatedTask.priority);
          TaskService.addOperationLog(`任務 ${taskId} 負責人更新為 ${request.updates.assigneeId}`);

          // 發送通知
          TaskService.sendNotification(request.updates.assigneeId, "任務分配通知");
          if (oldAssigneeId !== request.updates.assigneeId) {
            TaskService.sendNotification(oldAssigneeId, "任務移除通知");
          }
        }

        TaskService.tasks.set(taskId, updatedTask);
        result.successCount++;
      } catch (error: any) {
        result.failedCount++;
        result.errors.push(`${taskId}: ${error.message}`);

        if (request.transactionMode === "strict") {
          // 回滾所有變更
          originalTasks.forEach((task, id) => {
            TaskService.tasks.set(id, task);
          });
          return {
            successCount: 0,
            failedCount: request.taskIds.length,
            totalCount: request.taskIds.length,
            errors: ["批量操作失敗，所有變更已回滾"],
          };
        }
      }
    }

    return result;
  }
}
