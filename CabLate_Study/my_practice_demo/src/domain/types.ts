export interface Customer {
  id: string;
  isVIP: boolean;
}

export interface CartItem {
  productName: string;
  unitPrice: number;
  quantity: number;
}

export interface ShoppingCart {
  items: CartItem[];
  getTotalAmount(): number;
}

export interface DiscountResult {
  originalAmount: number;
  discountType: string;
  discountAmount: number;
  finalAmount: number;
}
