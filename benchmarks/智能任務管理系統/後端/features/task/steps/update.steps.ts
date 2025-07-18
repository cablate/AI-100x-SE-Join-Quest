import { DataTable, Then, When } from "@cucumber/cucumber";
import { expect } from "chai";
import { Task } from "../../../src/domain/Task";
import { setLastError, taskService } from "../../shared/common.steps";

// 任務更新相關的狀態
let updatedTask: Task | null = null;

When("用戶 {string} 更新任務 {string}：", function (userId: string, taskId: string, dataTable: DataTable) {
  const updateData = dataTable.hashes()[0];

  try {
    updatedTask = taskService.updateTask(taskId, {
      title: updateData["title"],
      description: updateData["description"],
      updatedBy: userId,
    });
    setLastError(null);
    console.log(`Updating task: ${taskId} by ${userId}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    setLastError(errorMessage);
    updatedTask = null;
    console.log(`Task update failed: ${errorMessage}`);
  }
});

When("用戶 {string} 嘗試更新任務 {string}：", function (userId: string, taskId: string, dataTable: DataTable) {
  const updateData = dataTable.hashes()[0];

  try {
    updatedTask = taskService.updateTask(taskId, {
      title: updateData["title"],
      description: updateData["description"],
      updatedBy: userId,
    });
    setLastError(null);
    console.log(`Attempting to update task: ${taskId} by ${userId}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    setLastError(errorMessage);
    updatedTask = null;
    console.log(`Task update failed: ${errorMessage}`);
  }
});

Then("任務應該更新成功", function () {
  expect(updatedTask).to.not.be.null;
  // 錯誤檢查由共享步驟處理
});

Then("任務更新應該失敗", function () {
  expect(updatedTask).to.be.null;
  // 錯誤檢查由共享步驟處理
});

Then("任務標題應該是 {string}", function (expectedTitle: string) {
  expect(updatedTask?.title).to.equal(expectedTitle);
});
