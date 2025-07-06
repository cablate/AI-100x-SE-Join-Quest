import { Task } from "../domain/Task";
import { CreateTaskRequest, UpdateTaskRequest } from "../domain/types";

export class TaskService {
  // 單例模式
  private static instance: TaskService;
  private static tasks: Map<string, Task> = new Map();

  private constructor() {
    // 私有建構函式
  }

  static getInstance(): TaskService {
    if (!TaskService.instance) {
      TaskService.instance = new TaskService();
    }
    return TaskService.instance;
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

    // 權限檢查：只有任務負責人可以修改
    if (task.assigneeId !== request.updatedBy) {
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
}
