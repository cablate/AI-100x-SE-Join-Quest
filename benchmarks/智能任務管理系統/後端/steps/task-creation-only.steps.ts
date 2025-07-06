import { DataTable, Then, When } from "@cucumber/cucumber";
import { expect } from "chai";
import { Task } from "../src/domain/Task";
import { CreateTaskRequest } from "../src/domain/types";
import { setLastError, taskService } from "./common.steps";

// 任務創建相關的狀態
let createdTask: Task | null = null;

When("用戶 {string} 創建任務：", function (userId: string, dataTable: DataTable) {
  const taskData = dataTable.hashes()[0];
  const request: CreateTaskRequest = {
    title: taskData["標題"],
    description: taskData["描述"],
    projectId: taskData["專案ID"],
    creatorId: userId,
  };

  try {
    createdTask = taskService.createTask(request);
    setLastError(null);
    console.log(`創建任務: ${JSON.stringify(request)}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "未知錯誤";
    setLastError(errorMessage);
    createdTask = null;
    console.log(`創建任務失敗: ${errorMessage}`);
  }
});

When("用戶 {string} 嘗試創建任務：", function (userId: string, dataTable: DataTable) {
  const taskData = dataTable.hashes()[0];
  const request: CreateTaskRequest = {
    title: taskData["標題"],
    description: taskData["描述"],
    projectId: taskData["專案ID"],
    creatorId: userId,
  };

  try {
    createdTask = taskService.createTask(request);
    setLastError(null);
    console.log(`嘗試創建任務: ${JSON.stringify(request)}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "未知錯誤";
    setLastError(errorMessage);
    createdTask = null;
    console.log(`創建任務失敗: ${errorMessage}`);
  }
});

Then("任務應該創建成功", function () {
  expect(createdTask).to.not.be.null;
  // 錯誤檢查由共享步驟處理
});

Then("任務創建應該失敗", function () {
  expect(createdTask).to.be.null;
  // 不需要直接檢查 lastError，因為共享的步驟會處理
});

Then("任務狀態應該是 {string}", function (expectedStatus: string) {
  expect(createdTask?.status).to.equal(expectedStatus);
});

Then("任務負責人應該是 {string}", function (expectedAssignee: string) {
  expect(createdTask?.assigneeId).to.equal(expectedAssignee);
});
