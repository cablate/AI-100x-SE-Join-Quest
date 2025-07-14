import { Given, Then, When } from "@cucumber/cucumber";
import { expect } from "chai";
import request from "supertest";
import app from "../../../src/app";
import { testTaskIdMap } from "../../shared/common-api.steps";

let response: request.Response;

// 重複步驟已移至 shared/common-api.steps.ts:
// - "使用者 {string} 有以下任務："
// - "使用者 {string} 有任務 {string}"
// - "回應內容應該包含："

When("發送 POST 請求到 {string} 帶有內容：", async function (endpoint: string, docString: string) {
  const requestBody = JSON.parse(docString);

  // 如果請求中有 taskIds，將測試數據的真實 ID 替換進去
  if (requestBody.taskIds) {
    console.log("原始 taskIds:", requestBody.taskIds);
    console.log("可用的任務ID映射:", testTaskIdMap);
    
    requestBody.taskIds = requestBody.taskIds.map((taskId: string) => {
      const realId = testTaskIdMap[taskId];
      console.log(`映射 ${taskId} -> ${realId}`);
      return realId || taskId;
    });
    
    console.log("轉換後 taskIds:", requestBody.taskIds);
  }

  response = await request(app).post(endpoint).send(requestBody);
  this.response = response; // 設置到 World context
  console.log(`POST ${endpoint} - Status: ${response.status}`);
});