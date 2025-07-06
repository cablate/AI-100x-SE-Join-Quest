Feature: API 任務更新功能
  作為 API 用戶
  我希望能夠更新任務
  以便維護任務資訊

  Scenario: 成功更新任務
    When 我發送 PUT 請求到 "/api/tasks/task1" 包含：
      | title       | description  | updatedBy |
      | 更新後的標題 | 更新後的描述 | user1     |
    Then 回應狀態碼應該是 200
    And 回應應該包含 "success": true
    And 回應應該包含 "data.title": "更新後的標題"

  Scenario: 拒絕無權限用戶更新任務
    When 我發送 PUT 請求到 "/api/tasks/task1" 包含：
      | title    | description | updatedBy |
      | 惡意修改 | 無權限修改  | user2     |
    Then 回應狀態碼應該是 403
    And 回應應該包含 "error": "Permission denied"

  Scenario: 更新不存在的任務
    When 我發送 PUT 請求到 "/api/tasks/nonexistent" 包含：
      | title    | description | updatedBy |
      | 測試標題 | 測試描述    | user1     |
    Then 回應狀態碼應該是 404
    And 回應應該包含 "error": "Task not found" 