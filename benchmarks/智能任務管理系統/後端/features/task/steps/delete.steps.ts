import { Then, When } from "@cucumber/cucumber";
import { expect } from "chai";
import { setLastError, taskService } from "../../shared/common.steps";

// 任務刪除相關的狀態
let deletedTaskId: string | null = null;

When("用戶 {string} 刪除任務 {string}", function (userId: string, taskId: string) {
  try {
    const isDeleted = taskService.deleteTask(taskId, userId);
    deletedTaskId = isDeleted ? taskId : null;
    setLastError(null);
    console.log(`刪除任務: ${taskId} by ${userId}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "未知錯誤";
    setLastError(errorMessage);
    deletedTaskId = null;
    console.log(`刪除任務失敗: ${errorMessage}`);
  }
});

Then("任務應該刪除成功", function () {
  expect(deletedTaskId).to.not.be.null;
  // 錯誤檢查由共享步驟處理
});

Then("系統中不應該存在任務 {string}", function (taskId: string) {
  expect(deletedTaskId).to.equal(taskId);
});
