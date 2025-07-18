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
      | name   | 更新後的專案名稱     |
      | description | 更新後的專案描述   |
      | status | completed            |
    Then 專案應該被成功更新
    And 專案名稱應該是 "更新後的專案名稱"
    And 專案狀態應該是 "completed"
