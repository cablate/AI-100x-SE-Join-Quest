/**
 * 📦 模組：專案管理步驟定義
 * 🕒 最後更新：2025-07-14T15:30:00+08:00
 * 🧑‍💻 作者/更新者：@CabLate
 * 🔢 版本：v1.0.0
 * 📝 摘要：專案管理功能的 BDD 步驟定義
 */

import { Then, When } from "@cucumber/cucumber";
import { expect } from "chai";
import { ProjectService } from "../../../src/services/ProjectService";
import { currentUser, lastError, projects, setLastError } from "../../shared/common.steps";

// 專案管理服務實例
let projectService: ProjectService;
let currentProjectId: string;

// 專案更新相關步驟
When("用戶更新專案 {string}：", function (projectId: string, dataTable: any) {
  currentProjectId = projectId;
  if (!currentUser) {
    throw new Error("No user logged in");
  }

  projectService = ProjectService.getInstance();

  // 從 DataTable 中提取更新資料
  const updateData: any = {};
  const rows = dataTable.raw();

  for (let i = 0; i < rows.length; i++) {
    const [key, value] = rows[i];
    switch (key) {
      case "name":
        updateData.name = value;
        break;
      case "description":
        updateData.description = value;
        break;
      case "status":
        updateData.status = value;
        break;
    }
  }

  try {
    // 添加 updatedBy 字段
    updateData.updatedBy = currentUser.id;

    // 找到真實的專案 ID
    const existingProject = projects.get(projectId);
    if (!existingProject) {
      throw new Error(`Project ${projectId} does not exist`);
    }

    const project = projectService.updateProject(existingProject.id, updateData);
    // 更新本地 projects Map
    projects.set(projectId, project);
    projects.set(project.id, project);
    console.log(`Project ${projectId} updated successfully`);
  } catch (error) {
    setLastError(error instanceof Error ? error.message : "Unknown error");
    console.log(`Project ${projectId} update failed: ${error}`);
  }
});

Then("專案應該被成功更新", function () {
  // 如果沒有錯誤，則表示更新成功
  expect(lastError).to.be.null;
});

Then("專案名稱應該是 {string}", function (expectedName: string) {
  // 使用 currentProjectId 獲取正確的專案
  const project = projects.get(currentProjectId);
  if (!project) {
    throw new Error(`Project ${currentProjectId} does not exist`);
  }
  expect(project.name).to.equal(expectedName);
});

// 專案狀態驗證步驟已移至 common.steps.ts 避免重複定義
