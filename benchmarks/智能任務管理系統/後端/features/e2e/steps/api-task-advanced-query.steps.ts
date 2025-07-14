import { Given, Then, When } from "@cucumber/cucumber";
import { expect } from "chai";
import request from "supertest";
import app from "../../../src/app";

let response: request.Response;

// 此步驟已移至 shared/common-api.steps.ts - "使用者 {string} 有以下任務："

When("發送 GET 請求到 {string} 使用參數：", async function (endpoint: string, dataTable: any) {
  const params = dataTable.rowsHash();
  const queryString = new URLSearchParams(params).toString();

  response = await request(app).get(`${endpoint}?${queryString}`);
  this.response = response; // 設置到 World context
  console.log(`GET ${endpoint}?${queryString} - Status: ${response.status}`);
});

When("發送 GET 請求到 {string} 不帶參數", async function (endpoint: string) {
  response = await request(app).get(endpoint);
  this.response = response; // 設置到 World context
  console.log(`GET ${endpoint} - Status: ${response.status}`);
});

// 此步驟已移至 shared/common-api.steps.ts - "回應內容應該包含："