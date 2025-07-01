# 中國象棋規則驗證系統

基於 BDD (行為驅動開發) 實作的中國象棋規則驗證系統，使用 Cucumber + TypeScript 開發。

## 🎯 專案目標

驗證中國象棋的各種移動規則，確保遊戲邏輯正確性：

- **將/帥（General）**：只能在皇宮內移動，不能與對方將帥對面
- **士/仕（Guard）**：只能在皇宮內斜向移動一格
- **車（Rook）**：直線移動，路徑不能有阻擋
- **馬/傌（Horse）**：走「日」字形，不能蹩腳
- **炮（Cannon）**：直線移動，打子需要炮架
- **相/象（Elephant）**：走「田」字形，不能過河，不能塞象眼
- **兵/卒（Soldier）**：過河前只能前進，過河後可橫移但不能後退

## 🏗️ 系統架構

```
Mission_3/
├── src/
│   ├── types.ts          # 基本類型定義
│   └── ChessBoard.ts     # 棋盤邏輯與規則驗證
├── features/
│   └── chinese-chess.feature  # BDD 場景定義
├── steps/
│   └── chinese-chess.steps.ts # Cucumber 步驟實作
└── reports/              # 測試報告
```

## 🚀 快速開始

### 安裝依賴

```bash
npm install
```

### 執行測試

```bash
npm test
```

### 持續監控

```bash
npm run test:watch
```

## 📊 測試覆蓋率

目前測試覆蓋所有主要象棋規則：

- ✅ 22 個測試場景
- ✅ 66 個測試步驟
- ✅ 100% 規則覆蓋率

## 🧪 BDD 測試場景

### 將/帥規則

- [x] 皇宮內合法移動
- [x] 超出皇宮的非法移動
- [x] 將帥對面的非法移動

### 士/仕規則

- [x] 皇宮內斜向移動
- [x] 直線移動的非法性

### 車規則

- [x] 清晰路徑的直線移動
- [x] 跳躍棋子的非法移動

### 馬/傌規則

- [x] 標準「L」形移動
- [x] 蹩腳的非法移動

### 炮規則

- [x] 無阻擋的直線移動
- [x] 一個炮架的合法打子
- [x] 無炮架的非法打子
- [x] 多個炮架的非法打子

### 相/象規則

- [x] 清晰路徑的田字移動
- [x] 過河的非法移動
- [x] 塞象眼的非法移動

### 兵/卒規則

- [x] 過河前的前進移動
- [x] 過河前的橫移非法性
- [x] 過河後的橫移移動
- [x] 過河後的後退非法性

### 勝負規則

- [x] 捕獲將軍立即獲勝
- [x] 捕獲其他棋子遊戲繼續

## 🛠️ 開發工具

- **TypeScript**: 類型安全的 JavaScript
- **Cucumber**: BDD 測試框架
- **Node.js**: JavaScript 執行環境

## 📝 程式碼品質

- 嚴格的 TypeScript 類型檢查
- 完整的 JSDoc 註解
- 遵循 SOLID 原則的物件導向設計
- 100% 測試覆蓋率

## 🎮 使用範例

```typescript
import { ChessBoard } from "./src/ChessBoard";

const board = new ChessBoard();

// 放置棋子
board.placePiece("general", "red", { row: 1, col: 5 });

// 嘗試移動
const result = board.movePiece({ row: 1, col: 5 }, { row: 1, col: 4 });

console.log(result.isLegal); // true
console.log(result.reason); // undefined (合法移動)
```

## 📈 此 demo 開發流程

1. 將 Scenario 提供給 AI（Agent 已經匯入自己寫好的 BDD 相關提示詞）。
2. AI 建立環境，包含 cucumber 等安裝。
3. AI 以第一個為例子，確認內容理解、是否實做與測試撰寫等作業。
4. 回覆「確認」並告知直接完成所有 Scenario。
5. AI 進行實做、測試撰寫、紅燈測試、引用實做、綠燈測試、完成所有 Scenario。

---

**開發者**: @CabLate 
**開發方法**: BDD (行為驅動開發)  
**最後更新**: 2025-07-01
