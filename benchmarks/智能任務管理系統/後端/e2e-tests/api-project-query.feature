Feature: 專案查詢API測試
  作為API客戶端
  我想要通過REST API查詢專案列表
  以便了解系統中的所有專案

  Background:
    Given API服務已啟動
    And 資料庫已清空
    And 存在用戶 "admin" 和 "user1"
    And 存在以下專案：
      | 名稱     | 描述           | 擁有者 | 狀態      |
      | 專案A    | 第一個專案     | admin  | active    |
      | 專案B    | 第二個專案     | user1  | active    |
      | 專案C    | 第三個專案     | admin  | completed |

  Scenario: 成功查詢所有專案
    Given 用戶 "admin" 已通過API認證
    When 用戶通過API查詢所有專案
    Then API響應狀態碼應該是 200
    And 應該返回 3 個專案
    And 專案列表應該包含 "專案A", "專案B", "專案C"

  Scenario: 按擁有者篩選專案
    Given 用戶 "admin" 已通過API認證
    When 用戶通過API查詢擁有者為 "admin" 的專案
    Then API響應狀態碼應該是 200
    And 應該返回 2 個專案
    And 專案列表應該包含 "專案A", "專案C"

  @ignore
  Scenario: 按狀態篩選專案
    Given 用戶 "admin" 已通過API認證
    When 用戶通過API查詢狀態為 "active" 的專案
    Then API響應狀態碼應該是 200
    And 應該返回 2 個專案
    And 專案列表應該包含 "專案A", "專案B"

  @ignore
  Scenario: 空查詢結果
    Given 用戶 "admin" 已通過API認證
    When 用戶通過API查詢擁有者為 "nonexistent" 的專案
    Then API響應狀態碼應該是 200
    And 應該返回 0 個專案
    And 專案列表應該是空的 