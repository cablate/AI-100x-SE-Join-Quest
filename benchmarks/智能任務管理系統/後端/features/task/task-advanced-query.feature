Feature: 高級任務查詢功能
  作為系統用戶
  我想要使用高級查詢功能
  以便快速找到符合特定條件的任務

  Background:
    Given 系統已初始化
    And 存在用戶 "admin", "user1", "user2"
    And 存在以下專案：
      | 名稱     | 描述       | 擁有者 | 狀態   |
      | 前端專案 | 前端開發   | admin  | active |
      | 後端專案 | 後端開發   | admin  | active |
    And 存在以下任務：
      | 標題       | 描述           | 專案     | 創建者 | 負責人 | 狀態        | 優先級 |
      | 登入功能   | 實作登入API    | 後端專案 | admin  | user1  | in_progress | high   |
      | 註冊功能   | 實作註冊API    | 後端專案 | admin  | user2  | pending     | medium |
      | 首頁設計   | 設計首頁UI     | 前端專案 | admin  | user1  | completed   | low    |
      | 導航設計   | 設計導航UI     | 前端專案 | admin  | user2  | pending     | medium |

  Scenario: 多條件查詢 - 狀態和專案
    Given 用戶 "admin" 已登入
    When 用戶查詢任務：
      | 條件   | 值        |
      | 狀態   | pending   |
      | 專案   | 後端專案  |
    Then 應該返回 1 個任務
    And 任務列表應該包含 "註冊功能"
    And 查詢統計應該顯示：
      | 統計項目     | 值 |
      | 總任務數     | 1  |
      | 待處理任務   | 1  |
      | 進行中任務   | 0  |
      | 已完成任務   | 0  |
