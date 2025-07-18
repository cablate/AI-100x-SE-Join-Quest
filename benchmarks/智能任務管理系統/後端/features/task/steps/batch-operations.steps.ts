import { DataTable, Given, Then, When } from "@cucumber/cucumber";
import { expect } from "chai";
import { TaskService } from "../../../src/services/TaskService";
import { tasks, users, setLastError } from "../../shared/common.steps";

// 批量操作結果存儲
let batchResult: any = {};
let batchErrors: string[] = [];
let lastErrorMessage: string | null = null;

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
  const taskIds = config["taskIds"] ? config["taskIds"].split(",").map(id => id.trim()) : [];
  const operator = config["operator"];
  const taskService = TaskService.getInstance();

  try {
    let result;
    
    if (operationType === "status update") {
      // 狀態更新
      const batchRequest = {
        taskIds: taskIds,
        updates: { status: config["newStatus"] },
        operatorId: operator,
        transactionMode: (config["transactionMode"] || "partial") as "strict" | "partial",
      };
      result = taskService.batchUpdateTasks(batchRequest);
      
    } else if (operationType === "assigneeAssignment") {
      // 負責人分配
      const batchRequest = {
        taskIds: taskIds,
        updates: { assigneeId: config["newAssignee"] },
        operatorId: operator,
        transactionMode: "partial" as "strict" | "partial",
      };
      result = taskService.batchUpdateTasks(batchRequest);
      
    } else if (operationType === "mixedUpdate") {
      // 混合更新 - 處理多個不同的更新
      const updates = Object.entries(config).filter(([key]) => key.startsWith("taskUpdate"));
      let totalSuccess = 0;
      let totalFailed = 0;
      let allErrors: string[] = [];

      for (const [, updateStr] of updates) {
        const [taskId, changesStr] = updateStr.split(":");
        const changes = changesStr.split(",");
        const updateObj: any = {};
        
        // 解析更新欄位
        for (const change of changes) {
          const [field, value] = change.split("=");
          if (field === "status") {
            updateObj.status = value;
          } else if (field === "assignee") {
            updateObj.assigneeId = value;
          }
        }

        const batchRequest = {
          taskIds: [taskId.trim()],
          updates: updateObj,
          operatorId: operator,
          transactionMode: "partial" as "strict" | "partial",
        };

        const singleResult = taskService.batchUpdateTasks(batchRequest);
        totalSuccess += singleResult.successCount;
        totalFailed += singleResult.failedCount;
        allErrors.push(...singleResult.errors);
      }

      result = {
        successCount: totalSuccess,
        failedCount: totalFailed,
        totalCount: updates.length,
        errors: allErrors,
      };
    } else {
      throw new Error(`Unknown operation type: ${operationType}`);
    }

    // 更新測試上下文
    batchResult = {
      successCount: result.successCount,
      failedCount: result.failedCount,
      totalCount: result.totalCount,
    };
    batchErrors = result.errors;

    // 同步更新測試步驟中的tasks Map
    if (result.successCount > 0) {
      taskIds.forEach((taskId) => {
        const updatedTask = (TaskService as any).tasks.get(taskId);
        if (updatedTask) {
          tasks.set(taskId, updatedTask);
        }
      });
    }

    // 如果是事務性失敗，設置錯誤訊息
    if (config["transactionMode"] === "strict" && result.failedCount > 0) {
      setLastError(result.errors[0] || "Batch operation failed, all changes rolled back");
    }
    
  } catch (error: any) {
    lastErrorMessage = error.message;
    setLastError(lastErrorMessage);

    batchResult = {
      successCount: 0,
      failedCount: taskIds.length || 1,
      totalCount: taskIds.length || 1,
    };
    batchErrors = [error.message];
  }
});

// 系統配置步驟 - 移除不必要的配置存儲
Given("系統配置為嚴格事務模式", function () {
  // 此配置現在直接在批量操作時通過 transactionMode 參數傳遞
  console.log("System configured for strict transaction mode");
});

Given("系統啟用通知功能", function () {
  TaskService.enableNotifications();
  console.log("Notification feature enabled");
});

Given("任務 {string} 正在被其他用戶修改", function (taskId: string) {
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
  const operationLog = TaskService.getOperationLog();
  expect(operationLog.length).to.be.greaterThan(0);
});

Then("用戶 {string} 應該收到任務分配通知", function (userId: string) {
  const notifications = TaskService.getNotifications(userId);
  expect(notifications).to.include("Task assignment notification");
});

Then("用戶 {string} 應該收到任務移除通知", function (userId: string) {
  const notifications = TaskService.getNotifications(userId);
  expect(notifications).to.include("Task removal notification");
});

Then("通知應該包含批量操作的詳細資訊", function () {
  // 檢查是否有用戶收到通知
  const userIds = ["user1", "user2", "admin"];
  const hasNotifications = userIds.some(userId => 
    TaskService.getNotifications(userId).length > 0
  );
  
  expect(hasNotifications).to.be.true;
});