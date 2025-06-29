export interface DiscountConfig {
  vip: {
    minAmount: number;
    discountAmount: number;
  };
  regular: {
    minAmount: number;
    discountRate: number;
  };
  maxDiscountRate: number;
  promotionEndDate: Date;
}

export const defaultDiscountConfig: DiscountConfig = {
  vip: {
    minAmount: 1000,
    discountAmount: 100,
  },
  regular: {
    minAmount: 2000,
    discountRate: 0.1, // 10% off
  },
  maxDiscountRate: 0.3, // 最多打到 7 折（折扣 30%）
  promotionEndDate: new Date(2024, 5, 30), // 2024-06-30
};
