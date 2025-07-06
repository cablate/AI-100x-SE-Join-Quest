Feature: 任務查詢功能
  """
  業務規則：
  - 用戶可以查詢自己負責的任務
  - 查詢結果應該包含任務基本資訊
  - 權限控制：只能查詢有權限的任務
  """

  Background:
    Given 系統中存在用戶 "user1" 和 "user2"
    And 系統中存在專案 "proj1" 由用戶 "user1" 管理
    And 系統中存在以下任務：
      | 任務ID | 標題 | 負責人 | 專案ID |
      | task1 | 任務1 | user1 | proj1 |
      | task2 | 任務2 | user1 | proj1 |

  @ignore
  Scenario: 成功查詢任務列表
    Given 用戶 "user1" 已登入系統
    When 用戶 "user1" 查詢任務列表
    Then 應該返回 2 個任務
    And 所有任務的負責人都應該是 "user1" 