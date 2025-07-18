Feature: 任務刪除功能
  """
  業務規則：
  - 只有任務負責人和專案管理員可以刪除任務
  - 刪除成功後任務應該從系統中移除
  """

  Background:
    Given 系統中存在用戶 "user1"
    And 系統中存在用戶 "user2"
    And 系統中存在專案 "proj1" 由用戶 "user1" 管理
    And 系統中存在任務 "task1" 負責人為 "user1"

  Scenario: 成功刪除任務
    Given 用戶 "user1" 已登入
    When 用戶 "user1" 刪除任務 "task1"
    Then 任務應該刪除成功
    And 系統中不應該存在任務 "task1" 