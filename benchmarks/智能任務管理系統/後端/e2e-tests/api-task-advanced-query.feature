Feature: 任務高級查詢 API E2E 測試
  作為API用戶
  我想要使用高級查詢API
  以便能夠根據多種條件查詢任務

  Background:
    Given 我已經建立了測試任務

  Scenario: 根據狀態查詢任務
    When 我發送 GET 請求到 "/api/tasks/query?status=pending"
    Then 回應狀態碼應該是 200
    And 回應應該包含 "success": true
    And 回應應該包含 "message": "Tasks queried successfully"
    And 回應應該包含任務查詢結果

  Scenario: 根據專案ID查詢任務
    When 我發送 GET 請求到 "/api/tasks/query?projectId=proj1"
    Then 回應狀態碼應該是 200
    And 回應應該包含 "success": true
    And 回應應該包含任務查詢結果

  Scenario: 根據負責人查詢任務
    When 我發送 GET 請求到 "/api/tasks/query?assigneeId=user1"
    Then 回應狀態碼應該是 200
    And 回應應該包含 "success": true
    And 回應應該包含任務查詢結果

  Scenario: 模糊搜索任務
    When 我發送 GET 請求到 "/api/tasks/query?search=測試"
    Then 回應狀態碼應該是 200
    And 回應應該包含 "success": true
    And 回應應該包含任務查詢結果

  Scenario: 分頁查詢任務
    When 我發送 GET 請求到 "/api/tasks/query?page=1&pageSize=10"
    Then 回應狀態碼應該是 200
    And 回應應該包含 "success": true
    And 回應應該包含分頁查詢結果

  Scenario: 排序查詢任務
    When 我發送 GET 請求到 "/api/tasks/query?sortBy=priority&sortDirection=desc"
    Then 回應狀態碼應該是 200
    And 回應應該包含 "success": true
    And 回應應該包含任務查詢結果

  Scenario: 複合條件查詢任務
    When 我發送 GET 請求到 "/api/tasks/query?status=pending&projectId=proj1&page=1&pageSize=5"
    Then 回應狀態碼應該是 200
    And 回應應該包含 "success": true
    And 回應應該包含任務查詢結果 