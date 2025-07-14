Feature: API 任務查詢功能
  作為 API 用戶
  我希望能夠查詢任務列表
  以便管理和檢視我的任務

  Scenario: 成功查詢任務列表
    Given 我已經建立了測試任務
    When 我發送 GET 請求到 "/api/tasks?userId=user1"
    Then 回應狀態碼應該是 200
    And 回應應該包含 "success": true
    And 回應應該包含 "message": "Tasks retrieved successfully"
    And 回應應該包含任務列表

  Scenario: 查詢不存在用戶的任務
    When 我發送 GET 請求到 "/api/tasks?userId=nonexistent"
    Then 回應狀態碼應該是 200
    And 回應應該包含 "data.count": 0

  Scenario: 缺少 userId 參數
    When 我發送 GET 請求到 "/api/tasks"
    Then 回應狀態碼應該是 400
    And 回應應該包含 "error": "Missing required query parameter" 