Feature: 專案創建功能
  作為系統管理員
  我想要創建新的專案
  以便組織和管理相關的任務

  Background:
    Given 系統已初始化
    And 系統中存在用戶 "admin"
    And 系統中存在用戶 "user1"

  Scenario: 成功創建專案
    Given 用戶 "admin" 已登入
    When 用戶創建專案：
      | name      | description             | owner  |
      | 測試專案 | 這是一個測試專案     | admin  |
    Then 專案應該被成功創建
    And 專案狀態應該是 "active"
    And 專案擁有者應該是 "admin"

  Scenario Outline: 專案創建驗證
    Given 用戶 "admin" 已登入
    When 用戶創建專案：
      | name    | description | owner    |
      | <name> | <description> | <owner> |
    Then 創建應該失敗
    And 錯誤訊息應該是 "<errorMessage>"

    Examples:
      | name      | description | owner  | errorMessage       |
      |          | 測試描述 | admin  | 專案名稱為必填欄位 |
      | 測試專案 |          | admin  | 專案描述為必填欄位 |
      | 測試專案 | 測試描述 |        | 專案擁有者為必填欄位 |

  Scenario: 重複專案名稱檢查
    Given 用戶 "admin" 已登入
    And 已存在名稱為 "重複專案" 的專案
    When 用戶創建專案：
      | name      | description             | owner  |
      | 重複專案 | 這是重複的專案名稱   | admin  |
    Then 創建應該失敗
    And 錯誤訊息應該是 "專案名稱已存在" 