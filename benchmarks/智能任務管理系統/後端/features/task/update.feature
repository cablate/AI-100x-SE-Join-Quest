Feature: 任務更新功能
  """
  業務規則：
  - 只有任務負責人和專案管理員可以修改任務
  - 更新成功後任務資料應該正確變更
  """

  Background:
    Given 系統中存在用戶 "user1"
    And 系統中存在用戶 "user2"
    And 系統中存在專案 "proj1" 由用戶 "user1" 管理
    And 系統中存在任務 "task1" 負責人為 "user1"

  Scenario: 成功更新任務
    Given 用戶 "user1" 已登入
    When 用戶 "user1" 更新任務 "task1"：
      | title | description |
      | 更新後的標題 | 更新後的描述 |
    Then 任務應該更新成功
    And 任務標題應該是 "更新後的標題"

  Scenario: 拒絕無權限用戶修改任務
    Given 用戶 "user2" 已登入
    When 用戶 "user2" 嘗試更新任務 "task1"：
      | title | description |
      | 惡意修改 | 無權限修改 |
    Then 任務更新應該失敗
    And 錯誤訊息應該是 "您沒有權限修改此任務" 