import { Customer, ShoppingCart } from "../../domain/types";
import { DiscountCalculation, DiscountStrategy } from "./DiscountStrategy";

export class NoDiscountStrategy implements DiscountStrategy {
  isApplicable(cart: ShoppingCart, customer: Customer): boolean {
    // 這是預設策略，永遠適用
    return true;
  }

  calculate(cart: ShoppingCart, customer: Customer): DiscountCalculation {
    const originalAmount = cart.getTotalAmount();

    return {
      discountType: "無優惠",
      discountAmount: 0,
      originalAmount,
      finalAmount: originalAmount,
    };
  }

  getPriority(): number {
    return 999; // 最低優先級
  }
}
