export const BUSINESS_PROFILE = {
  name: "Rasoi Master",
  type: "Casual-dining restaurant with delivery channel",
  seatingCapacity: 60,
  tableCount: 18,
  operatingHours: { open: 11, close: 23 },
  hoursPerDay: 12,
  averageCheck: { dineIn: 28, delivery: 22 },
  dailyCoverTarget: { dineIn: { min: 150, max: 180 }, delivery: { min: 40, max: 60 } },
  monthlyRevenueTarget: 180000,
  staffCount: { fullTime: 14, partTime: 8, total: 22 },
  menuSize: 42,
  menuCategories: 6,
  currency: "$",
};

export const KPI_DOMAINS = [
  { id: "revenue", label: "Revenue", icon: "DollarSign", color: "#10b981" },
  { id: "operations", label: "Operations", icon: "Activity", color: "#6366f1" },
  { id: "orders", label: "Orders & Menu", icon: "UtensilsCrossed", color: "#f59e0b" },
  { id: "staff", label: "Staff", icon: "Users", color: "#8b5cf6" },
  { id: "customer", label: "Customer", icon: "Heart", color: "#ec4899" },
  { id: "inventory", label: "Inventory", icon: "Package", color: "#14b8a6" },
  { id: "roi", label: "ROI & Growth", icon: "TrendingUp", color: "#f97316" },
];

export const TIME_RANGES = [
  { id: "today", label: "Today" },
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
];

export const ROLES = [
  { id: "manager", label: "Manager", description: "Operational focus" },
  { id: "owner", label: "Owner", description: "Strategic & financial" },
];
