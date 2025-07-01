import { DiscountConfig } from "../../config/DiscountConfig";
import { Customer, ShoppingCart } from "../../domain/types";
import { DiscountCalculation, DiscountStrategy } from "./DiscountStrategy";

export class VipDiscountStrategy implements DiscountStrategy {
  constructor(private config: DiscountConfig) {}

  isApplicable(cart: ShoppingCart, customer: Customer): boolean {
    const totalAmount = cart.getTotalAmount();
    return customer.isVIP && totalAmount >= this.config.vip.minAmount;
  }

  calculate(cart: ShoppingCart, customer: Customer): DiscountCalculation {
    const originalAmount = cart.getTotalAmount();
    const discountAmount = this.config.vip.discountAmount;

    return {
      discountType: "VIP滿千送百",
      discountAmount,
      originalAmount,
      finalAmount: originalAmount - discountAmount,
    };
  }

  getPriority(): number {
    return 1; // VIP 優先級最高
  }
}
