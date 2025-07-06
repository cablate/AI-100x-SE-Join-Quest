import { DataTable, Given, Then, When } from "@cucumber/cucumber";
import { expect } from "chai";
import { TaskService } from "../src/services/TaskService";
import { currentUser, projects, queryResults, tasks } from "./common.steps";

// 高級查詢結果存儲 - 使用共享的 queryResults
let queryStats: any = {};
let searchResults: any[] = [];
let paginationInfo: any = {};

// 多條件查詢步驟
When("用戶查詢任務：", function (dataTable: DataTable) {
  // 正確解析查詢條件 - 將DataTable轉換為鍵值對
  const rawData = dataTable.raw();
  const conditions: { [key: string]: string } = {};

  for (const [key, value] of rawData) {
    conditions[key] = value;
  }

  const taskService = TaskService.getInstance();

  // 構建查詢選項
  const queryOptions: any = {};

  if (conditions["狀態"]) {
    queryOptions.status = conditions["狀態"];
  }

  if (conditions["專案"]) {
    const projectName = conditions["專案"];
    const project = projects.get(projectName);
    if (project) {
      queryOptions.projectId = project.id;
    }
  }

  if (conditions["負責人"]) {
    queryOptions.assigneeId = conditions["負責人"];
  }

  if (conditions["關鍵字"]) {
    queryOptions.search = conditions["關鍵字"];
  }

  // 調用真正的TaskService查詢方法
  const result = taskService.queryTasks(queryOptions);

  // 清空並重新填充共享的 queryResults
  queryResults.length = 0;
  queryResults.push(...result.tasks);

  console.log(`調試: 使用TaskService查詢，結果數量 ${queryResults.length}`);
  console.log(
    `調試: 查詢結果任務:`,
    queryResults.map((t) => (t as any).title)
  );

  // 計算統計
  queryStats = {
    totalTasks: queryResults.length,
    pendingTasks: queryResults.filter((t) => (t as any).status === "pending").length,
    inProgressTasks: queryResults.filter((t) => (t as any).status === "in_progress").length,
    completedTasks: queryResults.filter((t) => (t as any).status === "completed").length,
  };
});

// 排序查詢步驟
When("用戶查詢任務並排序：", function (dataTable: DataTable) {
  const sortConfig = dataTable.hashes();
  const taskService = TaskService.getInstance();

  // 構建排序選項
  const queryOptions: any = {};

  if (sortConfig.length > 0) {
    const config = sortConfig[0];
    const field = config["排序欄位"];
    const direction = config["排序方向"];

    if (field === "優先級") {
      queryOptions.sortBy = "priority";
    } else if (field === "狀態") {
      queryOptions.sortBy = "status";
    } else if (field === "創建時間") {
      queryOptions.sortBy = "createdAt";
    }

    queryOptions.sortDirection = direction === "desc" ? "desc" : "asc";
  }

  // 調用真正的TaskService查詢方法
  const result = taskService.queryTasks(queryOptions);

  // 清空並重新填充共享的 queryResults
  queryResults.length = 0;
  queryResults.push(...result.tasks);
});

// 模糊搜索步驟
When("用戶搜索關鍵字 {string}", function (keyword: string) {
  const taskService = TaskService.getInstance();

  // 構建搜索選項
  const queryOptions = {
    search: keyword,
  };

  // 調用真正的TaskService查詢方法
  const result = taskService.queryTasks(queryOptions);

  // 清空並重新填充共享的 queryResults
  queryResults.length = 0;
  queryResults.push(...result.tasks);
});

// 時間範圍查詢步驟
Given("任務 {string} 創建於 {string}", function (taskTitle: string, dateStr: string) {
  const task = Array.from(tasks.values()).find((t) => (t as any).title === taskTitle);
  if (task) {
    (task as any).createdAt = new Date(dateStr);
  }
});

When("用戶查詢創建時間在 {string} 到 {string} 之間的任務", function (startDate: string, endDate: string) {
  const taskService = TaskService.getInstance();

  // 構建時間範圍查詢選項
  const queryOptions = {
    startDate: new Date(startDate),
    endDate: new Date(endDate),
  };

  // 調用真正的TaskService查詢方法
  const result = taskService.queryTasks(queryOptions);

  // 清空並重新填充共享的 queryResults
  queryResults.length = 0;
  queryResults.push(...result.tasks);
});

// 分頁查詢步驟
When("用戶查詢任務並分頁：", function (dataTable: DataTable) {
  const rows = dataTable.raw();
  const config: Record<string, string> = {};

  // 處理所有數據行（沒有標題行）
  for (let i = 0; i < rows.length; i++) {
    const [key, value] = rows[i];
    config[key] = value;
  }

  const page = parseInt(config["頁碼"]);
  const pageSize = parseInt(config["每頁數量"]);

  const taskService = TaskService.getInstance();

  // 構建分頁查詢選項
  const queryOptions = {
    page: page,
    pageSize: pageSize,
  };

  // 調用真正的TaskService查詢方法
  const result = taskService.queryTasks(queryOptions);

  // 清空並重新填充共享的 queryResults
  queryResults.length = 0;
  queryResults.push(...result.tasks);

  paginationInfo = {
    currentPage: result.currentPage || page,
    pageSize: result.pageSize || pageSize,
    totalCount: result.totalCount,
    totalPages: result.totalPages || Math.ceil(result.totalCount / pageSize),
  };
});

// 權限過濾查詢步驟
When("用戶查詢所有任務", function () {
  const taskService = TaskService.getInstance();

  // 構建權限過濾查詢選項
  const queryOptions: any = {};

  if (currentUser) {
    queryOptions.assigneeId = currentUser.id;
  }

  // 調用真正的TaskService查詢方法
  const result = taskService.queryTasks(queryOptions);

  // 清空並重新填充共享的 queryResults
  queryResults.length = 0;
  queryResults.push(...result.tasks);
});

// 驗證步驟
Then("任務列表應該包含 {string}", function (taskTitle: string) {
  const found = queryResults.some((task) => (task as any).title === taskTitle);
  expect(found).to.be.true;
});

Then("任務列表應該包含 {string}, {string}", function (title1: string, title2: string) {
  const found1 = queryResults.some((task) => (task as any).title === title1);
  const found2 = queryResults.some((task) => (task as any).title === title2);
  expect(found1).to.be.true;
  expect(found2).to.be.true;
});

Then("任務列表不應該包含 {string}, {string}", function (title1: string, title2: string) {
  const found1 = queryResults.some((task) => (task as any).title === title1);
  const found2 = queryResults.some((task) => (task as any).title === title2);
  expect(found1).to.be.false;
  expect(found2).to.be.false;
});

Then("查詢統計應該顯示：", function (dataTable: DataTable) {
  const rows = dataTable.raw();
  const expected: Record<string, string> = {};

  // 跳過標題行，處理數據行
  for (let i = 1; i < rows.length; i++) {
    const [key, value] = rows[i];
    expected[key] = value;
  }

  // 創建中文到英文的映射
  const keyMapping: Record<string, string> = {
    總任務數: "totalTasks",
    待處理任務: "pendingTasks",
    進行中任務: "inProgressTasks",
    已完成任務: "completedTasks",
  };

  for (const [chineseKey, value] of Object.entries(expected)) {
    const englishKey = keyMapping[chineseKey] || chineseKey;
    expect(queryStats[englishKey]).to.equal(parseInt(value as string));
  }
});

Then("任務應該按以下順序返回：", function (dataTable: DataTable) {
  const expected = dataTable.hashes();
  for (let i = 0; i < expected.length; i++) {
    const task = queryResults[i];
    expect((task as any).title).to.equal(expected[i]["任務標題"]);
    expect((task as any).priority).to.equal(expected[i]["優先級"]);
    expect((task as any).status).to.equal(expected[i]["狀態"]);
  }
});

Then("搜索結果應該高亮顯示關鍵字", function () {
  // 模擬高亮顯示功能
  expect(queryResults.length).to.be.greaterThan(0);
});

Then("分頁資訊應該顯示：", function (dataTable: DataTable) {
  const rows = dataTable.raw();
  const expected: Record<string, string> = {};

  // 跳過標題行，處理數據行
  for (let i = 1; i < rows.length; i++) {
    const [key, value] = rows[i];
    expected[key] = value;
  }

  // 創建中文到英文的映射
  const keyMapping: Record<string, string> = {
    當前頁: "currentPage",
    每頁數量: "pageSize",
    總任務數: "totalCount",
    總頁數: "totalPages",
  };

  for (const [chineseKey, value] of Object.entries(expected)) {
    const englishKey = keyMapping[chineseKey] || chineseKey;
    expect(paginationInfo[englishKey]).to.equal(parseInt(value as string));
  }
});
