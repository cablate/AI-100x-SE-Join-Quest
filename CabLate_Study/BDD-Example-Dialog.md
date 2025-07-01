# BDD 範例對話 - 電商折扣系統

## 🎬 實際對話示範

### 開始階段

**開發者**：我要開發一個購物車折扣系統

**AI**：我需要了解業務需求：

1. 這個功能的業務目的是什麼？
2. 誰會使用這個功能？
3. 成功的衡量標準是什麼？

**開發者**：目的是提升客單價，給 VIP 會員滿千送百的優惠，一般會員滿兩千打 9 折

**AI**：了解了。讓我確認一下：

- VIP 會員的判定標準是什麼？
- 兩種優惠可以疊加嗎？
- 有折扣上限嗎？

**開發者**：VIP 是年費會員，優惠不可疊加（擇優），最多折扣到原價的 7 折

### GWT 定義階段

**AI**：好的，讓我們定義第一個 Scenario。我建議從最簡單的開始：

```gherkin
Feature: 購物車折扣計算
  """
  業務目標：提升客單價，鼓勵升級 VIP
  優惠規則：VIP 滿千送百 > 一般滿兩千9折（擇優不疊加）
  折扣上限：原價 70%
  """

  Scenario: VIP 會員購買滿 1000 元
    Given 客戶是 VIP 會員
    And 購物車商品總額為 1200 元
    When 計算折扣後金額
    Then 應獲得 100 元折扣
    And 最終金額應為 1100 元
```

這樣的 Given/When/Then 是否符合您的預期？

**開發者**：是的，開始實作吧

### 紅燈階段

**AI**：

🔴 **紅燈階段開始**

首先建立 Step Definitions（空實作）：

```typescript
// steps/discount.steps.ts
import { Given, When, Then } from "@cucumber/cucumber";

Given("客戶是 VIP 會員", function () {
  // TODO: 設定客戶為 VIP
});

Given("購物車商品總額為 {int} 元", function (amount: number) {
  // TODO: 設定購物車金額
});

When("計算折扣後金額", function () {
  // TODO: 呼叫折扣計算邏輯
});

Then("應獲得 {int} 元折扣", function (expectedDiscount: number) {
  // TODO: 驗證折扣金額
});

Then("最終金額應為 {int} 元", function (expectedTotal: number) {
  // TODO: 驗證最終金額
});
```

執行測試結果：

```
✗ Scenario: VIP 會員購買滿 1000 元
  ✗ Given 客戶是 VIP 會員
  ✗ And 購物車商品總額為 1200 元
  ✗ When 計算折扣後金額
  ✗ Then 應獲得 100 元折扣
    Error: Expected 100, but was undefined
  ✗ And 最終金額應為 1100 元
```

紅燈確認 ✗ - 測試失敗原因是預期值錯誤，非框架問題。
準備進入綠燈階段？

### 綠燈階段

**開發者**：繼續

**AI**：

🟢 **綠燈階段 - 最小實作**

```typescript
// domain/ShoppingCart.ts
export class ShoppingCart {
  constructor(private items: CartItem[] = [], private customer: Customer) {}

  getTotalAmount(): number {
    return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  calculateDiscount(): number {
    const total = this.getTotalAmount();

    if (this.customer.isVIP && total >= 1000) {
      return 100; // VIP 滿千送百
    }

    return 0;
  }

  getFinalAmount(): number {
    return this.getTotalAmount() - this.calculateDiscount();
  }
}
```

更新 Step Definitions：

```typescript
let shoppingCart: ShoppingCart;
let customer: Customer;

Given("客戶是 VIP 會員", function () {
  customer = new Customer({ isVIP: true });
});

Given("購物車商品總額為 {int} 元", function (amount: number) {
  const item = new CartItem("商品", amount, 1);
  shoppingCart = new ShoppingCart([item], customer);
});

When("計算折扣後金額", function () {
  // 計算會在驗證時自動執行
});

Then("應獲得 {int} 元折扣", function (expectedDiscount: number) {
  const actualDiscount = shoppingCart.calculateDiscount();
  expect(actualDiscount).toBe(expectedDiscount);
});

Then("最終金額應為 {int} 元", function (expectedTotal: number) {
  const actualTotal = shoppingCart.getFinalAmount();
  expect(actualTotal).toBe(expectedTotal);
});
```

執行測試結果：

```
✓ Scenario: VIP 會員購買滿 1000 元
  ✓ Given 客戶是 VIP 會員
  ✓ And 購物車商品總額為 1200 元
  ✓ When 計算折扣後金額
  ✓ Then 應獲得 100 元折扣
  ✓ And 最終金額應為 1100 元

1 scenario (1 passed)
5 steps (5 passed)
```

綠燈確認 ✓ - 測試通過！

### 重構階段

**AI**：

🔧 **重構階段**

程式碼可以改進的地方：

1. 將折扣規則抽離為策略模式
2. 加入折扣上限檢查

是否需要重構？或是先進入下一個 Scenario？

**開發者**：先進入下一個 Scenario

**AI**：

## 📊 目前進度

- 總 Scenarios: 待定
- 已完成: 1 ✓
- 進行中: 0
- 待處理: 多個

建議下一個 Scenario：

1. 一般會員滿兩千打 9 折
2. VIP 會員購買未滿千元（無折扣）
3. 折扣上限測試（原價 70%）

您想實作哪一個？

**開發者**：我想一次測試所有的折扣規則

**AI**：

理解了，您有多個折扣規則需要測試。根據 BDD 最佳實踐，**每個 Scenario 應該只測試一個業務規則**。讓我為每個規則設計獨立的測試：

## 📋 規則清單

1. VIP 會員滿 1000 元送 100 元
2. 一般會員滿 2000 元打 9 折
3. 折扣上限為原價 70%

讓我們分別為每個規則建立獨立的 Scenario Outline：

```gherkin
Feature: 購物車折扣計算
  """
  業務目標：提升客單價，鼓勵升級 VIP
  """

  # 規則 1: VIP 滿千送百
  Scenario Outline: VIP 會員滿千送百優惠
    Given 客戶是 VIP 會員
    And 購物車商品總額為 <amount> 元
    When 計算折扣後金額
    Then 折扣金額應為 <discount> 元
    And 最終金額應為 <final> 元

    Examples: VIP 優惠測試案例
      | amount | discount | final | 測試目的 |
      | 1000   | 100     | 900   | 剛好滿千 |
      | 1200   | 100     | 1100  | 超過門檻 |
      | 999    | 0       | 999   | 差1元未滿 |
      | 5000   | 100     | 4900  | 大額仍是100 |

  # 規則 2: 一般會員滿額折扣
  Scenario Outline: 一般會員滿兩千打九折
    Given 客戶是一般會員
    And 購物車商品總額為 <amount> 元
    When 計算折扣後金額
    Then 折扣率應為 <rate>
    And 最終金額應為 <final> 元

    Examples: 滿額折扣測試案例
      | amount | rate | final | 測試目的 |
      | 2000   | 0.1  | 1800  | 剛好滿額 |
      | 3000   | 0.1  | 2700  | 正常打折 |
      | 1999   | 0    | 1999  | 差1元未滿 |
      | 10000  | 0.1  | 9000  | 大額測試 |

  # 規則 3: 折扣上限保護
  Scenario: 驗證折扣上限為原價七折
    Given 客戶是一般會員
    And 購物車商品總額為 100000 元
    And 系統有多重優惠可能疊加
    When 計算折扣後金額
    Then 最終金額不得低於 70000 元
```

這樣設計的優點：

1. **單一職責**：每個 Scenario 只測試一個業務規則
2. **清晰易懂**：看標題就知道在測試什麼
3. **易於維護**：規則變更只影響對應的 Scenario
4. **完整覆蓋**：每個規則的邊界案例都有測試

請注意，**Examples 表格只用來測試同一規則的不同數據組合**，而不是測試不同的規則。

您想從哪個規則開始實作？
