import { Customer, ShoppingCart } from "../../domain/types";

export interface DiscountCalculation {
  discountType: string;
  discountAmount: number;
  originalAmount: number;
  finalAmount: number;
}

export interface DiscountStrategy {
  /**
   * 檢查此策略是否適用
   */
  isApplicable(cart: ShoppingCart, customer: Customer): boolean;

  /**
   * 計算折扣
   */
  calculate(cart: ShoppingCart, customer: Customer): DiscountCalculation;

  /**
   * 策略優先級（數字越小優先級越高）
   */
  getPriority(): number;
}
