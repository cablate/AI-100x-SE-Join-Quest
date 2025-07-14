Feature: 任務創建 API (E2E)
  """
  E2E API 測試：
  - 測試實際的 HTTP 請求和響應
  - 驗證 API 合約和錯誤處理
  - 確保 API 可以正常運行
  """

  Background:
    Given API 伺服器已啟動

  Scenario: 成功透過 API 創建任務
    When 發送 POST 請求到 "/api/tasks" 包含以下資料：
      | title | description | projectId | creatorId |
      | 實作登入功能 | 開發用戶登入API | proj1 | user1 |
    Then 響應狀態碼應該是 201
    And 響應應該包含 "success": true
    And 響應資料應該包含任務資訊：
      | field | value |
      | title | 實作登入功能 |
      | description | 開發用戶登入API |
      | projectId | proj1 |
      | creatorId | user1 |
      | assigneeId | user1 |
      | status | TODO |

  Scenario: API 拒絕缺少必填欄位的請求
    When 發送 POST 請求到 "/api/tasks" 包含以下資料：
      | title | description | projectId | creatorId |
      |  | 缺少標題 | proj1 | user1 |
    Then 響應狀態碼應該是 400
    And 響應應該包含 "error": "Missing required fields"

  Scenario: 健康檢查 API
    When 發送 GET 請求到 "/health"
    Then 響應狀態碼應該是 200
    And 響應應該包含 "status": "ok" 