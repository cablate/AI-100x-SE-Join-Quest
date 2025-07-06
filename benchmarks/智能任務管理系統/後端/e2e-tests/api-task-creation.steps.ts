import { DataTable, Given, Then, When } from "@cucumber/cucumber";
import { expect } from "chai";
import request from "supertest";
import app from "../src/app";

// 測試用的資料存儲
let response: any;
let server: any;

Given("API 伺服器已啟動", function () {
  // Express app 已經在 app.ts 中設定好
  console.log("API 伺服器準備就緒");
});

When("發送 POST 請求到 {string} 包含以下資料：", async function (endpoint: string, dataTable: DataTable) {
  const data = dataTable.hashes()[0];

  console.log(`發送 POST 請求到 ${endpoint}:`, data);

  response = await request(app).post(endpoint).send(data).set("Accept", "application/json");

  console.log("響應狀態碼:", response.status);
  console.log("響應內容:", response.body);
});

When("發送 GET 請求到 {string}", async function (endpoint: string) {
  console.log(`發送 GET 請求到 ${endpoint}`);

  response = await request(app).get(endpoint).set("Accept", "application/json");

  console.log("響應狀態碼:", response.status);
  console.log("響應內容:", response.body);
});

Then("響應狀態碼應該是 {int}", function (expectedStatus: number) {
  expect(response.status).to.equal(expectedStatus);
});

Then("響應應該包含 {string}: {string}", function (key: string, value: string) {
  const expectedValue = value === "true" ? true : value === "false" ? false : value;
  expect(response.body).to.have.property(key, expectedValue);
});

Then("響應應該包含 {string}: true", function (key: string) {
  expect(response.body).to.have.property(key, true);
});

Then("響應應該包含 {string}: false", function (key: string) {
  expect(response.body).to.have.property(key, false);
});

Then("響應資料應該包含任務資訊：", function (dataTable: DataTable) {
  const expectedData = dataTable.hashes();

  expect(response.body).to.have.property("data");

  expectedData.forEach((row) => {
    const field = row.field;
    const expectedValue = row.value;

    console.log(`驗證 ${field}: ${expectedValue}`);
    expect(response.body.data).to.have.property(field);

    if (field === "createdAt" || field === "updatedAt") {
      // 日期欄位只驗證存在
      expect(response.body.data[field]).to.be.a("string");
    } else {
      expect(response.body.data[field]).to.equal(expectedValue);
    }
  });
});
