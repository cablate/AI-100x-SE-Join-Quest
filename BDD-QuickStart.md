# BDD 快速入門指南

## 🎯 什麼是 BDD？

BDD（Behavior-Driven Development，行為驅動開發）是一種敏捷開發方法，強調：

1. **從業務價值出發**：先定義「為什麼」，再考慮「怎麼做」
2. **用自然語言描述需求**：讓所有人都能理解
3. **測試即文件**：測試案例就是活的規格文件

## 🔑 核心概念

### Given-When-Then

BDD 使用三段式結構描述行為：

- **Given**（前置條件）：系統的初始狀態
- **When**（觸發動作）：使用者執行的操作
- **Then**（預期結果）：應該發生的事情

```gherkin
Scenario: 提款成功
  Given 我的帳戶有 1000 元
  When 我提款 500 元
  Then 帳戶餘額應為 500 元
  And 提款機應吐出 500 元
```

### Feature（特性）

多個相關的 Scenario 組成一個 Feature：

```gherkin
Feature: ATM 提款功能
  作為一個銀行客戶
  我想要能從 ATM 提款
  以便我能快速取得現金

  Scenario: 餘額充足時提款成功
    Given 我的帳戶有 1000 元
    When 我提款 500 元
    Then 提款應該成功

  Scenario: 餘額不足時提款失敗
    Given 我的帳戶有 100 元
    When 我提款 500 元
    Then 提款應該失敗
    And 顯示餘額不足訊息
```

## 🎓 重要原則

### 1. 一個 Scenario = 一個行為 = 一個業務規則

每個 Scenario 應該：

- 只測試**一個**具體的業務規則
- 有明確的成功或失敗條件
- 獨立於其他 Scenario

### 2. Scenario vs Scenario Outline

#### Scenario：測試單一情況

```gherkin
Scenario: VIP 會員購買剛好 1000 元
  Given 我是 VIP 會員
  And 購物車總額為 1000 元
  When 結帳
  Then 應獲得 100 元折扣
```

#### Scenario Outline：測試同一規則的多種數據

```gherkin
Scenario Outline: VIP 會員滿千送百優惠
  Given 我是 VIP 會員
  And 購物車總額為 <amount> 元
  When 結帳
  Then 應獲得 <discount> 元折扣

  Examples:
    | amount | discount | 說明 |
    | 1000   | 100     | 剛好滿千 |
    | 1500   | 100     | 超過門檻 |
    | 999    | 0       | 差一元 |
```

### 3. 避免常見錯誤

#### ❌ 錯誤：在一個 Scenario Outline 中混合多個規則

```gherkin
# 不要這樣做！
Scenario Outline: 所有折扣計算
  Given 客戶類型是 <type>
  When 購買 <amount> 元
  Then 折扣為 <discount>

  Examples:
    | type | amount | discount | 規則 |
    | VIP  | 1000   | 100     | VIP滿千送百 |
    | 一般 | 2000   | 200     | 滿2千9折 |
    | 一般 | 100    | 50      | 買一送一 |
```

#### ✅ 正確：每個規則有自己的 Scenario

```gherkin
# VIP 優惠規則
Scenario Outline: VIP 會員滿千送百
  Given 我是 VIP 會員
  And 購物車總額為 <amount> 元
  When 結帳
  Then 折扣金額為 <discount> 元

  Examples:
    | amount | discount |
    | 1000   | 100     |
    | 2000   | 100     |
    | 999    | 0       |

# 滿額折扣規則（另一個獨立的 Scenario）
Scenario Outline: 一般會員滿兩千打九折
  Given 我是一般會員
  And 購物車總額為 <amount> 元
  When 結帳
  Then 折扣率為 <rate>

  Examples:
    | amount | rate |
    | 2000   | 0.1  |
    | 3000   | 0.1  |
    | 1999   | 0    |
```

### 4. Examples 表格的正確用法

Examples 表格應該：

- ✅ 測試**同一規則**的不同輸入
- ✅ 包含邊界值測試
- ✅ 包含正常值和異常值
- ❌ 不要混合不同的業務規則

## 🚦 紅綠重構循環

BDD 遵循 TDD 的紅綠重構循環：

1. **🔴 紅燈**：寫測試，執行失敗（因為還沒實作）
2. **🟢 綠燈**：寫最小程式碼，讓測試通過
3. **🔧 重構**：改善程式碼品質，保持測試通過

### 實踐要點

- **一次一個 Scenario**：不要同時進行多個
- **測試先行**：先看到紅燈，才寫程式碼
- **最小實作**：只寫剛好通過測試的程式碼

## 🛠 技術實作

### Cucumber（Gherkin）語法

```gherkin
Feature: 功能名稱
  """
  多行描述（可選）
  說明這個功能的業務價值
  """

  Background: 共用前置條件（可選）
    Given 一些每個 Scenario 都需要的設定

  Scenario: 場景名稱
    Given 前置條件
    And 更多前置條件
    When 觸發動作
    Then 預期結果
    But 反向預期（可選）
```

### Step Definitions

將 Gherkin 步驟對應到程式碼：

```javascript
// JavaScript/TypeScript 範例
Given("我的帳戶有 {int} 元", function (amount) {
  this.account = new Account(amount);
});

When("我提款 {int} 元", function (amount) {
  this.result = this.account.withdraw(amount);
});

Then("帳戶餘額應為 {int} 元", function (expectedBalance) {
  expect(this.account.balance).to.equal(expectedBalance);
});
```

## 💡 最佳實踐

1. **保持 Scenario 簡短**：3-5 個步驟最佳
2. **使用業務語言**：避免技術術語
3. **避免 UI 細節**：聚焦在「做什麼」而非「怎麼做」
4. **重複使用步驟**：建立可組合的步驟庫
5. **定期重構**：保持測試的可讀性和可維護性

## 🎬 開始你的 BDD 之旅

1. 選擇一個簡單的功能
2. 與團隊討論業務需求
3. 一起寫下第一個 Scenario
4. 遵循紅綠重構循環
5. 逐步擴展測試覆蓋

記住：BDD 不只是測試工具，更是溝通和協作的方法！
