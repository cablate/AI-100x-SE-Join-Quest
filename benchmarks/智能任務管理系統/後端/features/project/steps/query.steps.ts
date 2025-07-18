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
    const owner = users.get(row["owner"]);
    if (!owner) {
      throw new Error(`User ${row["owner"]} does not exist`);
    }

    const project = projectService.createProject({
      name: row["name"],
      description: row["description"],
      ownerId: owner.id,
    });

    // 如果需要設置特定狀態
    if (row["status"] && row["status"] !== "active") {
      const updatedProject = project.update({ status: row["status"] });
      // 更新 ProjectService 中的專案
      (projectService as any).projects.set(project.id, updatedProject);
      projects.set(row["name"], updatedProject);
    } else {
      projects.set(row["name"], project);
    }

    console.log(`Created project: ${row["name"]}, Owner: ${row["owner"]}, Status: ${row["status"] || "active"}`);
  }
});

When("用戶查詢所有專案", function () {
  if (!currentUser) {
    throw new Error("No user logged in");
  }
  
  projectService = ProjectService.getInstance();
  
  try {
    queryResults = projectService.getProjects();
    console.log(`Found ${queryResults.length} projects`);
  } catch (error) {
    console.log(`Query failed: ${error}`);
    queryResults = [];
  }
});

When("用戶查詢擁有者為 {string} 的專案", function (ownerId: string) {
  if (!currentUser) {
    throw new Error("No user logged in");
  }
  
  projectService = ProjectService.getInstance();
  
  try {
    queryResults = projectService.getProjects({ ownerId });
    console.log(`Found ${queryResults.length} projects (Owner: ${ownerId})`);
  } catch (error) {
    console.log(`Query failed: ${error}`);
    queryResults = [];
  }
});

When("用戶查詢狀態為 {string} 的專案", function (status: string) {
  if (!currentUser) {
    throw new Error("No user logged in");
  }
  
  projectService = ProjectService.getInstance();
  
  try {
    queryResults = projectService.getProjects({ status });
    console.log(`Found ${queryResults.length} projects (Status: ${status})`);
  } catch (error) {
    console.log(`Query failed: ${error}`);
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
