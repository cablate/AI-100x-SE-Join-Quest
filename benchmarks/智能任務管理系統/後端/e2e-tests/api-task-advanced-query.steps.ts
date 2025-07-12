import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import request from 'supertest';
import app from '../src/app';

let response: request.Response;
let testTasks: string[] = [];

Given('使用者 {string} 有以下任務：', async function (userId: string, dataTable: any) {
  const tasks = dataTable.hashes();
  testTasks = [];
  
  for (const task of tasks) {
    const createResponse = await request(app)
      .post('/api/tasks')
      .send({
        title: task['標題'],
        description: '測試描述',
        projectId: task['專案ID'] || 'proj1',
        creatorId: userId,
        status: task['狀態'],
        priority: task['優先級']
      });
    
    if (createResponse.status === 201) {
      testTasks.push(createResponse.body.data.id);
    }
  }
});

When('發送 GET 請求到 {string} 使用參數：', async function (endpoint: string, dataTable: any) {
  const params = dataTable.rowsHash();
  const queryString = new URLSearchParams(params).toString();
  
  response = await request(app).get(`${endpoint}?${queryString}`);
  console.log(`GET ${endpoint}?${queryString} - Status: ${response.status}`);
});

When('發送 GET 請求到 {string} 不帶參數', async function (endpoint: string) {
  response = await request(app).get(endpoint);
  console.log(`GET ${endpoint} - Status: ${response.status}`);
});

Then('回應內容應該包含：', function (dataTable: any) {
  const expectedFields = dataTable.rowsHash();
  
  for (const [field, expectedValue] of Object.entries(expectedFields)) {
    const fieldPath = field.split('.');
    let actualValue = response.body;
    
    for (const path of fieldPath) {
      actualValue = actualValue[path];
    }
    
    if (expectedValue === '存在') {
      expect(actualValue).to.exist;
    } else {
      expect(actualValue.toString()).to.equal(expectedValue);
    }
  }
});