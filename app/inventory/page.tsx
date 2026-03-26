"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGlobalStore } from "@/store";
import { Package, Warehouse, Archive, RefreshCw } from "lucide-react";

export default function InventoryDashboard() {
  const { getInventoryDashboard } = useGlobalStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const [dashboardData, setDashboardData] = useState({
    cardData: [
      { heading: "Total Products", number: "—", label: "Loading...", color: "#3B8AEC", icon: <Package className="w-6 h-6" /> },
      { heading: "Total Warehouse", number: "—", label: "Loading...", color: "#EF4444", icon: <Warehouse className="w-6 h-6" /> },
      { heading: "Out of Stock Products", number: "—", label: "Loading...", color: "#EF4444", icon: <Archive className="w-6 h-6" /> },
      { heading: "Product in Transitions", number: 42, label: "+10 this week", color: "#707070", icon: <RefreshCw className="w-6 h-6" /> },
    ],
    productsData: [] as any[],
  });

  useEffect(() => { getData(); }, []);

  async function getData() {
    setLoading(true);
    const res = await getInventoryDashboard();
    if (res.success) {
      // slice returns { success, data: res.data }
      // res.data (from axios) = { success, data: { totalProducts, totalWarehouses, ... } }
      const data = res.data?.data || res.data;
      setDashboardData((prev) => ({
        ...prev,
        cardData: [
          { ...prev.cardData[0], number: data.totalProducts ?? "—", label: `+${data.monthlyGrowthPercentage ?? 0}% vs last month` },
          { ...prev.cardData[1], number: data.totalWarehouses ?? "—", label: `${data.disabledWarehouses ?? 0} disabled warehouses` },
          { ...prev.cardData[2], number: data.outOfStockCount ?? "—", label: `+${data.outOfStockThisWeek ?? 0} this week` },
          { ...prev.cardData[3] },
        ],
        productsData: data.outOfStockProducts || [],
      }));
    }
    setLoading(false);
  }

  return (
    <div className="p-6 space-y-6">
      {/* Overview Cards */}
      <div>
        <h1 className="text-xl font-semibold mb-4">Overview</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {dashboardData.cardData.map((card, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm ring-1 ring-foreground/10 p-4 flex items-start gap-3">
              <div className="w-1 self-stretch rounded-full" style={{ backgroundColor: card.color }} />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-sm font-medium text-gray-600">{card.heading}</h1>
                  <div className="text-gray-400">{card.icon}</div>
                </div>
                <h1 className="text-2xl font-bold">{loading ? "—" : card.number}</h1>
                <label className="text-xs" style={{ color: card.color }}>{card.label}</label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Inventory Alert Table */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-foreground/10 p-4">
        <h1 className="text-lg font-semibold mb-4">Inventory Alert</h1>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 font-medium text-gray-600">ID</th>
                <th className="text-left py-2 px-3 font-medium text-gray-600">Name</th>
                <th className="text-left py-2 px-3 font-medium text-gray-600">Category</th>
                <th className="text-left py-2 px-3 font-medium text-gray-600">Quantity</th>
                <th className="text-left py-2 px-3 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">Loading...</td></tr>
              ) : dashboardData.productsData.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">No Inventory Alerts</td></tr>
              ) : (
                dashboardData.productsData.map((product: any) => (
                  <tr
                    key={product.productId}
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/inventory/product/productDetails/${product.productId}`)}
                  >
                    <td className="py-2 px-3">{product.productId}</td>
                    <td className="py-2 px-3">{product.name}</td>
                    <td className="py-2 px-3">
                      {Array.isArray(product.category)
                        ? product.category.length > 2
                          ? `${product.category[0]}, ${product.category[1]} ...`
                          : product.category.join(", ")
                        : product.category}
                    </td>
                    <td className="py-2 px-3">{product.quantity}</td>
                    <td className="py-2 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        product.status === "HighStock" ? "bg-green-100 text-green-700" :
                        product.status === "LowStock" ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {product.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
