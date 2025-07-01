# CabLate BDD Lab 🧪

> AI 輔助的行為驅動開發（BDD）實驗室 - 從理論到實踐的完整學習專案

## 🎯 專案簡介

這是一個完整的 BDD（行為驅動開發）學習專案，包含：

- 📚 **理論文件**：AI-BDD 系統提示詞與使用指南
- 🧪 **實作範例**：購物車折扣系統的完整 BDD 開發流程
- 🤖 **AI 整合**：如何使用 AI 助手加速 BDD 開發

## 📂 專案結構

```
cablate-bdd-lab/
├── 📚 理論與指南
│   ├── AI-BDD-SystemPrompt.md    # AI 助手的 BDD 系統提示詞 (v3.0)
│   ├── BDD-QuickStart.md         # BDD 快速入門指南
│   ├── BDD-Example-Dialog.md     # BDD 實際對話範例
│   ├── prompt.md                 # 原始 BDD 實踐參考
│   └── promptfromGPT.md          # AI 自動化 BDD 參考
│
├── 🧪 實作範例
│   └── shopping-cart-demo/       # 購物車折扣系統 BDD 範例
│       ├── features/             # Gherkin 測試規格
│       ├── steps/                # Cucumber 步驟定義
│       └── src/                  # 業務邏輯實作
│
└── 📋 專案檔案
    ├── README.md                 # 本檔案
    ├── package.json              # 專案設定
    └── .gitignore                # Git 忽略規則
```

## 🚀 快速開始

### 方式一：使用 AI 助手學習 BDD

1. **設定 AI 助手**

   ```
   將 AI-BDD-SystemPrompt.md 的內容複製到你的 AI 助手（如 Cursor、Claude、GPT-4）
   ```

2. **開始對話**
   ```
   你：「我要用 BDD 方式開發登入功能」
   AI：「我需要了解業務需求...」
   ```

### 方式二：執行實作範例

1. **安裝依賴**

   ```bash
   npm run install:all
   ```

2. **執行測試**

   ```bash
   npm run test:shopping-cart
   ```

3. **查看測試報告**
   ```bash
   cd shopping-cart-demo
   開啟 cucumber-report.html
   ```

## 📚 學習路徑

### 1️⃣ 初學者路線

1. 閱讀 [BDD-QuickStart.md](./BDD-QuickStart.md) - 了解 BDD 基本概念
2. 查看 [BDD-Example-Dialog.md](./BDD-Example-Dialog.md) - 看實際對話如何進行
3. 進入 `shopping-cart-demo` 執行範例

### 2️⃣ 進階使用者

1. 使用 [AI-BDD-SystemPrompt.md](./AI-BDD-SystemPrompt.md) 開始你的專案
2. 參考 `shopping-cart-demo` 的架構設計
3. 實作自己的 BDD 測試案例

## 🎓 核心概念

### 什麼是 BDD？

BDD（Behavior-Driven Development）是一種敏捷開發方法，強調：

- 🗣️ **共同語言**：開發者、測試人員、業務人員使用相同術語
- 📝 **活文件**：測試即規格，永遠保持最新
- 🔄 **紅綠重構**：測試驅動的開發循環

### 為什麼要 AI + BDD？

AI 助手可以：

- ✅ 協助釐清模糊的業務需求
- ✅ 自動生成 Given-When-Then 場景
- ✅ 快速產生測試程式碼和實作
- ✅ 確保遵循 BDD 最佳實踐

## 🛠️ 技術棧

- **測試框架**：Cucumber + TypeScript
- **設計模式**：策略模式、工廠模式
- **AI 工具**：Claude、GPT-4、Cursor
- **開發流程**：紅綠重構、一個 Scenario = 一個業務規則

## 📖 重要原則

### 1. 一次一個 Scenario

完成當前 Scenario 的完整循環後，才進入下一個

### 2. 一個 Scenario = 一個業務規則

不要在同一個 Scenario 中混合多個業務規則

### 3. Examples 用於同一規則

Scenario Outline 的 Examples 表格只用來測試同一規則的不同數據

### 4. 紅綠重構循環

- 🔴 紅燈：寫測試，看到失敗
- 🟢 綠燈：最小實作通過測試
- 🔧 重構：改善程式碼品質

## 🤝 貢獻指南

歡迎貢獻更多 BDD 範例！

1. Fork 此專案
2. 在 `examples/` 目錄下創建新範例
3. 遵循紅綠重構流程
4. 提交 PR 時附上完整的測試報告

## 📝 授權

MIT License - 歡迎自由使用於學習和商業專案

## 🔗 相關資源

- [Cucumber 官方文檔](https://cucumber.io/docs/cucumber/)
- [BDD 介紹](https://cucumber.io/docs/bdd/)
- [Gherkin 語法](https://cucumber.io/docs/gherkin/)

---

💡 **記住**：BDD 不只是測試工具，更是溝通和協作的方法！

🚀 **開始你的 BDD 之旅**：複製 AI-BDD-SystemPrompt.md，告訴 AI「我要用 BDD 方式開發」
