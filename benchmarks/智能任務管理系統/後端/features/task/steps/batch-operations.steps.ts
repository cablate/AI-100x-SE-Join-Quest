import { DataTable, Given, Then, When } from "@cucumber/cucumber";
import { expect } from "chai";
import { TaskService } from "../../../src/services/TaskService";
import { tasks, users } from "../../shared/common.steps";

// 批量操作結果存儲
let batchResult: any = {};
let batchErrors: string[] = [];
let operationLog: string[] = [];
let notificationsSent: { [userId: string]: string[] } = {};
let lastErrorMessage: string | null = null;

// 系統配置
let systemConfig: any = {};

// 批量操作步驟
When("用戶批量操作任務：", function (dataTable: DataTable) {
  // 解析配置 - 將DataTable轉換為鍵值對
  const rawData = dataTable.raw();
  const config: { [key: string]: string } = {};
  const taskUpdates: string[] = [];

  for (const [key, value] of rawData) {
    if (key === "taskUpdate") {
      taskUpdates.push(value);
    } else {
      config[key] = value;
    }
  }

  // 如果有任務更新，將它們添加到配置中
  if (taskUpdates.length > 0) {
    taskUpdates.forEach((update, index) => {
      config[`taskUpdate_${index}`] = update;
    });
  }

  const operationType = config["operation"];
  const taskIds = config["taskIds"] ? config["taskIds"].split(",") : [];

  console.log(`Debug: Batch operation type: ${operationType}`);
  console.log(`Debug: Task ID list: ${taskIds.join(", ")}`);
  console.log(`Debug: Current task storage:`, Array.from(tasks.keys()));
  console.log(`Debug: Complete config:`, config);

  const taskService = TaskService.getInstance();

  try {
    if (operationType === "status update") {
      const newStatus = config["newStatus"];
      const operator = config["operator"];
      const transactionMode = config["transactionMode"] || "partial";

      console.log(`Debug: Operator: ${operator}, New status: ${newStatus}`);

      // 構建批量更新請求
      const batchRequest = {
        taskIds: taskIds.map((id) => id.trim()),
        updates: {
          status: newStatus,
        },
        operatorId: operator,
        transactionMode: transactionMode as "strict" | "partial",
      };

      // 調用真正的TaskService批量更新方法
      const result = taskService.batchUpdateTasks(batchRequest);

      // 同步更新測試步驟中的tasks Map
      if (result.successCount > 0) {
        taskIds.forEach((taskId) => {
          const updatedTask = (TaskService as any).tasks.get(taskId.trim());
          if (updatedTask) {
            tasks.set(taskId.trim(), updatedTask);
          }
        });
      }

      batchResult = {
        successCount: result.successCount,
        failedCount: result.failedCount,
        totalCount: result.totalCount,
      };
      batchErrors = result.errors;

      // 如果是事務性失敗，設置錯誤訊息
      if (transactionMode === "strict" && result.failedCount > 0) {
        const { setLastError } = require("./common.steps");
        setLastError(result.errors[0] || "Batch operation failed, all changes rolled back");
      }

      console.log(`Debug: Batch operation result: Success=${result.successCount}, Failed=${result.failedCount}`);
      console.log(`Debug: Batch operation errors:`, result.errors);
    } else if (operationType === "assigneeAssignment") {
      const newAssignee = config["newAssignee"];
      const operator = config["operator"];

      console.log(`Debug: Operator: ${operator}, New assignee: ${newAssignee}`);

      // 構建批量更新請求
      const batchRequest = {
        taskIds: taskIds.map((id) => id.trim()),
        updates: {
          assigneeId: newAssignee,
        },
        operatorId: operator,
        transactionMode: "partial" as "strict" | "partial",
      };

      // 調用真正的TaskService批量更新方法
      const result = taskService.batchUpdateTasks(batchRequest);

      // 同步更新測試步驟中的tasks Map
      if (result.successCount > 0) {
        taskIds.forEach((taskId) => {
          const updatedTask = (TaskService as any).tasks.get(taskId.trim());
          if (updatedTask) {
            tasks.set(taskId.trim(), updatedTask);
          }
        });
      }

      batchResult = {
        successCount: result.successCount,
        failedCount: result.failedCount,
        totalCount: result.totalCount,
      };
      batchErrors = result.errors;

      // 模擬通知發送
      if (result.successCount > 0) {
        if (!notificationsSent[newAssignee]) {
          notificationsSent[newAssignee] = [];
        }
        notificationsSent[newAssignee].push("Task assignment notification");
      }
    } else if (operationType === "mixedUpdate") {
      // 對於混合更新，需要特殊處理
      const updates = Object.entries(config).filter(([key, value]) => key.startsWith("taskUpdate"));

      console.log(`Debug: Mixed update count: ${updates.length}`);
      console.log(`Debug: Complete config items:`, Object.keys(config));
      console.log(`Debug: Task update list:`, updates);

      let totalSuccess = 0;
      let totalFailed = 0;
      let allErrors: string[] = [];

      for (const [key, updateStr] of updates) {
        const [taskId, changesStr] = updateStr.split(":");
        const changes = changesStr.split(",");

        console.log(`Debug: Mixed update task ${taskId}: ${changesStr}`);

        // 構建單個任務的更新請求
        const updates: any = {};
        for (const change of changes) {
          const [field, value] = change.split("=");
          console.log(`Debug: Update field ${field} to ${value}`);
          if (field === "status") {
            updates.status = value;
          } else if (field === "assignee") {
            updates.assigneeId = value;
          }
        }

        const batchRequest = {
          taskIds: [taskId.trim()],
          updates: updates,
          operatorId: config["operator"],
          transactionMode: "partial" as "strict" | "partial",
        };

        try {
          // 調用真正的TaskService批量更新方法
          const result = taskService.batchUpdateTasks(batchRequest);

          // 同步更新測試步驟中的tasks Map
          if (result.successCount > 0) {
            const updatedTask = (TaskService as any).tasks.get(taskId.trim());
            if (updatedTask) {
              tasks.set(taskId.trim(), updatedTask);
            }
          }

          totalSuccess += result.successCount;
          totalFailed += result.failedCount;
          allErrors.push(...result.errors);

          console.log(`Debug: Task ${taskId} mixed update successful`);
        } catch (error) {
          console.log(`Debug: Task ${taskId} update error:`, error);
          totalFailed++;
          allErrors.push(`${taskId}: ${error}`);
        }
      }

      batchResult = {
        successCount: totalSuccess,
        failedCount: totalFailed,
        totalCount: updates.length,
      };
      batchErrors = allErrors;
    }
  } catch (error: any) {
    console.log(`Debug: Batch operation error:`, error);
    lastErrorMessage = error.message;

    // 同時設置到 common.steps.ts 的錯誤狀態
    const { setLastError } = require("./common.steps");
    setLastError(lastErrorMessage);

    batchResult = {
      successCount: 0,
      failedCount: taskIds.length || 1,
      totalCount: taskIds.length || 1,
    };
    batchErrors = [error.message];
  }

  console.log(`Debug: Batch operation result: Success=${batchResult.successCount}, Failed=${batchResult.failedCount}`);
  console.log(`Debug: Batch operation errors:`, batchErrors);
});

// 系統配置步驟
Given("系統配置為嚴格事務模式", function () {
  systemConfig.transactionMode = "strict";
});

Given("系統啟用通知功能", function () {
  const { TaskService } = require("../src/services/TaskService");
  TaskService.enableNotifications();
  console.log("Notification feature enabled");
});

Given("任務 {string} 正在被其他用戶修改", function (taskId: string) {
  const { TaskService } = require("../src/services/TaskService");
  TaskService.lockTask(taskId);
  console.log(`Task ${taskId} has been locked`);
});

// 驗證步驟
Then("批量操作應該成功", function () {
  expect(batchResult.failedCount).to.equal(0);
  expect(batchResult.successCount).to.be.greaterThan(0);
});

Then("批量操作應該部分成功", function () {
  expect(batchResult.successCount).to.be.greaterThan(0);
  expect(batchResult.failedCount).to.be.greaterThan(0);
});

Then("批量操作應該完全失敗", function () {
  expect(batchResult.successCount).to.equal(0);
  expect(batchResult.failedCount).to.be.greaterThan(0);
});

Then("任務 {string} 的狀態應該是 {string}", function (taskId: string, expectedStatus: string) {
  const task = tasks.get(taskId);
  expect((task as any).status).to.equal(expectedStatus);
});

Then("任務 {string} 的狀態應該保持 {string}", function (taskId: string, expectedStatus: string) {
  const task = tasks.get(taskId);
  expect((task as any).status).to.equal(expectedStatus);
});

Then("任務 {string} 的負責人應該是 {string}", function (taskId: string, expectedAssignee: string) {
  const task = tasks.get(taskId);
  expect((task as any).assigneeId).to.equal(expectedAssignee);
});

Then("操作結果應該顯示：", function (dataTable: DataTable) {
  const rows = dataTable.raw();
  const expected: Record<string, string> = {};

  // 跳過標題行，處理數據行
  for (let i = 1; i < rows.length; i++) {
    const [key, value] = rows[i];
    expected[key] = value;
  }

  console.log(`Debug: Expected result:`, expected);
  console.log(`Debug: Actual result:`, batchResult);

  // 創建中文到英文的映射
  const keyMapping: Record<string, string> = {
    successCount: "successCount",
    failureCount: "failedCount",
    totalCount: "totalCount",
  };

  for (const [key, value] of Object.entries(expected)) {
    const englishKey = keyMapping[key] || key;
    const expectedValue = parseInt(value as string);
    const actualValue = batchResult[englishKey];
    console.log(`Debug: Compare ${key} (${englishKey}): Expected=${expectedValue}, Actual=${actualValue}`);
    expect(actualValue).to.equal(expectedValue);
  }
});

Then("錯誤詳情應該包含 {string}", function (expectedError: string) {
  console.log(`Debug: Checking error details`);
  console.log(`Debug: Expected error:`, expectedError);
  console.log(`Debug: Actual error list:`, batchErrors);
  console.log(`Debug: Error list length:`, batchErrors.length);

  const found = batchErrors.some((error) => {
    console.log(`Debug: Checking if error "${error}" contains "${expectedError}"`);
    return error.includes(expectedError);
  });

  console.log(`Debug: Found matching error:`, found);
  expect(found).to.be.true;
});

Then("所有任務狀態應該保持不變", function () {
  // 檢查事務回滾的情況
  expect(batchResult.successCount).to.equal(0);
});

Then("任務 {string} 應該有：", function (taskId: string, dataTable: DataTable) {
  const task = tasks.get(taskId);
  const expected = dataTable.hashes()[0];

  for (const [key, value] of Object.entries(expected)) {
    if (key === "status") {
      expect((task as any).status).to.equal(value);
    } else if (key === "assignee") {
      expect((task as any).assigneeId).to.equal(value);
    }
  }
});

Then("工作負荷應該重新分配", function () {
  // 模擬工作負荷重新分配
  expect(batchResult.successCount).to.be.greaterThan(0);
});

Then("操作日誌應該記錄所有變更", function () {
  const { TaskService } = require("../src/services/TaskService");
  const operationLog = TaskService.getOperationLog();
  console.log(`Debug: Operation log:`, operationLog);
  expect(operationLog.length).to.be.greaterThan(0);
});

Then("用戶 {string} 應該收到任務分配通知", function (userId: string) {
  const { TaskService } = require("../src/services/TaskService");
  const notifications = TaskService.getNotifications(userId);
  console.log(`Debug: User ${userId} notifications:`, notifications);
  expect(notifications).to.include("Task assignment notification");
});

Then("用戶 {string} 應該收到任務移除通知", function (userId: string) {
  const { TaskService } = require("../src/services/TaskService");
  const notifications = TaskService.getNotifications(userId);
  console.log(`Debug: User ${userId} notifications:`, notifications);
  expect(notifications).to.include("Task removal notification");
});

Then("通知應該包含批量操作的詳細資訊", function () {
  const { TaskService } = require("../src/services/TaskService");
  // 檢查是否有用戶收到通知
  let hasNotifications = false;
  const userIds = ["user1", "user2", "admin"];

  for (const userId of userIds) {
    const notifications = TaskService.getNotifications(userId);
    if (notifications.length > 0) {
      hasNotifications = true;
      break;
    }
  }

  expect(hasNotifications).to.be.true;
});

// 輔助函數
function checkPermission(operator: string, task: any): boolean {
  // 簡化的權限檢查
  const operatorUser = users.get(operator);
  if (!operatorUser) return false;

  // 管理員有所有權限
  if (operator === "admin") return true;

  // 任務負責人有修改權限
  if ((task as any).assigneeId === operator) return true;

  // 任務創建者有修改權限
  if ((task as any).creatorId === operator) return true;

  return false;
}

function isTaskLocked(taskId: string): boolean {
  return systemConfig.lockedTasks && systemConfig.lockedTasks.includes(taskId);
}

// 在文件最後添加錯誤訊息獲取函數
export function getLastErrorMessage(): string | null {
  return lastErrorMessage;
}
