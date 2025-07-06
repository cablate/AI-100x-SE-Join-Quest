Feature: 專案創建API測試
  作為API客戶端
  我想要通過REST API創建新的專案
  以便系統能夠管理專案

  Background:
    Given API服務已啟動
    And 資料庫已清空
    And 存在用戶 "admin" 和 "user1"

  Scenario: 成功創建專案
    Given 用戶 "admin" 已通過API認證
    When 用戶通過API創建專案：
      | 名稱     | 描述                 | 擁有者 |
      | 測試專案 | 這是一個測試專案     | admin  |
    Then API響應狀態碼應該是 201
    And 響應應該包含專案資訊
    And 專案狀態應該是 "active"
    And 專案擁有者應該是 "admin"

  Scenario Outline: 專案創建驗證
    Given 用戶 "admin" 已通過API認證
    When 用戶通過API創建專案：
      | 名稱   | 描述   | 擁有者   |
      | <名稱> | <描述> | <擁有者> |
    Then API響應狀態碼應該是 400
    And 錯誤訊息應該是 "<錯誤訊息>"

    Examples:
      | 名稱     | 描述     | 擁有者 | 錯誤訊息           |
      |          | 測試描述 | admin  | 專案名稱為必填欄位 |
      | 測試專案 |          | admin  | 專案描述為必填欄位 |
      | 測試專案 | 測試描述 |        | 專案擁有者為必填欄位 |

  Scenario: 重複專案名稱檢查
    Given 用戶 "admin" 已通過API認證
    And 已通過API創建名稱為 "重複專案" 的專案
    When 用戶通過API創建專案：
      | 名稱     | 描述                 | 擁有者 |
      | 重複專案 | 這是重複的專案名稱   | admin  |
    Then API響應狀態碼應該是 409
    And 錯誤訊息應該是 "專案名稱已存在" 