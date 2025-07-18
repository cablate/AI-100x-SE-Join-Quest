Feature: 任務創建功能
  """
  業務規則：
  - 任務必須包含標題、描述、專案ID
  - 任務創建者自動成為負責人
  - 任務狀態初始為 TODO
  """

  Background:
    Given 系統中存在用戶 "user1"
    And 系統中存在用戶 "user2"
    And 系統中存在專案 "proj1" 由用戶 "user1" 管理
    And 用戶 "user1" 有權限存取專案 "proj1"
    And 當前日期是 2024-01-15

  Scenario: 成功創建任務
    Given 用戶 "user1" 已登入
    When 用戶 "user1" 創建任務：
      | title | description | projectId |
      | 實作登入功能 | 開發用戶登入API | proj1 |
    Then 任務應該創建成功
    And 任務狀態應該是 "TODO"
    And 任務負責人應該是 "user1" 