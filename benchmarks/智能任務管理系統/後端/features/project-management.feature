Feature: 專案管理功能
  作為專案管理員
  我想要管理專案資訊
  以便保持專案狀態的準確性

  Background:
    Given 系統已初始化
    And 存在用戶 "admin" 和 "user1"
    And 存在專案 "proj1"，擁有者為 "admin"

  Scenario: 成功更新專案資訊
    Given 用戶 "admin" 已登入
    When 用戶更新專案 "proj1"：
      | 名稱   | 更新後的專案名稱     |
      | 描述   | 更新後的專案描述     |
      | 狀態   | completed            |
    Then 專案應該被成功更新
    And 專案名稱應該是 "更新後的專案名稱"
    And 專案狀態應該是 "completed"

  @ignore
  Scenario: 權限控制 - 非擁有者無法更新
    Given 用戶 "user1" 已登入
    When 用戶更新專案 "proj1"：
      | 名稱   | 非法更新             |
      | 描述   | 非法更新描述         |
    Then 更新應該失敗
    And 錯誤訊息應該是 "您沒有權限修改此專案"

  @ignore
  Scenario: 專案狀態轉換驗證
    Given 用戶 "admin" 已登入
    And 專案 "proj1" 的狀態是 "completed"
    When 用戶更新專案 "proj1"：
      | 狀態   | active               |
    Then 更新應該失敗
    And 錯誤訊息應該是 "無法將已完成的專案狀態改回進行中" 