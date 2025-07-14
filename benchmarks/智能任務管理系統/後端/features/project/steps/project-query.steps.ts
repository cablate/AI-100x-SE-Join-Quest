/**
 * 📦 模組：專案查詢步驟定義
 * 🕒 最後更新：2025-07-14T16:00:00+08:00
 * 🧑‍💻 作者/更新者：@CabLate
 * 🔢 版本：v1.0.0
 * 📝 摘要：專案查詢功能的 BDD 步驟定義
 */

import { Given, Then, When } from "@cucumber/cucumber";
import { expect } from "chai";
import { Project } from "../../../src/domain/Project";
import { ProjectService } from "../../../src/services/ProjectService";
import { currentUser, projects, users } from "../../shared/common.steps";

// 專案查詢服務實例
let projectService: ProjectService;
let queryResults: Project[] = [];

// 專案查詢相關步驟
Given("存在以下專案：", function (dataTable: any) {
  projectService = ProjectService.getInstance();

  const rows = dataTable.hashes();

  for (const row of rows) {
    const owner = users.get(row["擁有者"]);
    if (!owner) {
      throw new Error(`用戶 ${row["擁有者"]} 不存在`);
    }

    const project = projectService.createProject({
      name: row["名稱"],
      description: row["描述"],
      ownerId: owner.id,
    });

    // 如果需要設置特定狀態
    if (row["狀態"] && row["狀態"] !== "active") {
      const updatedProject = project.update({ status: row["狀態"] });
      // 更新 ProjectService 中的專案
      (projectService as any).projects.set(project.id, updatedProject);
      projects.set(row["名稱"], updatedProject);
    } else {
      projects.set(row["名稱"], project);
    }

    console.log(`建立專案: ${row["名稱"]}，擁有者: ${row["擁有者"]}，狀態: ${row["狀態"] || "active"}`);
  }
});

When("用戶查詢所有專案", function () {
  if (!currentUser) {
    throw new Error("沒有用戶登入");
  }
  
  projectService = ProjectService.getInstance();
  
  try {
    queryResults = projectService.getProjects();
    console.log(`查詢到 ${queryResults.length} 個專案`);
  } catch (error) {
    console.log(`查詢失敗: ${error}`);
    queryResults = [];
  }
});

When("用戶查詢擁有者為 {string} 的專案", function (ownerId: string) {
  if (!currentUser) {
    throw new Error("沒有用戶登入");
  }
  
  projectService = ProjectService.getInstance();
  
  try {
    queryResults = projectService.getProjects({ ownerId });
    console.log(`查詢到 ${queryResults.length} 個專案（擁有者: ${ownerId}）`);
  } catch (error) {
    console.log(`查詢失敗: ${error}`);
    queryResults = [];
  }
});

When("用戶查詢狀態為 {string} 的專案", function (status: string) {
  if (!currentUser) {
    throw new Error("沒有用戶登入");
  }
  
  projectService = ProjectService.getInstance();
  
  try {
    queryResults = projectService.getProjects({ status });
    console.log(`查詢到 ${queryResults.length} 個專案（狀態: ${status}）`);
  } catch (error) {
    console.log(`查詢失敗: ${error}`);
    queryResults = [];
  }
});

Then("應該返回 {int} 個專案", function (expectedCount: number) {
  expect(queryResults.length).to.equal(expectedCount);
});

Then("專案列表應該包含 {string}, {string}, {string}", function (name1: string, name2: string, name3: string) {
  const projectNames = queryResults.map((p) => p.name);

  expect(projectNames).to.include(name1);
  expect(projectNames).to.include(name2);
  expect(projectNames).to.include(name3);
});

Then("專案列表應該包含 {string}, {string}", function (name1: string, name2: string) {
  const projectNames = queryResults.map((p) => p.name);

  expect(projectNames).to.include(name1);
  expect(projectNames).to.include(name2);
});

Then("專案列表應該是空的", function () {
  expect(queryResults.length).to.equal(0);
});
