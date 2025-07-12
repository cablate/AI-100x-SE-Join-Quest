Feature: 專案創建 API 測試
  """
  測試 POST /api/projects 端點的專案創建功能
  """

  Background:
    Given API 伺服器正在運行
    And 清理測試數據

  Scenario: 成功創建專案
    When 我發送 POST 請求到 "/api/projects" 包含：
      | name        | description      | ownerId |
      | 測試專案    | 這是測試專案     | admin   |
    Then 回應狀態碼應該是 201
    And 回應應該包含 "success": true
    And 回應應該包含 "data.name": "測試專案"
    And 回應應該包含 "data.ownerId": "admin"
    And 回應應該包含 "data.status": "active"

  Scenario Outline: 專案創建驗證錯誤
    When 我發送 POST 請求到 "/api/projects" 包含：
      | name   | description   | ownerId   |
      | <名稱> | <描述>        | <擁有者>  |
    Then 回應狀態碼應該是 400
    And 回應應該包含 "message": "<錯誤訊息>"

    Examples:
      | 名稱     | 描述     | 擁有者 | 錯誤訊息           |
      |          | 測試描述 | admin  | 專案名稱為必填欄位 |
      | 測試專案 |          | admin  | 專案描述為必填欄位 |
      | 測試專案 | 測試描述 |        | 專案擁有者為必填欄位 |

  Scenario: 重複專案名稱檢查
    Given 我已經建立了測試專案 "重複專案"
    When 我發送 POST 請求到 "/api/projects" 包含：
      | name     | description      | ownerId |
      | 重複專案 | 這是重複的專案   | admin   |
    Then 回應狀態碼應該是 400
    And 回應應該包含 "message": "專案名稱已存在"