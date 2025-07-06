# 智能任務管理系統 Benchmark

## 系統概覽

**智能任務管理系統 (Smart Task Management System)** 是一個針對 BDD 開發實戰設計的 Benchmark 系統。目前實作了基本的任務管理功能，包含完整的 CRUD 操作和權限控制。

## 已實作功能

### 📊 API 端點

目前實作了 **5 個 API 端點**：

#### 任務管理 APIs

- `GET /api/tasks` - 查詢任務列表
- `POST /api/tasks` - 創建新任務
- `PUT /api/tasks/{taskId}` - 更新任務
- `DELETE /api/tasks/{taskId}` - 刪除任務

#### 系統 APIs

- `GET /health` - 健康檢查

### 🧪 BDD 測試

已實作完整的 BDD 測試覆蓋，包含 **5 個 Feature Files**：

- **`task-creation.feature`** - 任務創建功能測試
- **`task-validation.feature`** - 任務驗證測試
- **`task-update.feature`** - 任務更新功能測試
- **`task-delete.feature`** - 任務刪除功能測試
- **`task-query.feature`** - 任務查詢功能測試

### 🏗️ 技術架構

#### 後端技術棧

- **框架**：Node.js + TypeScript + Express
- **測試**：Cucumber + Chai
- **架構模式**：MVC (Model-View-Controller)

#### 目錄結構

```
後端/
├── src/
│   ├── app.ts              # Express 應用程式設定
│   ├── index.ts            # 服務器啟動點
│   ├── controllers/        # 控制器層
│   │   └── TaskController.ts
│   ├── services/           # 業務邏輯層
│   │   └── TaskService.ts
│   ├── domain/             # 領域模型
│   │   ├── Task.ts
│   │   ├── User.ts
│   │   ├── Project.ts
│   │   └── types.ts
│   └── routes/             # 路由設定
│       └── taskRoutes.ts
├── features/               # BDD Feature files
├── steps/                  # BDD Step definitions
├── e2e-tests/             # E2E 測試
├── package.json
└── tsconfig.json
```

### 📝 資料模型

#### Task (任務)

```typescript
interface TaskData {
  id: string;
  title: string;
  description: string;
  projectId: string;
  creatorId: string;
  assigneeId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### API 請求格式

```typescript
// 創建任務
interface CreateTaskRequest {
  title: string;
  description: string;
  projectId: string;
  creatorId: string;
}

// 更新任務
interface UpdateTaskRequest {
  title?: string;
  description?: string;
  updatedBy: string;
}
```

### ✅ 功能特點

- **權限控制**：只有任務創建者可以修改或刪除任務
- **資料驗證**：完整的輸入驗證和錯誤處理
- **RESTful API**：遵循 REST 原則的 API 設計
- **錯誤處理**：統一的錯誤回應格式
- **測試覆蓋**：完整的 BDD 測試和 E2E 測試

### 🚀 使用方式

#### 啟動服務

```bash
cd 後端
npm install
npm run dev
```

#### 執行測試

```bash
# BDD 測試
npm run test

# E2E 測試
npm run test:e2e
```

#### API 測試

服務啟動後可通過以下方式測試：

- **基礎 URL**: `http://localhost:3000`
- **健康檢查**: `GET /health`
- **API 文檔**: 參考 `/api/openapi.yaml`

### 📊 測試結果

- **BDD 測試**: 8 scenarios (8 passed), 58 steps (58 passed)
- **E2E 測試**: 12 scenarios (12 passed), 45 steps (45 passed)
- **測試覆蓋率**: 100% 功能覆蓋

### 💡 設計理念

- **BDD 驅動開發**：先寫測試，後實作功能
- **權限優先**：每個操作都有權限檢查
- **錯誤處理**：完整的錯誤情況處理
- **代碼品質**：遵循 TypeScript 最佳實踐

---

**此 Benchmark 展示了完整的 BDD 開發流程，從需求分析到實作完成。**
