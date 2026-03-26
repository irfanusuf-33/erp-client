import { StateCreator } from "zustand";
import { axiosInstance } from "@/lib/axiosInstance";
import { Product, Category, Warehouse } from "@/types/inventory.types";

export type InventorySlice = {
  products: Product[];
  categories: Category[];
  warehouses: Warehouse[];
  inventoryLoading: boolean;
  inventoryErrorMsg: string;

  // Products
  getProducts: (params?: { page?: number; limit?: number }) => Promise<any>;
  advancedSearchProducts: (filters: any) => Promise<any>;
  getSingleProduct: (productId: string) => Promise<any>;
  addProduct: (productData: any, images: File[]) => Promise<any>;
  updateProduct: (productId: string, productData: any, images?: File[], existingImages?: any[]) => Promise<any>;
  toggleProductStatus: (productIds: string[]) => Promise<any>;
  generateProductId: () => Promise<any>;
  saveProductTemplate: (templateData: any) => Promise<any>;
  getProductForEdit: (productId: string) => Promise<any>;

  // Categories
  getAllCategories: (page?: number, limit?: number, search?: string) => Promise<any>;
  getCategory: (categoryId: string) => Promise<any>;
  addCategory: (categoryData: any) => Promise<any>;
  updateCategory: (categoryId: string, categoryData: any) => Promise<any>;
  toggleCategoryStatus: (categoryIds: string) => Promise<any>;
  searchCategories: (search: string) => Promise<any>;
  removeChildCategory: (parentCategoryId: string, childCategoryId: string) => Promise<any>;

  // Warehouses
  getAllWarehouses: () => Promise<any>;
  getWarehouseDetail: (id: string) => Promise<any>;
  addWarehouse: (warehouseData: any) => Promise<any>;
  updateWarehouse: (id: string, warehouseData: any) => Promise<any>;
  toggleWarehouseStatus: (warehouseIds: string[]) => Promise<any>;
  searchWarehouses: (search: string) => Promise<any>;

  // Templates
  getTemplates: (page?: number, limit?: number, search?: string) => Promise<any>;
  getTemplate: (templateId: string) => Promise<any>;
  deleteTemplate: (templateId: string) => Promise<any>;

  // Dashboard
  getInventoryDashboard: () => Promise<any>;

  // IAM user search (used in warehouse operators)
  searchUsersForInventory: (searchTerm: string) => Promise<any>;
};

export const createInventorySlice: StateCreator<InventorySlice> = (set) => ({
  products: [],
  categories: [],
  warehouses: [],
  inventoryLoading: false,
  inventoryErrorMsg: "",

  // ─── Products ────────────────────────────────────────────────────────────────

  // GET /inventory/product/all
  // Response: { success, data: { items[], pages, totalItems } }
  getProducts: async (params) => {
    try {
      const res = await axiosInstance.get("/inventory/product/all", { params });
      // res.data = { success, data: { items, pages, totalItems } }
      return res.data;
    } catch (e: any) {
      return { success: false, msg: e?.response?.data?.msg || "Failed to fetch products" };
    }
  },

  // POST /inventory/product/advanced-search
  // Response: { success, data: { items[], totalItems } }
  advancedSearchProducts: async (filters) => {
    try {
      const res = await axiosInstance.post("/inventory/product/advanced-search", filters);
      return res.data;
    } catch (e: any) {
      return { success: false, msg: e?.response?.data?.msg || "Failed to search products" };
    }
  },

  // GET /inventory/product/:productId
  // Response: { success, data: productObject }
  getSingleProduct: async (productId) => {
    try {
      const res = await axiosInstance.get(`/inventory/product/${productId}`);
      // controller sends: { success, data: result.data }
      return res.data.data || res.data;
    } catch (e: any) {
      throw new Error(e?.response?.data?.msg || "Failed to fetch product details");
    }
  },

  // POST /inventory/product  (multipart/form-data)
  // Response: { success, msg }
  addProduct: async (productData, images) => {
    try {
      const formData = new FormData();
      images.forEach((file) => formData.append("images", file));
      Object.keys(productData).forEach((key) =>
        formData.append(key, JSON.stringify(productData[key]))
      );
      const res = await axiosInstance.post("/inventory/product", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (e: any) {
      return { success: false, msg: e?.response?.data?.msg || "Failed to save product" };
    }
  },

  // PUT /inventory/product/:productId  (multipart/form-data)
  // Response: { success, msg }
  updateProduct: async (productId, productData, images, existingImages) => {
    try {
      const formData = new FormData();
      if (images?.length) images.forEach((file) => formData.append("images", file));
      if (existingImages?.length)
        formData.append("existingImages", JSON.stringify(existingImages));
      Object.keys(productData).forEach((key) => {
        if (key !== "images") formData.append(key, JSON.stringify(productData[key]));
      });
      const res = await axiosInstance.put(`/inventory/product/${productId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (e: any) {
      return { success: false, msg: e?.response?.data?.msg || "Failed to update product" };
    }
  },

  // POST /inventory/product/status
  // Body: { productIds: string[] }
  // Response: { success, msg }
  toggleProductStatus: async (productIds) => {
    try {
      const res = await axiosInstance.post("/inventory/product/status", { productIds });
      return res.data;
    } catch (e: any) {
      return { success: false, msg: e?.response?.data?.msg || "Failed to toggle product status" };
    }
  },

  // GET /inventory/product/generateId
  // Response: { success, data: { productId } }
  generateProductId: async () => {
    try {
      const res = await axiosInstance.get("/inventory/product/generateId");
      return res.data;
    } catch (e: any) {
      return { success: false, msg: e?.response?.data?.msg || "Failed to generate product ID" };
    }
  },

  // POST /inventory/template/field
  // Body: { template: { templateId, description, form[] } }
  // Response: { success, msg }
  saveProductTemplate: async (templateData) => {
    try {
      if (!templateData.groups || templateData.groups.length === 0) {
        return { success: false, msg: "No custom fields to save" };
      }
      const payload = {
        templateId: templateData.templateName,
        description: templateData.templateDesc,
        form: templateData.groups.map((group: any) => ({
          group: group.groupName,
          fields: group.fields,
        })),
      };
      const res = await axiosInstance.post("/inventory/template/field", { template: payload });
      return res.data;
    } catch (e: any) {
      return { success: false, msg: e?.response?.data?.msg || "Failed to save template" };
    }
  },

  // GET /inventory/product/:productId/edit
  // Response: { success, data: { data: productWithCustomFields } }
  getProductForEdit: async (productId) => {
    try {
      const res = await axiosInstance.get(`/inventory/product/${productId}/edit`);
      // controller: { success, data: result.data }  where result.data = formatted product
      return res.data?.data || res.data;
    } catch (e: any) {
      return { success: false, msg: e?.response?.data?.msg || "Failed to fetch product for edit" };
    }
  },

  // ─── Categories ──────────────────────────────────────────────────────────────

  // GET /inventory/category/all?page=&limit=&search=
  // Response: { success, data: { items[], totalItems, pages } }
  getAllCategories: async (page = 1, limit = 10, search = "") => {
    try {
      const res = await axiosInstance.get("/inventory/category/all", {
        params: { page, limit, search },
      });
      // controller sends: { success, data: result.data }
      // result.data = { items, pages, totalItems }
      return { success: true, data: res.data.data };
    } catch (e: any) {
      return { success: false, msg: e?.response?.data?.msg || "Failed to fetch categories" };
    }
  },

  // GET /inventory/category/:categoryId
  // Response: { success, data: { category, children, parents } }
  getCategory: async (categoryId) => {
    try {
      const res = await axiosInstance.get(`/inventory/category/${categoryId}`);
      return { success: true, data: res.data.data };
    } catch (e: any) {
      return { success: false, msg: e?.response?.data?.msg || "Failed to fetch category" };
    }
  },

  // POST /inventory/category
  // Body: { categoryId, categoryName, description, childCategories[], enabled }
  // Response: { success, msg }
  addCategory: async (categoryData) => {
    try {
      const res = await axiosInstance.post("/inventory/category", categoryData);
      return res.data;
    } catch (e: any) {
      return { success: false, msg: e?.response?.data?.msg || "Failed to create category" };
    }
  },

  // PUT /inventory/category/:categoryId
  // Body: partial category fields
  // Response: { success, msg }
  updateCategory: async (categoryId, categoryData) => {
    try {
      const res = await axiosInstance.put(`/inventory/category/${categoryId}`, categoryData);
      return res.data;
    } catch (e: any) {
      return { success: false, msg: e?.response?.data?.msg || "Failed to update category" };
    }
  },

  // POST /inventory/category/status
  // Body: { categoryIds: string[] }  (backend accepts string[] but frontend passes single string)
  // Response: { success, msg }
  toggleCategoryStatus: async (categoryIds) => {
    try {
      const ids = Array.isArray(categoryIds) ? categoryIds : [categoryIds];
      const res = await axiosInstance.post("/inventory/category/status", { categoryIds: ids });
      return res.data;
    } catch (e: any) {
      return { success: false, msg: e?.response?.data?.msg || "Failed to update category status" };
    }
  },

  // GET /inventory/category/search?search=
  // Response: { success, data: { items[], totalItems, pages } }
  searchCategories: async (search) => {
    try {
      const res = await axiosInstance.get("/inventory/category/search", { params: { search } });
      // mgr returns findAll result → { items[], pages, totalItems }
      const items = res.data.data?.items || res.data.data || [];
      return { success: true, data: items };
    } catch (e: any) {
      return { success: false, data: [], msg: e?.response?.data?.msg || "Failed to search categories" };
    }
  },

  // POST /inventory/category/remove-child
  // Body: { parentCategoryId, childCategoryId }
  // Response: { success, msg }
  removeChildCategory: async (parentCategoryId, childCategoryId) => {
    try {
      const res = await axiosInstance.post("/inventory/category/remove-child", {
        parentCategoryId,
        childCategoryId,
      });
      return res.data;
    } catch (e: any) {
      return { success: false, msg: e?.response?.data?.msg || "Failed to remove child category" };
    }
  },

  // ─── Warehouses ──────────────────────────────────────────────────────────────

  // GET /inventory/warehouse/all
  // Response: { success, data: { items[], pages, totalItems } }
  getAllWarehouses: async () => {
    try {
      const res = await axiosInstance.get("/inventory/warehouse/all");
      // controller: { success, data: result.data }
      // result.data = { items, pages, totalItems }
      return { success: true, data: res.data };
    } catch (e: any) {
      return { success: false, msg: e?.response?.data?.msg || "Failed to fetch warehouses" };
    }
  },

  // GET /inventory/warehouse/:id
  // Response: { success, data: warehouseObject }
  getWarehouseDetail: async (id) => {
    try {
      const res = await axiosInstance.get(`/inventory/warehouse/${id}`);
      // controller: { success, data: result.data }
      return { success: true, data: res.data };
    } catch (e: any) {
      return { success: false, msg: e?.response?.data?.msg || "Failed to get warehouse" };
    }
  },

  // POST /inventory/warehouse
  // Body: warehouse object
  // Response: { success, msg }
  addWarehouse: async (warehouseData) => {
    try {
      const res = await axiosInstance.post("/inventory/warehouse", warehouseData);
      return res.data;
    } catch (e: any) {
      return { success: false, msg: e?.response?.data?.msg || "Failed to create warehouse" };
    }
  },

  // PUT /inventory/warehouse/:id
  // Body: partial warehouse fields
  // Response: { success, msg }
  updateWarehouse: async (id, warehouseData) => {
    try {
      const res = await axiosInstance.put(`/inventory/warehouse/${id}`, warehouseData);
      return res.data;
    } catch (e: any) {
      return { success: false, msg: e?.response?.data?.msg || "Failed to update warehouse" };
    }
  },

  // POST /inventory/warehouse/status
  // Body: { warehouseIds: string[] }
  // Response: { success, msg }
  toggleWarehouseStatus: async (warehouseIds) => {
    try {
      const res = await axiosInstance.post("/inventory/warehouse/status", { warehouseIds });
      return res.data;
    } catch (e: any) {
      return { success: false, msg: e?.response?.data?.msg || "Failed to update warehouse status" };
    }
  },

  // GET /inventory/warehouse/search?search=
  // Response: { success, data: { items[], pages, totalItems } }
  searchWarehouses: async (search) => {
    try {
      const res = await axiosInstance.get("/inventory/warehouse/search", { params: { search } });
      // mgr returns findAll result → { items[], pages, totalItems }
      const items = res.data.data?.items || res.data.data || [];
      return { success: true, data: items };
    } catch (e: any) {
      return { success: false, data: [], msg: e?.response?.data?.msg || "Failed to search warehouses" };
    }
  },

  // ─── Templates ───────────────────────────────────────────────────────────────

  // GET /inventory/templates/all?page=&limit=&search=
  // Response: { success, data: { items[], pages, totalItems } }
  getTemplates: async (page = 1, limit = 10, search = "") => {
    try {
      const res = await axiosInstance.get("/inventory/templates/all", {
        params: { page, limit, search },
      });
      return { success: true, data: res.data };
    } catch (e: any) {
      return { success: false, msg: e?.response?.data?.msg || "Failed to fetch templates" };
    }
  },

  // GET /inventory/template/:templateId
  // Response: { success, data: templateObject }
  getTemplate: async (templateId) => {
    try {
      const res = await axiosInstance.get(`/inventory/template/${templateId}`);
      return { success: true, data: res.data };
    } catch (e: any) {
      return { success: false, msg: e?.response?.data?.msg || "Failed to fetch template" };
    }
  },

  // DELETE /inventory/template/:templateId  (no route in backend — using template field endpoint)
  // Note: backend has no DELETE template route; we handle gracefully
  deleteTemplate: async (templateId) => {
    try {
      const res = await axiosInstance.delete(`/inventory/template/${templateId}`);
      return res.data;
    } catch (e: any) {
      return { success: false, msg: e?.response?.data?.msg || "Failed to delete template" };
    }
  },

  // ─── Dashboard ───────────────────────────────────────────────────────────────

  // GET /inventory/dashboard
  // Response: { success, data: { totalProducts, totalWarehouses, disabledWarehouses,
  //             outOfStockCount, outOfStockThisWeek, monthlyGrowthPercentage, outOfStockProducts[] } }
  getInventoryDashboard: async () => {
    try {
      const res = await axiosInstance.get("/inventory/dashboard");
      return { success: true, data: res.data };
    } catch (e: any) {
      return { success: false, msg: e?.response?.data?.msg || "Failed to fetch dashboard" };
    }
  },

  // ─── IAM user search (for warehouse operators) ───────────────────────────────

  // GET /iam/users/search?search=
  // Response: { success, users[] }
  searchUsersForInventory: async (searchTerm) => {
    try {
      const res = await axiosInstance.get(`/iam/users/search?search=${searchTerm}`);
      return res.data;
    } catch (e: any) {
      return { success: false, users: [] };
    }
  },
});
