import { DiscountConfig } from "../../config/DiscountConfig";
import { Customer, ShoppingCart } from "../../domain/types";
import { DiscountCalculation, DiscountStrategy } from "./DiscountStrategy";

export class RegularDiscountStrategy implements DiscountStrategy {
  constructor(private config: DiscountConfig) {}

  isApplicable(cart: ShoppingCart, customer: Customer): boolean {
    const totalAmount = cart.getTotalAmount();
    return !customer.isVIP && totalAmount >= this.config.regular.minAmount;
  }

  calculate(cart: ShoppingCart, customer: Customer): DiscountCalculation {
    const originalAmount = cart.getTotalAmount();
    const discountAmount = Math.round(originalAmount * this.config.regular.discountRate);

    return {
      discountType: "一般會員滿額九折",
      discountAmount,
      originalAmount,
      finalAmount: originalAmount - discountAmount,
    };
  }

  getPriority(): number {
    return 2; // 優先級低於 VIP
  }
}
