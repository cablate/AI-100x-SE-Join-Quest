# 任務管理系統 - 前端

一個基於 EJS 模板引擎的任務管理系統前端應用程式，採用模組化架構設計。

## 🚀 功能特色

### 核心功能
- **儀表板首頁**：系統概覽與統計資訊
- **任務管理**：完整的任務 CRUD 操作
- **專案管理**：專案的創建、編輯、查看與刪除
- **高級查詢**：支援按狀態、優先級、專案篩選
- **響應式設計**：支援桌面和行動裝置

### 技術特色
- **模組化架構**：EJS 視圖按功能分離
- **Bootstrap UI**：現代化的使用者介面
- **RESTful API**：與後端 API 完整整合
- **錯誤處理**：友善的錯誤訊息顯示
- **即時回饋**：操作成功/失敗提示

## 📁 專案結構

```
前端/
├── app.js                 # 應用程式主要入口
├── package.json           # 專案相依性設定
├── routes/                # 路由模組
│   ├── index.js           # 首頁路由
│   ├── tasks.js           # 任務管理路由
│   └── projects.js        # 專案管理路由
├── views/                 # EJS 模板檔案
│   ├── index.ejs          # 首頁
│   ├── shared/            # 共享組件
│   │   ├── navbar.ejs     # 導航列
│   │   ├── footer.ejs     # 頁腳
│   │   ├── alerts.ejs     # 警告訊息
│   │   └── error.ejs      # 錯誤頁面
│   ├── tasks/             # 任務相關頁面
│   │   ├── index.ejs      # 任務列表
│   │   ├── new.ejs        # 新增任務
│   │   └── edit.ejs       # 編輯任務
│   └── projects/          # 專案相關頁面
│       ├── index.ejs      # 專案列表
│       ├── new.ejs        # 新增專案
│       ├── detail.ejs     # 專案詳情
│       └── edit.ejs       # 編輯專案
└── public/                # 靜態資源
    ├── css/
    │   └── style.css      # 自定義樣式
    └── js/
        └── app.js         # 前端 JavaScript
```

## 🛠️ 安裝與設定

### 環境需求
- Node.js 16.0 或以上版本
- npm 或 yarn
- 後端 API 服務運行中

### 安裝步驟

1. **安裝相依性**
   ```bash
   cd 前端
   npm install
   ```

2. **環境變數設定**
   ```bash
   # 可選：設定後端 API 位址
   export API_BASE_URL=http://localhost:3000
   export PORT=3001
   ```

3. **啟動開發伺服器**
   ```bash
   npm run dev
   ```

4. **訪問應用程式**
   開啟瀏覽器，前往 `http://localhost:3001`

## 🖥️ 使用說明

### 首頁功能
- 查看系統統計資訊
- 快速查看最近的任務和專案
- 快速建立新任務或專案

### 任務管理
1. **查看任務**：`/tasks` - 顯示所有任務列表
2. **篩選任務**：按狀態、優先級、專案進行篩選
3. **新增任務**：`/tasks/new` - 建立新任務
4. **編輯任務**：點擊編輯按鈕修改任務資訊
5. **刪除任務**：確認後刪除任務

### 專案管理
1. **查看專案**：`/projects` - 顯示所有專案
2. **專案詳情**：點擊專案名稱查看詳細資訊
3. **新增專案**：`/projects/new` - 建立新專案
4. **編輯專案**：修改專案資訊和狀態
5. **專案任務**：在專案詳情頁查看相關任務

## 🎨 UI 組件

### 共享組件
- **導航列**：統一的頁面導航
- **警告訊息**：成功/錯誤操作提示
- **頁腳**：系統狀態顯示
- **錯誤頁面**：友善的錯誤處理

### 表單元件
- 輸入驗證
- 下拉選單
- 文字區域
- 確認對話框

### 資料顯示
- 統計卡片
- 資料表格
- 進度條
- 徽章標籤

## 🔧 設定選項

### 環境變數
```bash
PORT=3001                               # 前端伺服器埠號
API_BASE_URL=http://localhost:3000      # 後端 API 位址
NODE_ENV=development                     # 環境模式
```

### 自定義設定
在 `app.js` 中可以修改：
- 樣板引擎設定
- 靜態檔案路徑
- 錯誤處理方式
- 中間件設定

## 📡 API 整合

### 後端連接
前端透過 axios 與後端 API 通訊：

```javascript
// 設定 axios 預設值
axios.defaults.baseURL = API_BASE_URL;

// API 呼叫範例
const response = await axios.get('/api/tasks', { 
  params: { userId: 'user123' } 
});
```

### 支援的 API 端點
- `GET /health` - 健康檢查
- `GET /api/tasks` - 查詢任務
- `POST /api/tasks` - 建立任務
- `PUT /api/tasks/:id` - 更新任務
- `DELETE /api/tasks/:id` - 刪除任務
- `GET /api/projects` - 查詢專案
- `POST /api/projects` - 建立專案
- `GET /api/projects/:id` - 取得專案
- `PUT /api/projects/:id` - 更新專案
- `DELETE /api/projects/:id` - 刪除專案

## 🧪 開發指南

### 新增頁面
1. 在 `views/` 中建立 EJS 模板
2. 在 `routes/` 中建立對應路由
3. 在 `app.js` 中註冊路由
4. 新增必要的靜態資源

### 模組化原則
- 每個功能使用獨立的路由檔案
- 共享的 UI 組件放在 `views/shared/`
- 重複的邏輯抽取為公用函數
- 保持程式碼的可讀性和可維護性

### 樣式指南
- 使用 Bootstrap 5 為基礎
- 自定義樣式放在 `public/css/style.css`
- 遵循響應式設計原則
- 保持一致的視覺風格

## 🚀 部署

### 生產環境設定
```bash
# 設定生產環境變數
NODE_ENV=production
PORT=80
API_BASE_URL=https://api.yourdomain.com

# 啟動應用程式
npm start
```

### Docker 部署
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## 🤝 開發流程

此專案採用 BDD (行為驅動開發) 方法論開發：
1. 需求分析與確認
2. 模組化架構設計
3. 功能逐步實作
4. 使用者體驗優化

## 📝 版本歷史

- **v1.0.0** - 初始版本
  - 基本的任務和專案管理功能
  - 響應式 UI 設計
  - 完整的 CRUD 操作

## 🐛 已知問題

目前沒有已知的重大問題。如果發現問題，請檢查：
1. 後端 API 服務是否正常運行
2. 網路連接是否正常
3. 瀏覽器控制台是否有錯誤訊息

## 📧 技術支援

如有技術問題或建議，請檢查：
- 後端 API 文檔
- EJS 模板引擎文檔
- Bootstrap 5 文檔
- Express.js 文檔