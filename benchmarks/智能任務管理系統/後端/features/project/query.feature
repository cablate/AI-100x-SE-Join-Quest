Feature: 專案查詢功能
  作為系統用戶
  我想要查詢專案列表
  以便了解系統中的所有專案

  Background:
    Given 系統已初始化
    And 存在用戶 "admin" 和 "user1"
    And 存在以下專案：
      | name      | description     | owner  | status    |
      | 專案A    | 第一個專案     | admin  | active    |
      | 專案B    | 第二個專案     | user1  | active    |
      | 專案C    | 第三個專案     | admin  | completed |

  Scenario: 成功查詢所有專案
    Given 用戶 "admin" 已登入
    When 用戶查詢所有專案
    Then 應該返回 3 個專案
    And 專案列表應該包含 "專案A", "專案B", "專案C"

  Scenario: 按擁有者篩選專案
    Given 用戶 "admin" 已登入
    When 用戶查詢擁有者為 "admin" 的專案
    Then 應該返回 2 個專案
    And 專案列表應該包含 "專案A", "專案C"
