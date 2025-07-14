import { Given, When } from "@cucumber/cucumber";
import request from "supertest";
import app from "../../../src/app";

let response: request.Response;
let testProjectId: string;

Given("我已經建立了測試專案 {string}", async function (projectName: string) {
  const createResponse = await request(app).post("/api/projects").send({
    name: projectName,
    description: "測試專案描述",
    ownerId: "admin",
  });

  if (createResponse.status === 201) {
    testProjectId = createResponse.body.data.id;
  } else {
    throw new Error(`建立測試專案失敗: ${createResponse.status}`);
  }
});

Given("API測試存在以下專案：", async function (dataTable: any) {
  const projects = dataTable.hashes();

  for (const project of projects) {
    // 先創建專案
    const createResponse = await request(app).post("/api/projects").send({
      name: project["name"],
      description: project["description"],
      ownerId: project["ownerId"],
    });

    // 如果指定了狀態且不是 active，則更新狀態
    if (project["status"] && project["status"] !== "active") {
      const projectId = createResponse.body.data.id;
      await request(app).put(`/api/projects/${projectId}`).send({
        status: project["status"],
        updatedBy: project["ownerId"],
      });
    }
  }
});

// 這個步驟與 common-api.steps.ts 中的步驟重複，所以註解掉
// When('我發送 GET 請求到 {string}', async function (endpoint: string) {
//   // 如果端點包含 {projectId}，替換為實際的專案ID
//   if (endpoint.includes('{projectId}')) {
//     endpoint = endpoint.replace('{projectId}', testProjectId);
//   }
//
//   response = await request(app).get(endpoint);
//   console.log(`GET ${endpoint} - Status: ${response.status}`);
// });

// 專案特定的 GET 請求步驟
When("我發送專案 GET 請求到 {string}", async function (endpoint: string) {
  // 如果端點包含 {projectId}，替換為實際的專案ID
  if (endpoint.includes("{projectId}")) {
    if (!testProjectId) {
      throw new Error("沒有測試專案ID可以替換");
    }
    endpoint = endpoint.replace("{projectId}", testProjectId);
  }

  response = await request(app).get(endpoint);
  this.response = response; // 設置到 World context 中
  console.log(`GET ${endpoint} - Status: ${response.status}, Body:`, JSON.stringify(response.body, null, 2));
});

When("我發送專案 PUT 請求到 {string} 包含：", async function (endpoint: string, dataTable: any) {
  const data = dataTable.hashes()[0];

  // 如果端點包含 {projectId}，替換為實際的專案ID
  if (endpoint.includes("{projectId}")) {
    endpoint = endpoint.replace("{projectId}", testProjectId);
  }

  response = await request(app).put(endpoint).send(data);
  this.response = response; // 設置到 World context 中
  console.log(`PUT ${endpoint} - Status: ${response.status}`);
});

When("我發送專案 DELETE 請求到 {string} 包含：", async function (endpoint: string, dataTable: any) {
  const data = dataTable.hashes()[0];

  // 如果端點包含 {projectId}，替換為實際的專案ID
  if (endpoint.includes("{projectId}")) {
    endpoint = endpoint.replace("{projectId}", testProjectId);
  }

  // 將查詢參數添加到 URL 中
  const queryParams = new URLSearchParams(data).toString();
  const finalEndpoint = `${endpoint}?${queryParams}`;

  response = await request(app).delete(finalEndpoint);
  this.response = response; // 設置到 World context 中
  console.log(`DELETE ${finalEndpoint} - Status: ${response.status}`);
});
