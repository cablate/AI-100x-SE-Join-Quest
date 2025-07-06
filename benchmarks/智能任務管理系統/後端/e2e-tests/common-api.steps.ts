import { DataTable, Given, Then, When } from "@cucumber/cucumber";
import { expect } from "chai";
import request from "supertest";
import app from "../src/app";

// 共享測試狀態
export let response: request.Response;
export let createdTaskId: string;

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
    response = await request(app).delete(endpoint).send(data);
    console.log(`DELETE ${endpoint} - Status: ${response.status}`);
  } catch (error) {
    console.error(`DELETE 請求失敗: ${error}`);
    throw error;
  }
});

// 共享的 Then 步驟 - 狀態碼檢查
Then("回應狀態碼應該是 {int}", function (expectedStatus: number) {
  expect(response.status).to.equal(expectedStatus);
});

// 共享的 Then 步驟 - 回應內容檢查
Then("回應應該包含 {string}: {string}", function (key: string, value: string) {
  // 處理嵌套路徑，如 data.title
  if (key.includes(".")) {
    const keys = key.split(".");
    let current = response.body;
    for (const k of keys) {
      current = current[k];
    }
    expect(current).to.equal(value);
  } else {
    expect(response.body).to.have.property(key);
    expect(response.body[key].toString()).to.equal(value);
  }
});

Then("回應應該包含 {string}: {int}", function (key: string, value: number) {
  // 處理嵌套路徑，如 data.count
  if (key.includes(".")) {
    const keys = key.split(".");
    let current = response.body;
    for (const k of keys) {
      current = current[k];
    }
    expect(current).to.equal(value);
  } else {
    expect(response.body).to.have.property(key);
    expect(response.body[key]).to.equal(value);
  }
});

Then("回應應該包含 {string}: true", function (key: string) {
  expect(response.body).to.have.property(key);
  expect(response.body[key]).to.be.true;
});

// 新增的查詢專用 Then 步驟
Then("回應應該包含任務列表", function () {
  expect(response.body).to.have.property("data");
  expect(response.body.data).to.have.property("tasks");
  expect(response.body.data.tasks).to.be.an("array");
  expect(response.body.data.tasks.length).to.be.greaterThan(0);
});
