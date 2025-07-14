Feature: 專案查詢 API 測試
  """
  測試 GET /api/projects 和 GET /api/projects/{projectId} 端點的查詢功能
  """

  Background:
    Given API 伺服器正在運行
    And 清理測試數據

  Scenario: 成功查詢所有專案
    Given API測試存在以下專案：
      | name   | description  | ownerId | status    |
      | 專案A  | 專案A描述    | admin   | active    |
      | 專案B  | 專案B描述    | user1   | active    |
      | 專案C  | 專案C描述    | admin   | completed |
    When 我發送 GET 請求到 "/api/projects"
    Then 回應狀態碼應該是 200
    And 回應應該包含 "success": true
    And 回應應該包含 "data.count": 3

  Scenario: 按擁有者過濾專案
    Given API測試存在以下專案：
      | name   | description  | ownerId | status    |
      | 專案A  | 專案A描述    | admin   | active    |
      | 專案B  | 專案B描述    | user1   | active    |
      | 專案C  | 專案C描述    | admin   | completed |
    When 我發送 GET 請求到 "/api/projects?ownerId=admin"
    Then 回應狀態碼應該是 200
    And 回應應該包含 "data.count": 2

  Scenario: 按狀態過濾專案
    Given API測試存在以下專案：
      | name   | description  | ownerId | status    |
      | 專案A  | 專案A描述    | admin   | active    |
      | 專案B  | 專案B描述    | user1   | active    |
      | 專案C  | 專案C描述    | admin   | completed |
    When 我發送 GET 請求到 "/api/projects?status=active"
    Then 回應狀態碼應該是 200
    And 回應應該包含 "data.count": 2

  Scenario: 取得特定專案
    Given 我已經建立了測試專案 "特定專案"
    When 我發送專案 GET 請求到 "/api/projects/{projectId}"
    Then 回應狀態碼應該是 200
    And 回應應該包含 "success": true
    And 回應應該包含 "data.name": "特定專案"

  Scenario: 查詢不存在的專案
    When 我發送專案 GET 請求到 "/api/projects/nonexistent"
    Then 回應狀態碼應該是 404
    And 回應應該包含 "message": "專案不存在"