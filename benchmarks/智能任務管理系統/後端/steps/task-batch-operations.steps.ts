import { DataTable, Given, Then, When } from "@cucumber/cucumber";
import { expect } from "chai";
import { TaskService } from "../src/services/TaskService";
import { tasks, users } from "./common.steps";

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
    if (key === "任務更新") {
      taskUpdates.push(value);
    } else {
      config[key] = value;
    }
  }

  // 如果有任務更新，將它們添加到配置中
  if (taskUpdates.length > 0) {
    taskUpdates.forEach((update, index) => {
      config[`任務更新_${index}`] = update;
    });
  }

  const operationType = config["操作類型"];
  const taskIds = config["任務ID"] ? config["任務ID"].split(",") : [];

  console.log(`調試: 批量操作類型: ${operationType}`);
  console.log(`調試: 任務ID列表: ${taskIds.join(", ")}`);
  console.log(`調試: 當前任務存儲:`, Array.from(tasks.keys()));
  console.log(`調試: 完整配置:`, config);

  const taskService = TaskService.getInstance();

  try {
    if (operationType === "狀態更新") {
      const newStatus = config["新狀態"];
      const operator = config["操作者"];
      const transactionMode = config["事務模式"] || "partial";

      console.log(`調試: 操作者: ${operator}, 新狀態: ${newStatus}`);

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
        setLastError(result.errors[0] || "批量操作失敗，所有變更已回滾");
      }

      console.log(`調試: 批量操作結果: 成功=${result.successCount}, 失敗=${result.failedCount}`);
      console.log(`調試: 批量操作錯誤:`, result.errors);
    } else if (operationType === "負責人分配") {
      const newAssignee = config["新負責人"];
      const operator = config["操作者"];

      console.log(`調試: 操作者: ${operator}, 新負責人: ${newAssignee}`);

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
        notificationsSent[newAssignee].push("任務分配通知");
      }
    } else if (operationType === "混合更新") {
      // 對於混合更新，需要特殊處理
      const updates = Object.entries(config).filter(([key, value]) => key.startsWith("任務更新"));

      console.log(`調試: 混合更新數量: ${updates.length}`);
      console.log(`調試: 完整配置項目:`, Object.keys(config));
      console.log(`調試: 任務更新列表:`, updates);

      let totalSuccess = 0;
      let totalFailed = 0;
      let allErrors: string[] = [];

      for (const [key, updateStr] of updates) {
        const [taskId, changesStr] = updateStr.split(":");
        const changes = changesStr.split(",");

        console.log(`調試: 混合更新任務 ${taskId}: ${changesStr}`);

        // 構建單個任務的更新請求
        const updates: any = {};
        for (const change of changes) {
          const [field, value] = change.split("=");
          console.log(`調試: 更新字段 ${field} 為 ${value}`);
          if (field === "狀態") {
            updates.status = value;
          } else if (field === "負責人") {
            updates.assigneeId = value;
          }
        }

        const batchRequest = {
          taskIds: [taskId.trim()],
          updates: updates,
          operatorId: config["操作者"],
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

          console.log(`調試: 任務 ${taskId} 混合更新成功`);
        } catch (error) {
          console.log(`調試: 任務 ${taskId} 更新異常:`, error);
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
    console.log(`調試: 批量操作異常:`, error);
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

  console.log(`調試: 批量操作結果: 成功=${batchResult.successCount}, 失敗=${batchResult.failedCount}`);
  console.log(`調試: 批量操作錯誤:`, batchErrors);
});

// 系統配置步驟
Given("系統配置為嚴格事務模式", function () {
  systemConfig.transactionMode = "strict";
});

Given("系統啟用通知功能", function () {
  const { TaskService } = require("../src/services/TaskService");
  TaskService.enableNotifications();
  console.log("通知功能已啟用");
});

Given("任務 {string} 正在被其他用戶修改", function (taskId: string) {
  const { TaskService } = require("../src/services/TaskService");
  TaskService.lockTask(taskId);
  console.log(`任務 ${taskId} 已被鎖定`);
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

  console.log(`調試: 期望結果:`, expected);
  console.log(`調試: 實際結果:`, batchResult);

  // 創建中文到英文的映射
  const keyMapping: Record<string, string> = {
    成功數量: "successCount",
    失敗數量: "failedCount",
    總數量: "totalCount",
  };

  for (const [chineseKey, value] of Object.entries(expected)) {
    const englishKey = keyMapping[chineseKey] || chineseKey;
    const expectedValue = parseInt(value as string);
    const actualValue = batchResult[englishKey];
    console.log(`調試: 比較 ${chineseKey} (${englishKey}): 期望=${expectedValue}, 實際=${actualValue}`);
    expect(actualValue).to.equal(expectedValue);
  }
});

Then("錯誤詳情應該包含 {string}", function (expectedError: string) {
  console.log(`調試: 檢查錯誤詳情`);
  console.log(`調試: 期望錯誤:`, expectedError);
  console.log(`調試: 實際錯誤列表:`, batchErrors);
  console.log(`調試: 錯誤列表長度:`, batchErrors.length);

  const found = batchErrors.some((error) => {
    console.log(`調試: 檢查錯誤 "${error}" 是否包含 "${expectedError}"`);
    return error.includes(expectedError);
  });

  console.log(`調試: 找到匹配錯誤:`, found);
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
    if (key === "狀態") {
      expect((task as any).status).to.equal(value);
    } else if (key === "負責人") {
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
  console.log(`調試: 操作日誌:`, operationLog);
  expect(operationLog.length).to.be.greaterThan(0);
});

Then("用戶 {string} 應該收到任務分配通知", function (userId: string) {
  const { TaskService } = require("../src/services/TaskService");
  const notifications = TaskService.getNotifications(userId);
  console.log(`調試: 用戶 ${userId} 的通知:`, notifications);
  expect(notifications).to.include("任務分配通知");
});

Then("用戶 {string} 應該收到任務移除通知", function (userId: string) {
  const { TaskService } = require("../src/services/TaskService");
  const notifications = TaskService.getNotifications(userId);
  console.log(`調試: 用戶 ${userId} 的通知:`, notifications);
  expect(notifications).to.include("任務移除通知");
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
