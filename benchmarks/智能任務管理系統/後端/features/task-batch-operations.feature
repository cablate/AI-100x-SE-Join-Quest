Feature: 批量任務操作功能
  作為專案管理員
  我想要批量操作多個任務
  以便提高任務管理的效率

  Background:
    Given 系統已初始化
    And 存在用戶 "admin", "user1", "user2"
    And 存在專案 "proj1"，擁有者為 "admin"
    And 存在以下任務：
      | ID     | 標題     | 描述       | 專案  | 創建者 | 負責人 | 狀態    |
      | task1  | 任務1    | 描述1      | proj1 | admin  | user1  | pending |
      | task2  | 任務2    | 描述2      | proj1 | admin  | user1  | pending |
      | task3  | 任務3    | 描述3      | proj1 | admin  | user2  | pending |
      | task4  | 任務4    | 描述4      | proj1 | admin  | user2  | pending |

  Scenario: 批量更新任務狀態
    Given 用戶 "admin" 已登入
    When 用戶批量操作任務：
      | 操作類型 | 狀態更新      |
      | 任務ID   | task1,task2   |
      | 新狀態   | in_progress   |
      | 操作者   | admin         |
    Then 批量操作應該成功
    And 任務 "task1" 的狀態應該是 "in_progress"
    And 任務 "task2" 的狀態應該是 "in_progress"
    And 操作結果應該顯示：
      | 項目       | 值 |
      | 成功數量   | 2  |
      | 失敗數量   | 0  |
      | 總數量     | 2  |
