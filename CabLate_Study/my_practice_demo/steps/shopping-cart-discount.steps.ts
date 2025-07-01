import { DataTable, Given, Then, When } from "@cucumber/cucumber";
import { expect } from "chai";
import { Customer } from "../src/domain/Customer";
import { ShoppingCart } from "../src/domain/ShoppingCart";
import { CartItem, DiscountResult, Customer as ICustomer, ShoppingCart as IShoppingCart } from "../src/domain/types";
import { DiscountService } from "../src/services/DiscountService";

// 測試用的資料存儲
let currentDate: Date;
let customer: ICustomer | null = null;
let shoppingCart: IShoppingCart | null = null;
let discountResult: DiscountResult | null = null;
let discountService: DiscountService;

Given("今天是 {int}-{int}-{int}", function (year: number, month: number, day: number) {
  currentDate = new Date(year, month - 1, day); // month is 0-indexed
  console.log(`設定日期為: ${currentDate.toISOString().split("T")[0]}`);
});

Given("客戶是 VIP 會員", function () {
  // 建立 VIP 會員
  customer = new Customer("test-vip-001", true);
});

Given("客戶是一般會員", function () {
  // 建立一般會員
  customer = new Customer("test-regular-001", false);
});

Given("購物車有以下商品：", function (dataTable: DataTable) {
  // 根據表格建立購物車
  const items = dataTable.hashes();
  const cartItems: CartItem[] = items.map((item) => ({
    productName: item["商品名稱"],
    unitPrice: parseInt(item["單價"]),
    quantity: parseInt(item["數量"]),
  }));

  shoppingCart = new ShoppingCart(cartItems);
  console.log("購物車商品:", cartItems);
});

When("計算折扣後金額", function () {
  if (!shoppingCart || !customer || !currentDate) {
    throw new Error("測試資料未正確設定");
  }

  // 呼叫折扣計算服務
  discountService = new DiscountService();
  discountResult = discountService.calculateDiscount(shoppingCart, customer, currentDate);
});

Then("原始總額應為 {int} 元", function (expectedAmount: number) {
  // 驗證原始總額
  expect(shoppingCart?.getTotalAmount()).to.equal(expectedAmount);
});

Then("應套用折扣類型為 {string}", function (expectedDiscountType: string) {
  // 驗證折扣類型
  expect(discountResult?.discountType).to.equal(expectedDiscountType);
});

Then("折扣金額應為 {int} 元", function (expectedDiscount: number) {
  // 驗證折扣金額
  expect(discountResult?.discountAmount).to.equal(expectedDiscount);
});

Then("折扣後總額應為 {int} 元", function (expectedFinalAmount: number) {
  // 驗證最終金額
  expect(discountResult?.finalAmount).to.equal(expectedFinalAmount);
});
