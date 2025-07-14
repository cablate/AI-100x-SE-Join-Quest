import { DataTable, Given, Then, When } from "@cucumber/cucumber";
import { expect } from "chai";
import { Task } from "../../../src/domain/Task";
import { TaskService } from "../../../src/services/TaskService";
import { queryResults, taskService } from "../../shared/common.steps";

Given("系統中存在以下任務：", function (dataTable: DataTable) {
  const taskData = dataTable.hashes();

  taskData.forEach((row) => {
    const task = new Task(row["任務ID"], row["標題"], "系統生成的描述", row["專案ID"], row["負責人"]);

    // 將任務添加到 TaskService 中
    (TaskService as any).tasks.set(row["任務ID"], task);
    console.log(`系統添加任務: ${row["任務ID"]} - ${row["標題"]}`);
  });
});

When("用戶 {string} 查詢任務列表", function (userId: string) {
  try {
    const results = taskService.getTasks(userId);

    // 清空並重新填充 queryResults
    queryResults.length = 0;
    queryResults.push(...results);

    console.log(`用戶 ${userId} 查詢到 ${queryResults.length} 個任務`);
  } catch (error) {
    queryResults.length = 0;
    console.log(`查詢失敗: ${error instanceof Error ? error.message : "未知錯誤"}`);
  }
});

Then("應該返回 {int} 個任務", function (expectedCount: number) {
  expect(queryResults).to.have.lengthOf(expectedCount);
});

Then("所有任務的負責人都應該是 {string}", function (expectedAssignee: string) {
  queryResults.forEach((task) => {
    expect(task.assigneeId).to.equal(expectedAssignee);
  });
});
