import { Then } from "@cucumber/cucumber";
import { expect } from "chai";
import request from "supertest";
import { response } from "./common-api.steps";

// 共享測試狀態
let queryResponse: request.Response;

// 這個步驟定義被移動到 common-api.steps.ts 以避免重複

// 驗證任務查詢結果
Then("回應應該包含任務查詢結果", function () {
  expect(response.body).to.have.property("data");
  expect(response.body.data).to.have.property("tasks");
  expect(response.body.data.tasks).to.be.an("array");

  // 檢查查詢結果結構
  if (response.body.data.tasks.length > 0) {
    const task = response.body.data.tasks[0];
    expect(task).to.have.property("id");
    expect(task).to.have.property("title");
    expect(task).to.have.property("description");
    expect(task).to.have.property("status");
  }
});

// 驗證分頁查詢結果
Then("回應應該包含分頁查詢結果", function () {
  expect(response.body).to.have.property("data");
  expect(response.body.data).to.have.property("tasks");
  expect(response.body.data).to.have.property("currentPage");
  expect(response.body.data).to.have.property("pageSize");
  expect(response.body.data).to.have.property("totalCount");
  expect(response.body.data).to.have.property("totalPages");

  expect(response.body.data.tasks).to.be.an("array");
  expect(response.body.data.currentPage).to.be.a("number");
  expect(response.body.data.pageSize).to.be.a("number");
  expect(response.body.data.totalCount).to.be.a("number");
  expect(response.body.data.totalPages).to.be.a("number");
});

// 驗證排序結果
Then("回應應該包含排序後的任務列表", function () {
  expect(response.body).to.have.property("data");
  expect(response.body.data).to.have.property("tasks");
  expect(response.body.data.tasks).to.be.an("array");

  // 檢查任務是否按指定順序排列
  if (response.body.data.tasks.length > 1) {
    const tasks = response.body.data.tasks;
    // 這裡可以添加具體的排序驗證邏輯
    expect(tasks[0]).to.have.property("priority");
  }
});

// 驗證搜索結果
Then("回應應該包含搜索結果", function () {
  expect(response.body).to.have.property("data");
  expect(response.body.data).to.have.property("tasks");
  expect(response.body.data.tasks).to.be.an("array");

  // 檢查搜索結果是否包含關鍵字
  if (response.body.data.tasks.length > 0) {
    const tasks = response.body.data.tasks;
    const hasKeyword = tasks.some((task: any) => task.title.includes("測試") || task.description.includes("測試"));
    expect(hasKeyword).to.be.true;
  }
});

// 驗證過濾結果
Then("回應應該包含過濾後的任務列表", function () {
  expect(response.body).to.have.property("data");
  expect(response.body.data).to.have.property("tasks");
  expect(response.body.data.tasks).to.be.an("array");

  // 檢查過濾條件是否生效
  if (response.body.data.tasks.length > 0) {
    const tasks = response.body.data.tasks;
    // 這裡可以添加具體的過濾驗證邏輯
    expect(tasks[0]).to.have.property("status");
  }
});
