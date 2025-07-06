import { Before, Given } from "@cucumber/cucumber";
import { Project } from "../src/domain/Project";
import { Task } from "../src/domain/Task";
import { User } from "../src/domain/User";
import { TaskService } from "../src/services/TaskService";

// 共享的測試資料
export let users: Map<string, User> = new Map();
export let projects: Map<string, Project> = new Map();
export let tasks: Map<string, Task> = new Map();
export let currentUser: User | null = null;
export let currentDate: Date;
export let taskService: TaskService;

// 在每個場景前清理狀態
Before(function () {
  // 清理 TaskService 中的靜態數據
  (TaskService as any).tasks.clear();

  // 清理測試狀態
  users.clear();
  projects.clear();
  tasks.clear();
  currentUser = null;
  setLastError(null);

  console.log("🧹 測試狀態已清理");
});

// 共享的 Given 步驟
Given("系統中存在用戶 {string} 和 {string}", function (user1: string, user2: string) {
  users.set(user1, new User(user1, `${user1}@example.com`));
  users.set(user2, new User(user2, `${user2}@example.com`));
  console.log(`建立用戶: ${user1}, ${user2}`);
});

Given("系統中存在用戶 {string}", function (userId: string) {
  users.set(userId, new User(userId, `${userId}@example.com`));
  console.log(`建立用戶: ${userId}`);
});

Given("系統中存在專案 {string} 由用戶 {string} 管理", function (projectId: string, userId: string) {
  const owner = users.get(userId);
  if (!owner) {
    throw new Error(`用戶 ${userId} 不存在`);
  }
  projects.set(projectId, new Project(projectId, `專案${projectId}`, owner));
  console.log(`建立專案: ${projectId}，管理者: ${userId}`);
});

Given("用戶 {string} 有權限存取專案 {string}", function (userId: string, projectId: string) {
  const user = users.get(userId);
  const project = projects.get(projectId);
  if (!user || !project) {
    throw new Error(`用戶 ${userId} 或專案 ${projectId} 不存在`);
  }
  console.log(`用戶 ${userId} 有權限存取專案 ${projectId}`);
});

Given("當前日期是 {int}-{int}-{int}", function (year: number, month: number, day: number) {
  currentDate = new Date(year, month - 1, day);
  console.log(`設定日期為: ${currentDate.toISOString().split("T")[0]}`);
});

Given("用戶 {string} 已登入系統", function (userId: string) {
  currentUser = users.get(userId) || null;
  if (!currentUser) {
    throw new Error(`用戶 ${userId} 不存在`);
  }

  taskService = TaskService.getInstance();

  // 將既有任務同步到 TaskService 中
  tasks.forEach((task, taskId) => {
    (TaskService as any).tasks.set(taskId, task);
  });

  console.log(`用戶 ${userId} 已登入`);
});

Given("系統中存在任務 {string} 負責人為 {string}", function (taskId: string, assigneeId: string) {
  const assignee = users.get(assigneeId);
  if (!assignee) {
    throw new Error(`用戶 ${assigneeId} 不存在`);
  }

  const task = new Task(taskId, "測試任務", "測試描述", "proj1", assigneeId);
  tasks.set(taskId, task);
  console.log(`建立任務: ${taskId}，負責人: ${assigneeId}`);
});

// 匯出共享的錯誤狀態
export let lastError: string | null = null;

// 設置錯誤狀態的輔助函數
export function setLastError(error: string | null) {
  lastError = error;
}

// 共享的錯誤驗證步驟
import { Then } from "@cucumber/cucumber";
import { expect } from "chai";

Then("錯誤訊息應該是 {string}", function (expectedError: string) {
  expect(lastError).to.equal(expectedError);
});
