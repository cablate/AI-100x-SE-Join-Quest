Feature: 專案管理API測試
  作為API客戶端
  我想要通過REST API管理專案資訊
  以便保持專案狀態的準確性

  Background:
    Given API服務已啟動
    And 資料庫已清空
    And 存在用戶 "admin" 和 "user1"
    And 存在專案 "proj1"，擁有者為 "admin"

  Scenario: 成功更新專案資訊
    Given 用戶 "admin" 已通過API認證
    When 用戶通過API更新專案 "proj1"：
      | 名稱   | 更新後的專案名稱     |
      | 描述   | 更新後的專案描述     |
      | 狀態   | completed            |
    Then API響應狀態碼應該是 200
    And 響應應該包含更新後的專案資訊
    And 專案名稱應該是 "更新後的專案名稱"
    And 專案狀態應該是 "completed"

  @ignore
  Scenario: 權限控制 - 非擁有者無法更新
    Given 用戶 "user1" 已通過API認證
    When 用戶通過API更新專案 "proj1"：
      | 名稱   | 非法更新             |
      | 描述   | 非法更新描述         |
    Then API響應狀態碼應該是 403
    And 錯誤訊息應該是 "您沒有權限修改此專案"

  @ignore
  Scenario: 專案狀態轉換驗證
    Given 用戶 "admin" 已通過API認證
    And 專案 "proj1" 的狀態是 "completed"
    When 用戶通過API更新專案 "proj1"：
      | 狀態   | active               |
    Then API響應狀態碼應該是 400
    And 錯誤訊息應該是 "無法將已完成的專案狀態改回進行中" 