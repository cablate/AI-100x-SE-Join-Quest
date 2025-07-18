import { Before, Given, Then } from "@cucumber/cucumber";
import { expect } from "chai";
import { Project } from "../../src/domain/Project";
import { Task } from "../../src/domain/Task";
import { User } from "../../src/domain/User";
import { ProjectService } from "../../src/services/ProjectService";
import { TaskService } from "../../src/services/TaskService";

// Shared test data
export let users: Map<string, User> = new Map();
export let projects: Map<string, Project> = new Map();
export let tasks: Map<string, Task> = new Map();
export let currentUser: User | null = null;
export let currentDate: Date;
export let taskService: TaskService;
export let queryResults: Task[] = [];

// Clear state before each scenario
Before(function () {
  // Clear TaskService static data
  TaskService.clearAll();

  // Clear ProjectService static data
  ProjectService.clearAll();

  // Clear test state
  users.clear();
  projects.clear();
  tasks.clear();
  currentUser = null;
  queryResults.length = 0;
  setLastError(null);

  console.log("🧹 Test state has been cleared");
});

// Shared Given steps
Given("系統中存在用戶 {string} 和 {string}", function (user1: string, user2: string) {
  users.set(user1, new User(user1, `${user1}@example.com`));
  users.set(user2, new User(user2, `${user2}@example.com`));
  console.log(`Created users: ${user1}, ${user2}`);
});

Given("系統中存在用戶 {string}", function (userId: string) {
  users.set(userId, new User(userId, `${userId}@example.com`));
  console.log(`Created user: ${userId}`);
});

Given("系統已初始化", function () {
  // System initialization step, currently empty
  console.log("System initialized");
});

Given("存在用戶 {string} 和 {string}", function (user1: string, user2: string) {
  users.set(user1, new User(user1, `${user1}@example.com`));
  users.set(user2, new User(user2, `${user2}@example.com`));
  console.log(`Created users: ${user1}, ${user2}`);
});

Given("存在用戶 {string}, {string}, {string}", function (user1: string, user2: string, user3: string) {
  users.set(user1, new User(user1, `${user1}@example.com`));
  users.set(user2, new User(user2, `${user2}@example.com`));
  users.set(user3, new User(user3, `${user3}@example.com`));
  console.log(`Created users: ${user1}, ${user2}, ${user3}`);
});

Given("用戶 {string} 已登入", function (userId: string) {
  currentUser = users.get(userId) || null;
  if (!currentUser) {
    throw new Error(`User ${userId} does not exist`);
  }
  console.log(`User ${userId} logged in`);
});

Given("系統中存在專案 {string} 由用戶 {string} 管理", function (projectId: string, userId: string) {
  const owner = users.get(userId);
  if (!owner) {
    throw new Error(`User ${userId} does not exist`);
  }
  projects.set(projectId, new Project(projectId, `Project ${projectId}`, `Description of Project ${projectId}`, owner.id));
  console.log(`Created project: ${projectId}, owner: ${userId}`);
});

Given("用戶 {string} 有權限存取專案 {string}", function (userId: string, projectId: string) {
  const user = users.get(userId);
  const project = projects.get(projectId);
  if (!user || !project) {
    throw new Error(`User ${userId} or project ${projectId} does not exist`);
  }
  console.log(`User ${userId} has access to project ${projectId}`);
});

Given("當前日期是 {int}-{int}-{int}", function (year: number, month: number, day: number) {
  currentDate = new Date(year, month - 1, day);
  console.log(`Set date to: ${currentDate.toISOString().split("T")[0]}`);
});

Given("用戶 {string} 已登入系統", function (userId: string) {
  currentUser = users.get(userId) || null;
  if (!currentUser) {
    throw new Error(`User ${userId} does not exist`);
  }

  taskService = TaskService.getInstance();

  // Sync existing tasks to TaskService
  tasks.forEach((task, taskId) => {
    (TaskService as any).tasks.set(taskId, task);
  });

  console.log(`User ${userId} logged in`);
});

Given("系統中存在任務 {string} 負責人為 {string}", function (taskId: string, assigneeId: string) {
  const assignee = users.get(assigneeId);
  if (!assignee) {
    throw new Error(`User ${assigneeId} does not exist`);
  }

  const task = new Task(taskId, "Test task", "Test description", "proj1", assigneeId);
  tasks.set(taskId, task);
  console.log(`Created task: ${taskId}, assignee: ${assigneeId}`);
});

Given("存在專案 {string}，擁有者為 {string}", function (projectId: string, ownerId: string) {
  const owner = users.get(ownerId);
  if (!owner) {
    throw new Error(`User ${ownerId} does not exist`);
  }

  const projectService = ProjectService.getInstance();
  const project = projectService.createProject({
    name: `Project ${projectId}`,
    description: `Description of Project ${projectId}`,
    ownerId: owner.id,
  });

  // Use the actual project ID instead of the identifier in the parameter
  projects.set(project.id, project);
  // Also save a mapping so we can find the actual project by projectId in steps
  projects.set(projectId, project);
  console.log(`Created project: ${projectId}, owner: ${ownerId}, actual ID: ${project.id}`);
});

// Batch task operation related steps
Given("存在以下任務：", function (dataTable: any) {
  const taskService = TaskService.getInstance();

  const rows = dataTable.hashes();

  for (const row of rows) {
    const creator = users.get(row["creator"]);
    const assignee = users.get(row["assignee"]);
    const projectName = row["project"];

    if (!creator) {
      throw new Error(`Creator ${row["creator"]} does not exist`);
    }
    if (!assignee) {
      throw new Error(`Assignee ${row["assignee"]} does not exist`);
    }

    // Find the project
    const project = projects.get(projectName);
    if (!project) {
      throw new Error(`Project ${projectName} does not exist`);
    }

    // Create task object directly, without using taskService.createTask()
    const taskId = row["ID"] || row["title"];
    const task = new Task(taskId, row["title"], row["description"], project.id, creator.id, assignee.id, row["status"], row["priority"] || "medium");

    // Save to test context
    tasks.set(taskId, task);

    // Save to TaskService's internal storage, using test ID as key
    (TaskService as any).tasks.set(taskId, task);

    console.log(`Creating task: ${taskId} - ${row["title"]}, project: ${projectName}, assignee: ${row["assignee"]}, status: ${row["status"]}`);
  }
});

Given("專案 {string} 的狀態是 {string}", function (projectId: string, status: string) {
  const project = projects.get(projectId);
  if (!project) {
    throw new Error(`Project ${projectId} does not exist`);
  }

  // Use update method to update project status
  const updatedProject = project.update({ status });

  // Update both mappings
  projects.set(projectId, updatedProject);
  projects.set(updatedProject.id, updatedProject);

  // Also update the project in ProjectService
  const projectService = ProjectService.getInstance();
  (projectService as any).projects.set(updatedProject.id, updatedProject);

  console.log(`Set project ${projectId} status to: ${status}`);
});

// Export shared error state
export let lastError: string | null = null;

// Helper function to set error state
export function setLastError(error: string | null) {
  lastError = error;
}

// Helper function to get error state
export function getLastError(): string | null {
  return lastError;
}

// Shared error validation steps
Then("錯誤訊息應該是 {string}", function (expectedMessage: string) {
  const lastError = getLastError();
  expect(lastError).to.equal(expectedMessage);
});

Then("更新應該失敗", function () {
  expect(lastError).to.not.be.null;
});

Then("專案狀態應該是 {string}", function (expectedStatus: string) {
  // Find the first project (usually the one we just created or updated)
  const project = Array.from(projects.values())[0];
  if (!project) {
    throw new Error("No project found");
  }
  expect(project.status).to.equal(expectedStatus);
});