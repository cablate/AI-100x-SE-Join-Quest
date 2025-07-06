import { DataTable, Given, Then, When } from "@cucumber/cucumber";
import { expect } from "chai";
import request from "supertest";
import app from "../src/app";

// 共享測試狀態
let batchResponse: request.Response;
let createdTaskIds: string[] = [];

// 設置多個測試任務
Given("我已經建立了多個測試任務", async function () {
  // 建立多個測試任務用於批量操作
  const tasks = [
    {
      title: "批量測試任務1",
      description: "第一個批量測試任務",
      projectId: "proj1",
      creatorId: "user1",
      assigneeId: "user1",
      status: "pending",
      priority: "high",
    },
    {
      title: "批量測試任務2",
      description: "第二個批量測試任務",
      projectId: "proj1",
      creatorId: "user1",
      assigneeId: "user1",
      status: "pending",
      priority: "medium",
    },
    {
      title: "批量測試任務3",
      description: "第三個批量測試任務",
      projectId: "proj1",
      creatorId: "user2",
      assigneeId: "user2",
      status: "pending",
      priority: "low",
    },
  ];

  createdTaskIds = [];
  for (const task of tasks) {
    const createResponse = await request(app).post("/api/tasks").send(task);

    if (createResponse.status !== 201) {
      throw new Error(`建立測試任務失敗: ${createResponse.status} - ${JSON.stringify(createResponse.body)}`);
    }

    createdTaskIds.push(createResponse.body.data.id);
  }
});

// POST 請求步驟 - 支持JSON格式的請求體
When("我發送 POST 請求到 {string} 包含：", async function (endpoint: string, dataTable: DataTable) {
  const data = dataTable.hashes()[0];

  // 處理 JSON 字符串字段
  const requestBody: any = {};

  for (const [key, value] of Object.entries(data)) {
    if (key === "taskIds") {
      // 如果是 taskIds，替換為實際的任務ID
      if (value === '["task1","task2"]') {
        requestBody[key] = [createdTaskIds[0], createdTaskIds[1]];
      } else if (value === '["task1","invalid"]') {
        requestBody[key] = [createdTaskIds[0], "invalid"];
      } else {
        try {
          requestBody[key] = JSON.parse(value as string);
        } catch (e) {
          requestBody[key] = value;
        }
      }
    } else if (key === "updates") {
      // 解析 updates JSON
      try {
        requestBody[key] = JSON.parse(value as string);
      } catch (e) {
        requestBody[key] = value;
      }
    } else {
      requestBody[key] = value;
    }
  }

  try {
    batchResponse = await request(app).post(endpoint).send(requestBody);
    console.log(`POST ${endpoint} - Status: ${batchResponse.status}`);
    console.log(`Request body:`, JSON.stringify(requestBody, null, 2));
    console.log(`Response:`, JSON.stringify(batchResponse.body, null, 2));
  } catch (error) {
    console.error(`POST 請求失敗: ${error}`);
    throw error;
  }
});

// 驗證批量操作結果
Then("回應應該包含批量操作結果", function () {
  expect(batchResponse.body).to.have.property("data");
  expect(batchResponse.body.data).to.have.property("successCount");
  expect(batchResponse.body.data).to.have.property("failedCount");
  expect(batchResponse.body.data).to.have.property("totalCount");

  expect(batchResponse.body.data.successCount).to.be.a("number");
  expect(batchResponse.body.data.failedCount).to.be.a("number");
  expect(batchResponse.body.data.totalCount).to.be.a("number");

  // 檢查總數是否等於成功數加失敗數
  const { successCount, failedCount, totalCount } = batchResponse.body.data;
  expect(totalCount).to.equal(successCount + failedCount);
});

// 驗證批量操作失敗結果
Then("回應應該包含批量操作失敗結果", function () {
  expect(batchResponse.body).to.have.property("data");
  expect(batchResponse.body.data).to.have.property("successCount");
  expect(batchResponse.body.data).to.have.property("failedCount");
  expect(batchResponse.body.data).to.have.property("totalCount");
  expect(batchResponse.body.data).to.have.property("errors");

  expect(batchResponse.body.data.successCount).to.be.a("number");
  expect(batchResponse.body.data.failedCount).to.be.a("number");
  expect(batchResponse.body.data.totalCount).to.be.a("number");
  expect(batchResponse.body.data.errors).to.be.an("array");

  // 檢查失敗數量大於0
  expect(batchResponse.body.data.failedCount).to.be.greaterThan(0);
});

// 驗證成功的批量操作
Then("回應應該包含成功的批量操作結果", function () {
  expect(batchResponse.body).to.have.property("data");
  expect(batchResponse.body.data).to.have.property("successCount");
  expect(batchResponse.body.data).to.have.property("failedCount");

  // 檢查成功數量大於0，失敗數量為0
  expect(batchResponse.body.data.successCount).to.be.greaterThan(0);
  expect(batchResponse.body.data.failedCount).to.equal(0);
});

// 驗證部分成功的批量操作
Then("回應應該包含部分成功的批量操作結果", function () {
  expect(batchResponse.body).to.have.property("data");
  expect(batchResponse.body.data).to.have.property("successCount");
  expect(batchResponse.body.data).to.have.property("failedCount");

  // 檢查成功數量和失敗數量都大於0
  expect(batchResponse.body.data.successCount).to.be.greaterThan(0);
  expect(batchResponse.body.data.failedCount).to.be.greaterThan(0);
});

// 驗證錯誤訊息
Then("回應應該包含錯誤訊息 {string}", function (expectedError: string) {
  expect(batchResponse.body).to.have.property("data");
  expect(batchResponse.body.data).to.have.property("errors");
  expect(batchResponse.body.data.errors).to.be.an("array");

  const hasError = batchResponse.body.data.errors.some((error: string) => error.includes(expectedError));
  expect(hasError).to.be.true;
});

// 重新定義response變數以使用batchResponse
Object.defineProperty(exports, "response", {
  get: function () {
    return batchResponse;
  },
});
