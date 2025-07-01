import { Customer, ShoppingCart } from "../../domain/types";

export class DiscountValidator {
  static validateInputs(cart: ShoppingCart | null | undefined, customer: Customer | null | undefined, currentDate: Date | null | undefined): void {
    if (!cart) {
      throw new Error("購物車不能為空");
    }

    if (!customer) {
      throw new Error("客戶資訊不能為空");
    }

    if (!currentDate) {
      throw new Error("當前日期不能為空");
    }

    if (!cart.items || cart.items.length === 0) {
      throw new Error("購物車內沒有商品");
    }

    // 驗證購物車商品
    cart.items.forEach((item, index) => {
      if (item.unitPrice < 0) {
        throw new Error(`商品 ${index + 1} 的單價不能為負數`);
      }
      if (item.quantity <= 0) {
        throw new Error(`商品 ${index + 1} 的數量必須大於 0`);
      }
    });
  }
}
