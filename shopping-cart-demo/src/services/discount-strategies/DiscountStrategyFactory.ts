import { DiscountConfig } from "../../config/DiscountConfig";
import { DiscountStrategy } from "./DiscountStrategy";
import { NoDiscountStrategy } from "./NoDiscountStrategy";
import { RegularDiscountStrategy } from "./RegularDiscountStrategy";
import { VipDiscountStrategy } from "./VipDiscountStrategy";

export class DiscountStrategyFactory {
  /**
   * 創建所有可用的折扣策略
   * @param config 折扣設定
   * @returns 排序後的策略陣列
   */
  static createStrategies(config: DiscountConfig): DiscountStrategy[] {
    const strategies: DiscountStrategy[] = [
      new VipDiscountStrategy(config),
      new RegularDiscountStrategy(config), // 新增一般會員策略
      // 未來可以加入其他策略
      // new BuyOneGetOneStrategy(config),
      new NoDiscountStrategy(), // 預設策略永遠在最後
    ];

    // 依照優先級排序
    return strategies.sort((a, b) => a.getPriority() - b.getPriority());
  }
}
