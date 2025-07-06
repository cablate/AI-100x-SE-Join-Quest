Feature: 任務驗證功能
  """
  業務規則：
  - 任務標題、描述、專案ID 為必填欄位
  - 驗證失敗時返回明確錯誤訊息
  """

  Background:
    Given 系統中存在用戶 "user1"
    And 系統中存在專案 "proj1" 由用戶 "user1" 管理
    And 用戶 "user1" 有權限存取專案 "proj1"
    And 用戶 "user1" 已登入系統

  Scenario Outline: 驗證必填欄位
    When 用戶 "user1" 嘗試創建任務：
      | 標題 | 描述 | 專案ID |
      | <title> | <desc> | <project> |
    Then 任務創建應該失敗
    And 錯誤訊息應該是 "<error>"

    Examples:
      | title | desc | project | error |
      |       | 描述 | proj1   | 標題為必填欄位 |
      | 標題  |      | proj1   | 描述為必填欄位 |
      | 標題  | 描述 |         | 專案ID為必填欄位 | 