### 任務管理核心場景

#### 任務創建
```gherkin
Scenario: 成功創建任務
  Given 用戶 "user1" 已登入系統
  When 用戶 "user1" 創建任務：
    | 標題 | 描述 | 專案ID |
    | 實作登入功能 | 開發用戶登入API | proj1 |
  Then 任務應該創建成功
  And 任務狀態應該是 "TODO"
  And 任務負責人應該是 "user1"
```

#### 任務更新
```gherkin
Scenario: 成功更新任務
  Given 用戶 "user1" 已登入系統
  And 存在由 "user1" 負責的任務 "task1"
  When 用戶 "user1" 更新任務 "task1"：
    | 標題 | 描述 |
    | 更新的標題 | 更新的描述 |
  Then 任務 "task1" 應該更新成功
```

#### 高級查詢
```gherkin
Scenario: 多條件查詢任務
  Given 用戶 "admin" 已登入
  And 系統中存在多個不同狀態的任務
  When 用戶查詢任務：
    | 條件 | 值       |
    | 狀態 | pending  |
    | 專案 | 後端專案 |
  Then 應該返回符合條件的任務
  And 查詢統計應該顯示正確數據
```

#### 批量操作
```gherkin
Scenario: 批量更新任務狀態
  Given 用戶 "admin" 已登入
  And 存在多個待處理任務
  When 用戶執行批量操作：
    | 操作類型 | 任務ID | 新狀態 |
    | 狀態更新 | task1,task2 | in_progress |
  Then 批量操作應該成功
  And 成功數量應該是 2
```

### 專案管理核心場景

#### 專案創建
```gherkin
Scenario: 成功創建專案
  Given 用戶 "admin" 已登入
  When 用戶創建專案：
    | 名稱     | 描述                 | 擁有者 |
    | 測試專案 | 這是一個測試專案     | admin  |
  Then 專案應該被成功創建
  And 專案狀態應該是 "active"
  And 專案擁有者應該是 "admin"
```

#### 專案管理
```gherkin
Scenario: 成功更新專案資訊
  Given 用戶 "admin" 已登入
  And 存在專案 "proj1" 由 "admin" 管理
  When 用戶 "admin" 更新專案 "proj1"：
    | 名稱 | 狀態 |
    | 新專案名稱 | completed |
  Then 專案 "proj1" 更新成功
```

### API 層測試場景

#### 任務 API
```gherkin
Scenario: 透過 API 創建任務
  Given API 伺服器正在運行
  When 我發送 POST 請求到 "/api/tasks" 包含：
    | title | description | projectId | creatorId |
    | 測試任務 | 測試描述 | proj1 | user1 |
  Then 回應狀態碼應該是 201
  And 回應應該包含 "success": true
  And 回應應該包含 "data.title": "測試任務"
```

#### 專案 API
```gherkin
Scenario: 透過 API 查詢專案
  Given API 伺服器正在運行
  And 存在多個專案
  When 我發送 GET 請求到 "/api/projects?ownerId=admin"
  Then 回應狀態碼應該是 200
  And 回應應該包含專案列表
  And 回應應該包含 "data.count": 2
```