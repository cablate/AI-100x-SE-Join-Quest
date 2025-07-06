Feature: 批量任務操作功能
  作為專案管理員
  我想要批量操作多個任務
  以便提高任務管理的效率

  Background:
    Given 系統已初始化
    And 存在用戶 "admin", "user1", "user2"
    And 存在專案 "proj1"，擁有者為 "admin"
    And 存在以下任務：
      | ID     | 標題     | 描述       | 專案  | 創建者 | 負責人 | 狀態    |
      | task1  | 任務1    | 描述1      | proj1 | admin  | user1  | pending |
      | task2  | 任務2    | 描述2      | proj1 | admin  | user1  | pending |
      | task3  | 任務3    | 描述3      | proj1 | admin  | user2  | pending |
      | task4  | 任務4    | 描述4      | proj1 | admin  | user2  | pending |

  Scenario: 批量更新任務狀態
    Given 用戶 "admin" 已登入
    When 用戶批量操作任務：
      | 操作類型 | 狀態更新      |
      | 任務ID   | task1,task2   |
      | 新狀態   | in_progress   |
      | 操作者   | admin         |
    Then 批量操作應該成功
    And 任務 "task1" 的狀態應該是 "in_progress"
    And 任務 "task2" 的狀態應該是 "in_progress"
    And 操作結果應該顯示：
      | 項目       | 值 |
      | 成功數量   | 2  |
      | 失敗數量   | 0  |
      | 總數量     | 2  |

  @ignore
  Scenario: 批量分配負責人
    Given 用戶 "admin" 已登入
    When 用戶批量操作任務：
      | 操作類型 | 負責人分配    |
      | 任務ID   | task1,task3   |
      | 新負責人 | user2         |
      | 操作者   | admin         |
    Then 批量操作應該成功
    And 任務 "task1" 的負責人應該是 "user2"
    And 任務 "task3" 的負責人應該是 "user2"
    And 工作負荷應該重新分配

  @ignore
  Scenario: 部分成功的批量操作
    Given 用戶 "user1" 已登入
    When 用戶批量操作任務：
      | 操作類型 | 狀態更新        |
      | 任務ID   | task1,task3     |
      | 新狀態   | in_progress     |
      | 操作者   | user1           |
    Then 批量操作應該部分成功
    And 任務 "task1" 的狀態應該是 "in_progress"
    And 任務 "task3" 的狀態應該保持 "pending"
    And 操作結果應該顯示：
      | 項目       | 值 |
      | 成功數量   | 1  |
      | 失敗數量   | 1  |
      | 總數量     | 2  |
    And 錯誤詳情應該包含 "task3: 您沒有權限修改此任務"

  @ignore
  Scenario: 批量操作中的衝突處理
    Given 用戶 "admin" 已登入
    And 任務 "task1" 正在被其他用戶修改
    When 用戶批量操作任務：
      | 操作類型 | 狀態更新      |
      | 任務ID   | task1,task2   |
      | 新狀態   | completed     |
      | 操作者   | admin         |
    Then 批量操作應該部分成功
    And 任務 "task2" 的狀態應該是 "completed"
    And 操作結果應該顯示：
      | 項目       | 值 |
      | 成功數量   | 1  |
      | 失敗數量   | 1  |
      | 總數量     | 2  |
    And 錯誤詳情應該包含 "task1: 任務正在被其他用戶修改"

  @ignore
  Scenario: 批量操作的事務性
    Given 用戶 "admin" 已登入
    And 系統配置為嚴格事務模式
    When 用戶批量操作任務：
      | 操作類型 | 狀態更新        |
      | 任務ID   | task1,invalid   |
      | 新狀態   | completed       |
      | 操作者   | admin           |
      | 事務模式 | strict          |
    Then 批量操作應該完全失敗
    And 所有任務狀態應該保持不變
    And 錯誤訊息應該是 "批量操作失敗，所有變更已回滾"

  @ignore
  Scenario: 複雜的批量更新
    Given 用戶 "admin" 已登入
    When 用戶批量操作任務：
      | 操作類型 | 混合更新      |
      | 任務更新 | task1:狀態=completed,負責人=user2 |
      | 任務更新 | task2:狀態=in_progress |
      | 任務更新 | task3:負責人=user1 |
      | 操作者   | admin         |
    Then 批量操作應該成功
    And 任務 "task1" 應該有：
      | 欄位   | 值        |
      | 狀態   | completed |
      | 負責人 | user2     |
    And 任務 "task2" 的狀態應該是 "in_progress"
    And 任務 "task3" 的負責人應該是 "user1"
    And 操作日誌應該記錄所有變更

  @ignore
  Scenario: 批量操作的通知機制
    Given 用戶 "admin" 已登入
    And 系統啟用通知功能
    When 用戶批量操作任務：
      | 操作類型 | 負責人分配    |
      | 任務ID   | task1,task2   |
      | 新負責人 | user2         |
      | 操作者   | admin         |
    Then 批量操作應該成功
    And 用戶 "user2" 應該收到任務分配通知
    And 用戶 "user1" 應該收到任務移除通知
    And 通知應該包含批量操作的詳細資訊 