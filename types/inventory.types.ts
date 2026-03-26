export interface Product {
  _id?: string;
  productId?: string;
  name: string;
  price?: { cost?: number; costPrice?: number };
  pricingDetails?: Array<{ currency?: string; price?: number; costPrice?: number; cutOffPrice?: number }>;
  category: string | string[];
  enable?: boolean;
  enabled?: boolean;
  stockStatus?: string;
  inventory?: { ats?: number; allocation?: number; backorderQty?: number; preOrderQty?: number; inStockDate?: string; perpetual?: boolean; inStockFlag?: boolean };
  warehouses?: Array<{ warehouseId: string; ats: number }>;
  brand?: string;
  manufacturerProductId?: string;
  unitOfMeasure?: string;
  value?: string;
  shortDescription?: string;
  longDescription?: string;
  lowStockThreshold?: string;
  images?: Array<{ url: string; filename: string; publicId?: string }>;
  updatedBy?: string;
  customFields?: any[];
}

export interface Category {
  _id: string;
  enabled: boolean;
  description: string;
  categoryName: string;
  categoryId: string;
}

export interface Warehouse {
  _id: string;
  name: string;
  city: string;
  state: string;
  unitNumber: string;
  warehouseId: string;
  enabled?: boolean;
  capacity?: string;
  description?: string;
  country?: string;
  buildingNo?: string;
  streetNumber?: string;
  streetName?: string;
  zipCode?: string;
  operators?: Array<{ name: string; email: string }>;
  updatedAt?: string;
}

export interface InventoryDashboardData {
  totalProducts: number;
  totalWarehouses: number;
  outOfStockCount: number;
  monthlyGrowthPercentage: number;
  disabledWarehouses: number;
  outOfStockThisWeek: number;
  outOfStockProducts: any[];
}
