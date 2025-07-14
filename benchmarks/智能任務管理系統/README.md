# 智能任務管理系統 Benchmark

## 系統概覽

**智能任務管理系統 (Smart Task Management System)** 是一個針對 BDD 開發實戰設計的 Benchmark 系統。系統採用前後端分離架構，實作了完整的任務和專案管理功能，包含 CRUD 操作、高級查詢、批量操作，並提供現代化的 Web 使用者介面。

## 已實作功能

### 📊 API 端點

目前實作了 **11 個 API 端點**：

#### 任務管理 APIs (6 個)

- `GET /api/tasks` - 查詢任務列表
- `POST /api/tasks` - 創建新任務
- `PUT /api/tasks/{taskId}` - 更新任務
- `DELETE /api/tasks/{taskId}` - 刪除任務
- `GET /api/tasks/query` - 高級任務查詢（支援多條件和統計）
- `POST /api/tasks/batch` - 批量操作任務

#### 專案管理 APIs (5 個)

- `GET /api/projects` - 查詢專案列表（支援擁有者和狀態過濾）
- `POST /api/projects` - 創建新專案
- `GET /api/projects/{projectId}` - 取得特定專案
- `PUT /api/projects/{projectId}` - 更新專案
- `DELETE /api/projects/{projectId}` - 刪除專案

#### 系統 APIs

- `GET /health` - 健康檢查

### 🧪 BDD 測試

已實作完整的 BDD 測試覆蓋，包含 **10 個 Feature Files**：

#### 任務管理功能測試 (7 個)
- **`task-creation.feature`** - 任務創建功能測試
- **`task-update.feature`** - 任務更新功能測試
- **`task-delete.feature`** - 任務刪除功能測試
- **`task-query.feature`** - 任務查詢功能測試
- **`task-advanced-query.feature`** - 高級查詢功能測試
- **`task-batch-operations.feature`** - 批量操作功能測試

#### 專案管理功能測試 (3 個)
- **`project-creation.feature`** - 專案創建功能測試
- **`project-query.feature`** - 專案查詢功能測試
- **`project-management.feature`** - 專案管理功能測試

### 🏗️ 技術架構

#### 後端技術棧

- **框架**：Node.js + TypeScript + Express
- **測試**：Cucumber + Chai
- **架構模式**：MVC (Model-View-Controller)

#### 前端技術棧

- **框架**：Node.js + Express + EJS
- **UI 框架**：Bootstrap 5 + Font Awesome
- **架構模式**：模組化路由 + 共享組件
- **API 整合**：Axios HTTP Client

#### 系統架構

```
智能任務管理系統/
├── 後端/                    # 後端 API 服務 (端口 3000)
│   ├── src/
│   │   ├── app.ts              # Express 應用程式設定
│   │   ├── index.ts            # 服務器啟動點
│   │   ├── controllers/        # 控制器層
│   │   ├── services/           # 業務邏輯層
│   │   ├── domain/             # 領域模型
│   │   └── routes/             # 路由設定
│   ├── features/               # BDD Feature files
│   ├── steps/                  # BDD Step definitions
│   └── e2e-tests/             # E2E API 測試
│
└── 前端/                    # 前端 Web 介面 (端口 3001)
    ├── app.js                  # Express 應用程式主入口
    ├── routes/                 # 模組化路由
    │   ├── index.js            # 首頁路由
    │   ├── tasks.js            # 任務管理路由
    │   └── projects.js         # 專案管理路由
    ├── views/                  # EJS 模板
    │   ├── index.ejs           # 儀表板首頁
    │   ├── shared/             # 共享 UI 組件
    │   ├── tasks/              # 任務管理頁面
    │   └── projects/           # 專案管理頁面
    └── public/                 # 靜態資源
        ├── css/style.css       # 自定義樣式
        └── js/app.js           # 前端 JavaScript
```
### ✅ 功能特點

#### 後端功能
- **任務管理**：完整的任務 CRUD 操作、高級查詢、批量操作
- **專案管理**：專案 CRUD 操作、過濾查詢、狀態管理
- **權限控制**：基於創建者和負責人的權限檢查
- **資料驗證**：完整的輸入驗證和錯誤處理
- **RESTful API**：遵循 REST 原則的 API 設計

#### 前端功能
- **儀表板首頁**：系統概覽、統計資訊、快速操作
- **任務管理介面**：任務列表、新增/編輯/刪除、篩選查詢
- **專案管理介面**：專案列表、詳情檢視、任務關聯顯示
- **響應式設計**：支援桌面和行動裝置
- **即時回饋**：操作成功/失敗提示、錯誤處理
- **模組化 UI**：共享組件、統一的視覺風格

#### 系統特性
- **前後端分離**：清晰的 API 契約和介面分層
- **錯誤處理**：統一的錯誤回應格式和使用者友善提示
- **測試覆蓋**：完整的 BDD 功能測試和 E2E API 測試
- **狀態同步**：前後端狀態邏輯一致性

### 🚀 快速開始

#### 環境需求
- Node.js 16.0 或以上版本
- npm 或 yarn 套件管理器

#### 啟動完整系統

**1. 啟動後端 API 服務**（端口 3000）
```bash
cd 後端
npm install
npm run dev
```

**2. 啟動前端 Web 介面**（端口 3001）
```bash
# 開啟新終端視窗
cd 前端
npm install
npm run dev
```

**3. 訪問系統**
- 前端介面：http://localhost:3001
- 後端 API：http://localhost:3000
- API 文檔：http://localhost:3000/health

#### 執行測試

**後端 BDD 測試**
```bash
cd 後端
npm run test
```

**功能測試覆蓋**
```bash
# 執行所有 Feature 測試
npm run test

# 執行 E2E API 測試
npm run test:api
```

### 💡 設計理念

#### 開發方法論
- **BDD 驅動開發**：先寫 Feature 測試，後實作功能
- **測試驅動設計**：E2E 測試確保 API 契約正確性
- **迭代式開發**：從任務管理擴展到專案管理

#### 架構設計原則
- **單一職責**：每個 Service 和 Controller 職責明確
- **權限優先**：每個操作都有完整的權限檢查機制
- **狀態管理**：清晰的實體狀態流轉規則
- **錯誤處理**：統一的錯誤分類和回應格式

#### 測試策略
- **雙層測試**：BDD 功能測試 + E2E API 測試
- **完整覆蓋**：正向流程 + 負向邊界案例
- **隔離測試**：每個測試場景獨立執行和清理

#### 代碼品質
- **TypeScript 最佳實踐**：嚴格的型別安全
- **REST API 規範**：統一的資源命名和 HTTP 動詞使用
- **模組化架構**：清晰的分層和依賴管理

### 📝 使用說明

#### 系統操作指南

**首頁功能**
- 查看系統統計資訊和概覽
- 快速查看最近的任務和專案
- 一鍵建立新任務或專案

**任務管理**
- 任務列表：查看、篩選、搜尋任務
- 新增任務：選擇專案、設定優先級、指派負責人
- 編輯任務：更新狀態、修改內容、重新指派
- 刪除任務：安全刪除確認機制

**專案管理**
- 專案列表：卡片式專案概覽
- 專案詳情：查看專案資訊和相關任務統計
- 新增專案：設定專案名稱、描述、狀態
- 編輯專案：更新專案資訊和狀態

#### 注意事項

**預設使用者**
- 系統預設使用者 ID：`user123`
- 所有操作都以此使用者身分執行

**狀態說明**
- 任務狀態：`TODO`（待處理）、`pending`（待處理）、`in_progress`（進行中）、`completed`（已完成）、`cancelled`（已取消）
- 專案狀態：`active`（進行中）、`completed`（已完成）、`cancelled`（已取消）

**系統限制**
- 後端需要在前端之前啟動
- 新增任務前需要先建立專案
- 刪除專案前建議先處理相關任務

---
