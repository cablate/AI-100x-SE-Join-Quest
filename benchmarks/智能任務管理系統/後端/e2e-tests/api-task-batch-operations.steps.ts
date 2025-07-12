import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import request from 'supertest';
import app from '../src/app';

let response: request.Response;
let testTaskIds: { [key: string]: string } = {};
let singleTaskId: string;

Given('使用者 {string} 有以下任務：', async function (userId: string, dataTable: any) {
  const tasks = dataTable.hashes();
  testTaskIds = {};
  
  for (const task of tasks) {
    const createResponse = await request(app)
      .post('/api/tasks')
      .send({
        title: task['標題'],
        description: '測試描述',
        projectId: 'proj1',
        creatorId: userId,
        status: task['狀態'] || '待處理'
      });
    
    if (createResponse.status === 201) {
      testTaskIds[task['任務ID']] = createResponse.body.data.id;
    }
  }
});

Given('使用者 {string} 有任務 {string}', async function (userId: string, taskId: string) {
  const createResponse = await request(app)
    .post('/api/tasks')
    .send({
      title: '測試任務',
      description: '測試描述',
      projectId: 'proj1',
      creatorId: userId
    });
  
  if (createResponse.status === 201) {
    singleTaskId = createResponse.body.data.id;
  }
});

When('發送 POST 請求到 {string} 帶有內容：', async function (endpoint: string, docString: string) {
  const requestBody = JSON.parse(docString);
  
  // 如果請求中有 taskIds，將測試數據的真實 ID 替換進去
  if (requestBody.taskIds) {
    requestBody.taskIds = requestBody.taskIds.map((taskId: string) => {
      if (taskId === 'task1' && singleTaskId) {
        return singleTaskId;
      }
      return testTaskIds[taskId] || taskId;
    });
  }
  
  response = await request(app).post(endpoint).send(requestBody);
  console.log(`POST ${endpoint} - Status: ${response.status}`);
});

Then('回應內容應該包含：', function (dataTable: any) {
  const expectedFields = dataTable.rowsHash();
  
  for (const [field, expectedValue] of Object.entries(expectedFields)) {
    const fieldPath = field.split('.');
    let actualValue = response.body;
    
    for (const path of fieldPath) {
      actualValue = actualValue[path];
    }
    
    if (expectedValue === 'true') {
      expect(actualValue).to.be.true;
    } else if (expectedValue === 'false') {
      expect(actualValue).to.be.false;
    } else {
      expect(actualValue.toString()).to.equal(expectedValue);
    }
  }
});