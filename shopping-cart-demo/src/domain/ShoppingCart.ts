import { CartItem, ShoppingCart as IShoppingCart } from "./types";

export class ShoppingCart implements IShoppingCart {
  constructor(public items: CartItem[]) {}

  getTotalAmount(): number {
    return this.items.reduce((total, item) => {
      return total + item.unitPrice * item.quantity;
    }, 0);
  }
}
