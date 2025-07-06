import { DataTable, Given, Then, When } from "@cucumber/cucumber";
import { expect } from "chai";
import { ProjectService } from "../src/services/ProjectService";
import { getLastError, setLastError, projects } from "./common.steps";

// 專案創建相關的步驟定義
When("用戶創建專案：", function (dataTable: DataTable) {
  const data = dataTable.hashes()[0];

  try {
    const project = ProjectService.getInstance().createProject({
      name: data["名稱"] || "",
      description: data["描述"] || "",
      ownerId: data["擁有者"] || "",
    });

    // 將創建的專案保存到測試上下文和共享Map
    this.createdProject = project;
    projects.set(project.id, project);
    setLastError(null);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "未知錯誤";
    setLastError(errorMessage);
  }
});

Then("專案應該被成功創建", function () {
  expect(this.createdProject).to.not.be.null;
  expect(this.createdProject).to.not.be.undefined;
});

// 專案狀態驗證步驟已移至 common.steps.ts 避免重複定義

Then("專案擁有者應該是 {string}", function (expectedOwner: string) {
  expect(this.createdProject.ownerId).to.equal(expectedOwner);
});

Then("創建應該失敗", function () {
  expect(getLastError()).to.not.be.null;
});

// 錯誤訊息驗證已在common.steps.ts中定義，這裡移除重複

Given("已存在名稱為 {string} 的專案", function (projectName: string) {
  // 創建一個已存在的專案
  ProjectService.getInstance().createProject({
    name: projectName,
    description: "已存在的專案",
    ownerId: "admin",
  });
});
