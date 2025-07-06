Feature: API 任務刪除功能
  作為 API 用戶
  我希望能夠刪除任務
  以便管理任務生命週期

  Scenario: 成功刪除任務
    When 我發送 DELETE 請求到 "/api/tasks/task1" 包含：
      | deletedBy |
      | user1     |
    Then 回應狀態碼應該是 200
    And 回應應該包含 "success": true
    And 回應應該包含 "message": "Task deleted successfully"

  Scenario: 拒絕無權限用戶刪除任務
    When 我發送 DELETE 請求到 "/api/tasks/task1" 包含：
      | deletedBy |
      | user2     |
    Then 回應狀態碼應該是 403
    And 回應應該包含 "error": "Permission denied"

  Scenario: 刪除不存在的任務
    When 我發送 DELETE 請求到 "/api/tasks/nonexistent" 包含：
      | deletedBy |
      | user1     |
    Then 回應狀態碼應該是 404
    And 回應應該包含 "error": "Task not found" 