import { DiscountConfig, defaultDiscountConfig } from "../config/DiscountConfig";
import { Customer, DiscountResult, ShoppingCart } from "../domain/types";
import { DiscountStrategy } from "./discount-strategies/DiscountStrategy";
import { DiscountStrategyFactory } from "./discount-strategies/DiscountStrategyFactory";
import { NoDiscountStrategy } from "./discount-strategies/NoDiscountStrategy";
import { DiscountValidator } from "./validators/DiscountValidator";

export class DiscountService {
  private strategies: DiscountStrategy[] = [];
  private config: DiscountConfig;

  constructor(config?: DiscountConfig) {
    this.config = config || defaultDiscountConfig;
    this.initializeStrategies();
  }

  private initializeStrategies(): void {
    // 使用工廠創建所有策略
    this.strategies = DiscountStrategyFactory.createStrategies(this.config);
  }

  calculateDiscount(cart: ShoppingCart, customer: Customer, currentDate: Date): DiscountResult {
    // 輸入驗證
    DiscountValidator.validateInputs(cart, customer, currentDate);

    // 檢查活動是否在期限內
    if (!this.isPromotionActive(currentDate)) {
      return new NoDiscountStrategy().calculate(cart, customer);
    }

    // 找出第一個適用的策略（已按優先級排序）
    const applicableStrategy = this.strategies.find((strategy) => strategy.isApplicable(cart, customer));

    if (!applicableStrategy) {
      throw new Error("沒有找到適用的折扣策略");
    }

    const calculation = applicableStrategy.calculate(cart, customer);

    // 套用折扣上限
    return this.applyMaxDiscountLimit(calculation);
  }

  private isPromotionActive(currentDate: Date): boolean {
    return currentDate <= this.config.promotionEndDate;
  }

  private applyMaxDiscountLimit(calculation: DiscountResult): DiscountResult {
    const maxDiscountAmount = calculation.originalAmount * this.config.maxDiscountRate;

    if (calculation.discountAmount > maxDiscountAmount) {
      return {
        ...calculation,
        discountAmount: maxDiscountAmount,
        finalAmount: calculation.originalAmount - maxDiscountAmount,
        discountType: `${calculation.discountType}（已達折扣上限）`,
      };
    }

    return calculation;
  }

  /**
   * 動態新增折扣策略
   */
  addStrategy(strategy: DiscountStrategy): void {
    this.strategies.push(strategy);
    this.strategies.sort((a, b) => a.getPriority() - b.getPriority());
  }
}
