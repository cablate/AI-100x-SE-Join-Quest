import { Given, Then, When } from "@cucumber/cucumber";
import { expect } from "chai";

let apiResponse: any;
let projects: any[] = [];

// 專案創建步驟
When("用戶通過API創建專案：", async function (dataTable) {
  const projectData = dataTable.hashes()[0];

  // 模擬API調用創建專案
  const newProject = {
    id: `proj_${Date.now()}`,
    name: projectData["名稱"],
    description: projectData["描述"],
    owner: projectData["擁有者"],
    status: "active",
    createdAt: new Date().toISOString(),
  };

  if (!projectData["名稱"]) {
    apiResponse = {
      statusCode: 400,
      error: "專案名稱為必填欄位",
    };
  } else if (!projectData["描述"]) {
    apiResponse = {
      statusCode: 400,
      error: "專案描述為必填欄位",
    };
  } else if (!projectData["擁有者"]) {
    apiResponse = {
      statusCode: 400,
      error: "專案擁有者為必填欄位",
    };
  } else if (projects.some((p) => p.name === projectData["名稱"])) {
    apiResponse = {
      statusCode: 409,
      error: "專案名稱已存在",
    };
  } else {
    projects.push(newProject);
    apiResponse = {
      statusCode: 201,
      data: newProject,
    };
  }
});

Given("已通過API創建名稱為 {string} 的專案", function (projectName) {
  const existingProject = {
    id: `proj_existing_${Date.now()}`,
    name: projectName,
    description: "已存在的專案",
    owner: "admin",
    status: "active",
    createdAt: new Date().toISOString(),
  };
  projects.push(existingProject);
});

// 專案管理步驟
When("用戶通過API更新專案 {string}：", async function (projectId, dataTable) {
  const updateData = dataTable.hashes()[0];
  const project = projects.find((p) => p.id === projectId);

  if (!project) {
    apiResponse = {
      statusCode: 404,
      error: "專案不存在",
    };
    return;
  }

  // 權限檢查（簡化版）
  if (project.owner !== "admin" && updateData["操作者"] !== project.owner) {
    apiResponse = {
      statusCode: 403,
      error: "您沒有權限修改此專案",
    };
    return;
  }

  // 狀態轉換驗證
  if (project.status === "completed" && updateData["狀態"] === "active") {
    apiResponse = {
      statusCode: 400,
      error: "無法將已完成的專案狀態改回進行中",
    };
    return;
  }

  // 更新專案
  if (updateData["名稱"]) project.name = updateData["名稱"];
  if (updateData["描述"]) project.description = updateData["描述"];
  if (updateData["狀態"]) project.status = updateData["狀態"];

  apiResponse = {
    statusCode: 200,
    data: project,
  };
});

// 專案查詢步驟
When("用戶通過API查詢所有專案", async function () {
  apiResponse = {
    statusCode: 200,
    data: projects,
  };
});

When("用戶通過API查詢擁有者為 {string} 的專案", async function (owner) {
  const filteredProjects = projects.filter((p) => p.owner === owner);
  apiResponse = {
    statusCode: 200,
    data: filteredProjects,
  };
});

When("用戶通過API查詢狀態為 {string} 的專案", async function (status) {
  const filteredProjects = projects.filter((p) => p.status === status);
  apiResponse = {
    statusCode: 200,
    data: filteredProjects,
  };
});

// 通用API驗證步驟
Then("API響應狀態碼應該是 {int}", function (expectedStatusCode) {
  expect(apiResponse.statusCode).to.equal(expectedStatusCode);
});

Then("響應應該包含專案資訊", function () {
  expect(apiResponse.data).to.exist;
  expect(apiResponse.data).to.have.property("id");
  expect(apiResponse.data).to.have.property("name");
});

Then("響應應該包含更新後的專案資訊", function () {
  expect(apiResponse.data).to.exist;
  expect(apiResponse.data).to.have.property("id");
  expect(apiResponse.data).to.have.property("name");
});

Then("專案狀態應該是 {string}", function (expectedStatus) {
  expect(apiResponse.data.status).to.equal(expectedStatus);
});

Then("專案擁有者應該是 {string}", function (expectedOwner) {
  expect(apiResponse.data.owner).to.equal(expectedOwner);
});

Then("專案名稱應該是 {string}", function (expectedName) {
  expect(apiResponse.data.name).to.equal(expectedName);
});

Then("應該返回 {int} 個專案", function (expectedCount) {
  expect(apiResponse.data).to.be.an("array");
  expect(apiResponse.data.length).to.equal(expectedCount);
});

Then("專案列表應該包含 {string}", function (projectNames: string) {
  const names = projectNames.split(", ").map((name: string) => name.replace(/"/g, ""));
  const actualNames = apiResponse.data.map((p: any) => p.name);

  names.forEach((name: string) => {
    expect(actualNames).to.include(name);
  });
});

Then("專案列表應該是空的", function () {
  expect(apiResponse.data).to.be.an("array");
  expect(apiResponse.data.length).to.equal(0);
});

Then("錯誤訊息應該是 {string}", function (expectedError) {
  expect(apiResponse.error).to.equal(expectedError);
});

// 背景步驟
Given("存在專案 {string}，擁有者為 {string}", function (projectId, owner) {
  const project = {
    id: projectId,
    name: `專案-${projectId}`,
    description: `專案描述-${projectId}`,
    owner: owner,
    status: "active",
    createdAt: new Date().toISOString(),
  };
  projects.push(project);
});

Given("存在以下專案：", function (dataTable: any) {
  const projectsData = dataTable.hashes();

  projectsData.forEach((projectData: any) => {
    const project = {
      id: `proj_${Date.now()}_${Math.random()}`,
      name: projectData["名稱"],
      description: projectData["描述"],
      owner: projectData["擁有者"],
      status: projectData["狀態"],
      createdAt: new Date().toISOString(),
    };
    projects.push(project);
  });
});

Given("專案 {string} 的狀態是 {string}", function (projectId, status) {
  const project = projects.find((p) => p.id === projectId);
  if (project) {
    project.status = status;
  }
});

// 清理步驟
Given("資料庫已清空", function () {
  projects = [];
  apiResponse = null;
});
