Feature: 高級任務查詢 API 測試
  """
  測試 GET /api/tasks/query 端點的高級查詢功能
  """

  Background:
    Given API 伺服器正在運行
    And 清理測試數據

  Scenario: 成功查詢任務並返回統計資料
    Given 使用者 "user1" 有以下任務：
      | 標題      | 狀態    | 優先級 | 專案ID |
      | 任務1     | 待處理  | 高     | proj1  |
      | 任務2     | 進行中  | 中     | proj1  |
      | 任務3     | 已完成  | 低     | proj2  |
    When 發送 GET 請求到 "/api/tasks/query" 使用參數：
      | userId   | user1    |
      | status   | 待處理   |
      | priority | 高       |
    Then 回應狀態碼應該是 200
    And 回應內容應該包含：
      | 欄位名稱           | 期望值 |
      | tasks.length       | 1      |
      | statistics.total   | 1      |

  Scenario: 查詢不存在的使用者任務
    When 發送 GET 請求到 "/api/tasks/query" 使用參數：
      | userId | nonexistent |
    Then 回應狀態碼應該是 200
    And 回應內容應該包含：
      | 欄位名稱      | 期望值 |
      | tasks.length  | 0      |

  Scenario: 缺少必要參數
    When 發送 GET 請求到 "/api/tasks/query" 不帶參數
    Then 回應狀態碼應該是 400
    And 回應內容應該包含錯誤訊息 "使用者ID為必填參數"