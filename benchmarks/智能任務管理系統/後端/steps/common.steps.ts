import { Before, Given, Then } from "@cucumber/cucumber";
import { expect } from "chai";
import { Project } from "../src/domain/Project";
import { Task } from "../src/domain/Task";
import { User } from "../src/domain/User";
import { ProjectService } from "../src/services/ProjectService";
import { TaskService } from "../src/services/TaskService";

// 共享的測試資料
export let users: Map<string, User> = new Map();
export let projects: Map<string, Project> = new Map();
export let tasks: Map<string, Task> = new Map();
export let currentUser: User | null = null;
export let currentDate: Date;
export let taskService: TaskService;
export let queryResults: Task[] = [];

// 在每個場景前清理狀態
Before(function () {
  // 清理 TaskService 的靜態數據
  TaskService.clearAll();

  // 清理 ProjectService 的靜態數據
  ProjectService.clearAll();

  // 清理測試狀態
  users.clear();
  projects.clear();
  tasks.clear();
  currentUser = null;
  queryResults.length = 0;
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

Given("系統已初始化", function () {
  // 系統初始化步驟，目前為空
  console.log("系統已初始化");
});

Given("存在用戶 {string} 和 {string}", function (user1: string, user2: string) {
  users.set(user1, new User(user1, `${user1}@example.com`));
  users.set(user2, new User(user2, `${user2}@example.com`));
  console.log(`建立用戶: ${user1}, ${user2}`);
});

Given("存在用戶 {string}, {string}, {string}", function (user1: string, user2: string, user3: string) {
  users.set(user1, new User(user1, `${user1}@example.com`));
  users.set(user2, new User(user2, `${user2}@example.com`));
  users.set(user3, new User(user3, `${user3}@example.com`));
  console.log(`建立用戶: ${user1}, ${user2}, ${user3}`);
});

Given("用戶 {string} 已登入", function (userId: string) {
  currentUser = users.get(userId) || null;
  if (!currentUser) {
    throw new Error(`用戶 ${userId} 不存在`);
  }
  console.log(`用戶 ${userId} 已登入`);
});

Given("系統中存在專案 {string} 由用戶 {string} 管理", function (projectId: string, userId: string) {
  const owner = users.get(userId);
  if (!owner) {
    throw new Error(`用戶 ${userId} 不存在`);
  }
  projects.set(projectId, new Project(projectId, `專案${projectId}`, `專案${projectId}的描述`, owner.id));
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

Given("存在專案 {string}，擁有者為 {string}", function (projectId: string, ownerId: string) {
  const owner = users.get(ownerId);
  if (!owner) {
    throw new Error(`用戶 ${ownerId} 不存在`);
  }

  const projectService = ProjectService.getInstance();
  const project = projectService.createProject({
    name: `專案${projectId}`,
    description: `專案${projectId}的描述`,
    ownerId: owner.id,
  });

  // 使用真實的專案ID而不是參數中的標識符
  projects.set(project.id, project);
  // 同時也保存一個映射，以便在步驟中可以通過 projectId 找到真實的專案
  projects.set(projectId, project);
  console.log(`建立專案: ${projectId}，擁有者: ${ownerId}，真實ID: ${project.id}`);
});

// 批量任務操作相關步驟
Given("存在以下任務：", function (dataTable: any) {
  const taskService = TaskService.getInstance();

  const rows = dataTable.hashes();

  for (const row of rows) {
    const creator = users.get(row["創建者"]);
    const assignee = users.get(row["負責人"]);
    const projectName = row["專案"];

    if (!creator) {
      throw new Error(`創建者 ${row["創建者"]} 不存在`);
    }
    if (!assignee) {
      throw new Error(`負責人 ${row["負責人"]} 不存在`);
    }

    // 找到專案
    const project = projects.get(projectName);
    if (!project) {
      throw new Error(`專案 ${projectName} 不存在`);
    }

    // 直接創建任務對象，不使用 taskService.createTask()
    const taskId = row["ID"] || row["標題"];
    const task = new Task(taskId, row["標題"], row["描述"], project.id, creator.id, assignee.id, row["狀態"], row["優先級"] || "medium");

    // 保存到測試上下文
    tasks.set(taskId, task);

    // 保存到TaskService的內部存儲中，使用測試ID作為鍵
    (TaskService as any).tasks.set(taskId, task);

    console.log(`建立任務: ${taskId} - ${row["標題"]}，專案: ${projectName}，負責人: ${row["負責人"]}，狀態: ${row["狀態"]}`);
  }
});

Given("專案 {string} 的狀態是 {string}", function (projectId: string, status: string) {
  const project = projects.get(projectId);
  if (!project) {
    throw new Error(`專案 ${projectId} 不存在`);
  }

  // 使用 update 方法更新專案狀態
  const updatedProject = project.update({ status });

  // 更新兩個映射
  projects.set(projectId, updatedProject);
  projects.set(updatedProject.id, updatedProject);

  // 同時更新 ProjectService 中的專案
  const projectService = ProjectService.getInstance();
  (projectService as any).projects.set(updatedProject.id, updatedProject);

  console.log(`設定專案 ${projectId} 的狀態為: ${status}`);
});

// 匯出共享的錯誤狀態
export let lastError: string | null = null;

// 設置錯誤狀態的輔助函數
export function setLastError(error: string | null) {
  lastError = error;
}

// 獲取錯誤狀態的輔助函數
export function getLastError(): string | null {
  return lastError;
}

// 共享的錯誤驗證步驟
Then("錯誤訊息應該是 {string}", function (expectedMessage: string) {
  const lastError = getLastError();
  expect(lastError).to.equal(expectedMessage);
});

Then("更新應該失敗", function () {
  expect(lastError).to.not.be.null;
});

Then("專案狀態應該是 {string}", function (expectedStatus: string) {
  // 尋找第一個專案（通常是我們剛創建或更新的）
  const project = Array.from(projects.values())[0];
  if (!project) {
    throw new Error("沒有找到專案");
  }
  expect(project.status).to.equal(expectedStatus);
});
