import { DataTable, Given, Then, When } from "@cucumber/cucumber";
import { expect } from "chai";
import request from "supertest";
import app from "../../src/app";

// 共享測試狀態
export let response: request.Response;
export let createdTaskId: string;

// 新增清理專案數據的功能
Given("清理測試數據", function () {
  // 清理任務數據
  const TaskService = require("../../src/services/TaskService").TaskService;
  TaskService.clearAll();

  // 清理專案數據
  const ProjectService = require("../../src/services/ProjectService").ProjectService;
  ProjectService.clearAll();

  console.log("🧹 API測試數據已清理");
});

Given("API 伺服器正在運行", function () {
  // 這個步驟只是標記，實際上 supertest 不需要伺服器運行
  console.log("📡 API 伺服器準備就緒");
});

// 建立測試前需要的任務
export const setupTask = async (title: string = "測試任務", description: string = "測試描述") => {
  const createResponse = await request(app).post("/api/tasks").send({
    title,
    description,
    projectId: "proj1",
    creatorId: "user1",
  });

  if (createResponse.status !== 201) {
    throw new Error(`建立測試任務失敗: ${createResponse.status}`);
  }

  createdTaskId = createResponse.body.data.id;
  return createdTaskId;
};

// 共享的 Given 步驟
Given("我已經建立了測試任務", async function () {
  // 建立多個測試任務
  await setupTask("測試任務1", "第一個測試任務");
  await setupTask("測試任務2", "第二個測試任務");
});

// 共享的 When 步驟 - GET 請求
When("我發送 GET 請求到 {string}", async function (endpoint: string) {
  try {
    response = await request(app).get(endpoint);
    this.response = response; // 同時設置到 World context
    console.log(`GET ${endpoint} - Status: ${response.status}`);
  } catch (error) {
    console.error(`GET 請求失敗: ${error}`);
    throw error;
  }
});

// 共享的 When 步驟 - PUT 請求
When("我發送 PUT 請求到 {string} 包含：", async function (endpoint: string, dataTable: DataTable) {
  const data = dataTable.hashes()[0];

  // 如果端點包含 task1，先建立任務並替換 ID
  if (endpoint.includes("task1")) {
    const taskId = await setupTask("待更新任務", "這個任務將被更新");
    endpoint = endpoint.replace("task1", taskId);
  }

  try {
    response = await request(app).put(endpoint).send(data);
    console.log(`PUT ${endpoint} - Status: ${response.status}`);
  } catch (error) {
    console.error(`PUT 請求失敗: ${error}`);
    throw error;
  }
});

// 共享的 When 步驟 - DELETE 請求
When("我發送 DELETE 請求到 {string} 包含：", async function (endpoint: string, dataTable: DataTable) {
  const data = dataTable.hashes()[0];

  // 如果端點包含 task1，先建立任務並替換 ID
  if (endpoint.includes("task1")) {
    const taskId = await setupTask("待刪除任務", "這個任務將被刪除");
    endpoint = endpoint.replace("task1", taskId);
  }

  try {
    // 將查詢參數添加到 URL 中
    const queryParams = new URLSearchParams(data).toString();
    const finalEndpoint = `${endpoint}?${queryParams}`;

    response = await request(app).delete(finalEndpoint);
    console.log(`DELETE ${finalEndpoint} - Status: ${response.status}`);
  } catch (error) {
    console.error(`DELETE 請求失敗: ${error}`);
    throw error;
  }
});

// 共享的 Then 步驟 - 狀態碼檢查
Then("回應狀態碼應該是 {int}", function (expectedStatus: number) {
  const currentResponse = this.response || response;
  expect(currentResponse.status).to.equal(expectedStatus);
});

// 共享的 Then 步驟 - 回應內容檢查
Then("回應應該包含 {string}: {string}", function (key: string, value: string) {
  const currentResponse = this.response || response;
  // 處理嵌套路徑，如 data.title
  if (key.includes(".")) {
    const keys = key.split(".");
    let current = currentResponse.body;
    console.log("current", current);
    for (const k of keys) {
      if (current === undefined || current === null) {
        throw new Error(`路徑 ${keys.slice(0, keys.indexOf(k) + 1).join(".")} 不存在，完整路徑: ${key}`);
      }
      current = current[k];
    }
    expect(current).to.equal(value);
  } else {
    expect(currentResponse.body).to.have.property(key);
    expect(currentResponse.body[key].toString()).to.equal(value);
  }
});

Then("回應應該包含 {string}: {int}", function (key: string, value: number) {
  const currentResponse = this.response || response;
  // 處理嵌套路徑，如 data.count
  if (key.includes(".")) {
    const keys = key.split(".");
    let current = currentResponse.body;
    for (const k of keys) {
      current = current[k];
    }
    expect(current).to.equal(value);
  } else {
    expect(currentResponse.body).to.have.property(key);
    expect(currentResponse.body[key]).to.equal(value);
  }
});

Then("回應應該包含 {string}: true", function (key: string) {
  const currentResponse = this.response || response;
  expect(currentResponse.body).to.have.property(key);
  expect(currentResponse.body[key]).to.be.true;
});

// 新增的查詢專用 Then 步驟
Then("回應應該包含任務列表", function () {
  expect(response.body).to.have.property("data");
  expect(response.body.data).to.have.property("tasks");
  expect(response.body.data.tasks).to.be.an("array");
  expect(response.body.data.tasks.length).to.be.greaterThan(0);
});

// POST 請求步驟 - 支持複雜的JSON請求體
When("我發送 POST 請求到 {string} 包含：", async function (endpoint: string, dataTable: DataTable) {
  const data = dataTable.hashes()[0];

  try {
    response = await request(app).post(endpoint).send(data);
    console.log(`POST ${endpoint} - Status: ${response.status}`);
  } catch (error) {
    console.error(`POST 請求失敗: ${error}`);
    throw error;
  }
});

// 新增缺少的步驟定義
Then("回應內容應該包含錯誤訊息 {string}", function (expectedMessage: string) {
  const currentResponse = this.response || response;
  expect(currentResponse.body).to.have.property("message");
  expect(currentResponse.body.message).to.equal(expectedMessage);
});

// 共享的步驟定義 - 建立測試任務
export let testTasks: string[] = [];
export let testTaskIdMap: { [key: string]: string } = {};

// 狀態映射函數
function mapStatusToEnglish(chineseStatus: string): string {
  const statusMap: { [key: string]: string } = {
    "待處理": "TODO",
    "進行中": "in_progress", 
    "已完成": "completed",
    "已取消": "cancelled"
  };
  return statusMap[chineseStatus] || chineseStatus;
}

// 反向映射 - 查詢時使用
function mapStatusToChinese(englishStatus: string): string {
  const statusMap: { [key: string]: string } = {
    "TODO": "待處理",
    "in_progress": "進行中",
    "completed": "已完成", 
    "cancelled": "已取消"
  };
  return statusMap[englishStatus] || englishStatus;
}

// 優先級映射函數
function mapPriorityToEnglish(chinesePriority: string): string {
  const priorityMap: { [key: string]: string } = {
    "高": "high",
    "中": "medium",
    "低": "low"
  };
  return priorityMap[chinesePriority] || chinesePriority;
}

Given("使用者 {string} 有以下任務：", async function (userId: string, dataTable: any) {
  const tasks = dataTable.hashes();
  testTasks = [];
  testTaskIdMap = {};

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    const createResponse = await request(app)
      .post("/api/tasks")
      .send({
        title: task["標題"],
        description: task["描述"] || "測試描述",
        projectId: task["專案ID"] || "proj1",
        creatorId: userId,
        status: task["狀態"] ? mapStatusToEnglish(task["狀態"]) : "TODO",
        priority: task["優先級"] ? mapPriorityToEnglish(task["優先級"]) : "medium"
      });

    if (createResponse.status === 201) {
      const realTaskId = createResponse.body.data.id;
      testTasks.push(realTaskId);
      
      // 如果有任務ID欄位，建立映射
      if (task["任務ID"]) {
        testTaskIdMap[task["任務ID"]] = realTaskId;
      } else {
        // 預設映射 task1, task2, task3...
        testTaskIdMap[`task${i + 1}`] = realTaskId;
      }
    }
  }
  console.log("建立的任務ID映射:", testTaskIdMap);
});

// 共享的步驟定義 - 建立單一測試任務
Given("使用者 {string} 有任務 {string}", async function (userId: string, taskId: string) {
  const createResponse = await request(app)
    .post("/api/tasks")
    .send({
      title: "測試任務",
      description: "測試描述",
      projectId: "proj1",
      creatorId: userId
    });

  if (createResponse.status === 201) {
    const realTaskId = createResponse.body.data.id;
    testTasks.push(realTaskId);
    
    // 建立映射
    testTaskIdMap[taskId] = realTaskId;
    console.log(`建立單一任務映射: ${taskId} -> ${realTaskId}`);
  }
});

// 共享的步驟定義 - 驗證回應內容
Then("回應內容應該包含：", function (dataTable: any) {
  const currentResponse = this.response || response;
  
  // 檢查是否是帶表頭的表格格式
  const rows = dataTable.hashes();
  if (rows.length > 0 && rows[0]["欄位名稱"]) {
    // 處理帶表頭的格式: | 欄位名稱 | 期望值 |
    for (const row of rows) {
      const field = row["欄位名稱"];
      const expectedValue = row["期望值"];
      validateField(currentResponse, field, expectedValue);
    }
  } else {
    // 處理 rowsHash 格式
    const expectedFields = dataTable.rowsHash();
    for (const [field, expectedValue] of Object.entries(expectedFields)) {
      validateField(currentResponse, field, expectedValue as string);
    }
  }
});

// 輔助函數 - 驗證單個欄位
function validateField(response: any, field: string, expectedValue: string) {
  const fieldPath = field.split(".");
  let actualValue = response.body;

  for (const path of fieldPath) {
    console.log(`檢查路徑: ${path}, 當前值:`, actualValue);
    if (actualValue === undefined || actualValue === null) {
      throw new Error(`路徑 ${fieldPath.slice(0, fieldPath.indexOf(path) + 1).join(".")} 不存在`);
    }
    actualValue = actualValue[path];
  }

  console.log(`最終值: ${field} =`, actualValue, `(期望: ${expectedValue})`);

  if (expectedValue === "存在") {
    expect(actualValue).to.exist;
  } else if (expectedValue === "true") {
    expect(actualValue).to.be.true;
  } else if (!isNaN(Number(expectedValue))) {
    // 特別處理 tasks.length 的情況
    if (field === "tasks.length" && actualValue !== Number(expectedValue)) {
      console.log("任務列表長度不匹配，提供詳細信息:");
      console.log("完整回應:", JSON.stringify(response.body, null, 2));
    }
    expect(actualValue).to.equal(Number(expectedValue));
  } else {
    expect(actualValue).to.exist;
    expect(actualValue.toString()).to.equal(expectedValue);
  }
}
