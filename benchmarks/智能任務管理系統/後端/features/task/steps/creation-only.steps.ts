import { DataTable, Then, When } from "@cucumber/cucumber";
import { expect } from "chai";
import { Task } from "../../../src/domain/Task";
import { CreateTaskRequest } from "../../../src/domain/types";
import { setLastError, taskService, tasks } from "../../shared/common.steps";

// 任務創建相關的狀態
let createdTask: Task | null = null;
let lastCreatedTaskId: string | null = null;

When("用戶 {string} 創建任務：", function (userId: string, dataTable: DataTable) {
  const taskData = dataTable.hashes()[0];
  const request: CreateTaskRequest = {
    title: taskData["title"],
    description: taskData["description"],
    projectId: taskData["projectId"],
    creatorId: userId,
  };

  try {
    createdTask = taskService.createTask(request);
    // 保存到共享的 tasks Map 中，以便其他步驟可以訪問
    if (createdTask) {
      tasks.set(createdTask.id, createdTask);
      lastCreatedTaskId = createdTask.id;
    }
    setLastError(null);
    console.log(`Creating task: ${JSON.stringify(request)}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    setLastError(errorMessage);
    createdTask = null;
    console.log(`Task creation failed: ${errorMessage}`);
  }
});

// 移除重複的步驟 - 統一使用 "用戶 {string} 創建任務：" 步驟

Then("任務應該創建成功", function () {
  expect(createdTask).to.not.be.null;
  // 錯誤檢查由共享步驟處理
});

Then("任務創建應該失敗", function () {
  expect(createdTask).to.be.null;
  // 不需要直接檢查 lastError，因為共享的步驟會處理
});

// 移除重複的步驟定義 - 使用 batch-operations.steps.ts 中更通用的版本

Then("任務負責人應該是 {string}", function (expectedAssignee: string) {
  expect(createdTask?.assigneeId).to.equal(expectedAssignee);
});

// 新增步驟：讓其他步驟可以引用最後創建的任務
Then("最後創建的任務狀態應該是 {string}", function (expectedStatus: string) {
  if (!lastCreatedTaskId) {
    throw new Error("沒有創建任務");
  }
  const task = tasks.get(lastCreatedTaskId);
  expect((task as any).status).to.equal(expectedStatus);
});
