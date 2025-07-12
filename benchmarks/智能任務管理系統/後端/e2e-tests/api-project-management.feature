Feature: 專案管理 API 測試
  """
  測試 PUT /api/projects/{projectId} 和 DELETE /api/projects/{projectId} 端點的管理功能
  """

  Background:
    Given API 伺服器正在運行
    And 清理測試數據

  Scenario: 成功更新專案
    Given 我已經建立了測試專案 "待更新專案"
    When 我發送專案 PUT 請求到 "/api/projects/{projectId}" 包含：
      | name     | description      | updatedBy |
      | 更新專案 | 這是更新的專案   | admin     |
    Then 回應狀態碼應該是 200
    And 回應應該包含 "success": true
    And 回應應該包含 "data.name": "更新專案"

  Scenario: 更新專案狀態
    Given 我已經建立了測試專案 "狀態測試專案"
    When 我發送專案 PUT 請求到 "/api/projects/{projectId}" 包含：
      | status    | updatedBy |
      | completed | admin     |
    Then 回應狀態碼應該是 200
    And 回應應該包含 "data.status": "completed"

  Scenario: 權限不足的更新操作
    Given 我已經建立了測試專案 "權限測試專案"
    When 我發送專案 PUT 請求到 "/api/projects/{projectId}" 包含：
      | name     | updatedBy |
      | 無權更新 | user1     |
    Then 回應狀態碼應該是 403
    And 回應應該包含 "message": "您沒有權限修改此專案"

  Scenario: 更新不存在的專案
    When 我發送專案 PUT 請求到 "/api/projects/nonexistent" 包含：
      | name     | updatedBy |
      | 不存在   | admin     |
    Then 回應狀態碼應該是 404
    And 回應應該包含 "message": "專案不存在"

  Scenario: 成功刪除專案
    Given 我已經建立了測試專案 "待刪除專案"
    When 我發送專案 DELETE 請求到 "/api/projects/{projectId}" 包含：
      | deletedBy |
      | admin     |
    Then 回應狀態碼應該是 200
    And 回應應該包含 "success": true
    And 回應應該包含 "data.deleted": true

  Scenario: 權限不足的刪除操作
    Given 我已經建立了測試專案 "權限刪除測試"
    When 我發送專案 DELETE 請求到 "/api/projects/{projectId}" 包含：
      | deletedBy |
      | user1     |
    Then 回應狀態碼應該是 403
    And 回應應該包含 "message": "您沒有權限刪除此專案"

  Scenario: 刪除不存在的專案
    When 我發送專案 DELETE 請求到 "/api/projects/nonexistent" 包含：
      | deletedBy |
      | admin     |
    Then 回應狀態碼應該是 404
    And 回應應該包含 "message": "專案不存在"