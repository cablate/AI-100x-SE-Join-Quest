Feature: 任務批量操作 API E2E 測試
  作為API用戶
  我想要使用批量操作API
  以便能夠同時更新多個任務

  Background:
    Given 我已經建立了多個測試任務

  Scenario: 批量更新任務狀態
    When 我發送 POST 請求到 "/api/tasks/batch" 包含：
      | taskIds          | updates                | operatorId | transactionMode |
      | ["task1","task2"] | {"status":"completed"} | admin      | partial         |
    Then 回應狀態碼應該是 200
    And 回應應該包含 "success": true
    And 回應應該包含 "message": "Batch update completed"
    And 回應應該包含批量操作結果

  Scenario: 批量分配負責人
    When 我發送 POST 請求到 "/api/tasks/batch" 包含：
      | taskIds          | updates                   | operatorId | transactionMode |
      | ["task1","task2"] | {"assigneeId":"user2"}    | admin      | partial         |
    Then 回應狀態碼應該是 200
    And 回應應該包含 "success": true
    And 回應應該包含批量操作結果

  Scenario: 批量混合更新
    When 我發送 POST 請求到 "/api/tasks/batch" 包含：
      | taskIds          | updates                                      | operatorId | transactionMode |
      | ["task1","task2"] | {"status":"in_progress","assigneeId":"user2"} | admin      | partial         |
    Then 回應狀態碼應該是 200
    And 回應應該包含 "success": true
    And 回應應該包含批量操作結果

  Scenario: 嚴格事務模式批量操作
    When 我發送 POST 請求到 "/api/tasks/batch" 包含：
      | taskIds              | updates                | operatorId | transactionMode |
      | ["task1","invalid"]  | {"status":"completed"} | admin      | strict          |
    Then 回應狀態碼應該是 200
    And 回應應該包含 "success": true
    And 回應應該包含批量操作失敗結果

  Scenario: 批量操作參數驗證 - 缺少taskIds
    When 我發送 POST 請求到 "/api/tasks/batch" 包含：
      | updates                | operatorId |
      | {"status":"completed"} | admin      |
    Then 回應狀態碼應該是 400
    And 回應應該包含 "error": "Missing required fields"

  Scenario: 批量操作參數驗證 - 缺少updates
    When 我發送 POST 請求到 "/api/tasks/batch" 包含：
      | taskIds          | operatorId |
      | ["task1","task2"] | admin      |
    Then 回應狀態碼應該是 400
    And 回應應該包含 "error": "Missing required fields"

  Scenario: 批量操作參數驗證 - 缺少operatorId
    When 我發送 POST 請求到 "/api/tasks/batch" 包含：
      | taskIds          | updates                |
      | ["task1","task2"] | {"status":"completed"} |
    Then 回應狀態碼應該是 400
    And 回應應該包含 "error": "Missing required fields" 