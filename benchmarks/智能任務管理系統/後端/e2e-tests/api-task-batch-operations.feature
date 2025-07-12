Feature: 任務批量操作 API 測試
  """
  測試 POST /api/tasks/batch 端點的批量操作功能
  """

  Background:
    Given API 伺服器正在運行
    And 清理測試數據

  Scenario: 成功批量更新任務狀態
    Given 使用者 "user1" 有以下任務：
      | 任務ID | 標題   | 狀態   |
      | task1  | 任務1  | 待處理 |
      | task2  | 任務2  | 待處理 |
      | task3  | 任務3  | 進行中 |
    When 發送 POST 請求到 "/api/tasks/batch" 帶有內容：
      """
      {
        "operation": "update_status",
        "taskIds": ["task1", "task2"],
        "data": {
          "status": "進行中"
        },
        "userId": "user1"
      }
      """
    Then 回應狀態碼應該是 200
    And 回應內容應該包含：
      | 欄位名稱           | 期望值 |
      | success           | true   |
      | updatedCount      | 2      |
      | results.length    | 2      |

  Scenario: 批量刪除任務
    Given 使用者 "user1" 有以下任務：
      | 任務ID | 標題   |
      | task1  | 任務1  |
      | task2  | 任務2  |
    When 發送 POST 請求到 "/api/tasks/batch" 帶有內容：
      """
      {
        "operation": "delete",
        "taskIds": ["task1", "task2"],
        "userId": "user1"
      }
      """
    Then 回應狀態碼應該是 200
    And 回應內容應該包含：
      | 欄位名稱           | 期望值 |
      | success           | true   |
      | deletedCount      | 2      |

  Scenario: 權限不足的批量操作
    Given 使用者 "user2" 有任務 "task1"
    When 發送 POST 請求到 "/api/tasks/batch" 帶有內容：
      """
      {
        "operation": "update_status",
        "taskIds": ["task1"],
        "data": {
          "status": "已完成"
        },
        "userId": "user1"
      }
      """
    Then 回應狀態碼應該是 403
    And 回應內容應該包含錯誤訊息 "無權限操作他人任務"

  Scenario: 無效的操作類型
    When 發送 POST 請求到 "/api/tasks/batch" 帶有內容：
      """
      {
        "operation": "invalid_operation",
        "taskIds": ["task1"],
        "userId": "user1"
      }
      """
    Then 回應狀態碼應該是 400
    And 回應內容應該包含錯誤訊息 "不支援的操作類型"