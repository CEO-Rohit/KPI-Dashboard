const MENU_CATEGORIES = ["Starters", "Mains", "Pasta & Risotto", "Grill", "Desserts", "Beverages"];

const menuItems = [
  // STARS — High Popularity + High Margin
  { id: 1, name: "Truffle Mushroom Risotto", category: "Pasta & Risotto", sellPrice: 24, foodCost: 6.50, popularity: 88, quadrant: "star" },
  { id: 2, name: "Grilled Salmon Fillet", category: "Grill", sellPrice: 32, foodCost: 9.20, popularity: 92, quadrant: "star" },
  { id: 3, name: "Crispy Calamari", category: "Starters", sellPrice: 16, foodCost: 3.80, popularity: 85, quadrant: "star" },
  { id: 4, name: "Wagyu Beef Burger", category: "Mains", sellPrice: 28, foodCost: 8.40, popularity: 90, quadrant: "star" },
  { id: 5, name: "Chocolate Lava Cake", category: "Desserts", sellPrice: 14, foodCost: 3.20, popularity: 82, quadrant: "star" },
  { id: 6, name: "Garlic Prawns", category: "Starters", sellPrice: 18, foodCost: 5.10, popularity: 80, quadrant: "star" },
  { id: 7, name: "Signature Cocktail", category: "Beverages", sellPrice: 16, foodCost: 3.50, popularity: 86, quadrant: "star" },
  { id: 8, name: "Chicken Tikka Bowl", category: "Mains", sellPrice: 22, foodCost: 5.80, popularity: 84, quadrant: "star" },
  { id: 9, name: "Caesar Salad", category: "Starters", sellPrice: 15, foodCost: 3.40, popularity: 78, quadrant: "star" },
  { id: 10, name: "Panna Cotta", category: "Desserts", sellPrice: 12, foodCost: 2.80, popularity: 76, quadrant: "star" },

  // PLOWHORSES — High Popularity + Low Margin
  { id: 11, name: "Classic Margherita Pizza", category: "Mains", sellPrice: 16, foodCost: 6.20, popularity: 94, quadrant: "plowhorse" },
  { id: 12, name: "Fish & Chips", category: "Mains", sellPrice: 18, foodCost: 7.80, popularity: 88, quadrant: "plowhorse" },
  { id: 13, name: "Spaghetti Bolognese", category: "Pasta & Risotto", sellPrice: 17, foodCost: 6.50, popularity: 86, quadrant: "plowhorse" },
  { id: 14, name: "Chicken Wings (12pc)", category: "Starters", sellPrice: 15, foodCost: 6.40, popularity: 90, quadrant: "plowhorse" },
  { id: 15, name: "House Burger", category: "Mains", sellPrice: 16, foodCost: 6.80, popularity: 82, quadrant: "plowhorse" },
  { id: 16, name: "Garlic Bread", category: "Starters", sellPrice: 8, foodCost: 3.50, popularity: 92, quadrant: "plowhorse" },
  { id: 17, name: "Soft Drink", category: "Beverages", sellPrice: 4, foodCost: 1.80, popularity: 96, quadrant: "plowhorse" },
  { id: 18, name: "Fries & Dip", category: "Starters", sellPrice: 9, foodCost: 3.90, popularity: 88, quadrant: "plowhorse" },
  { id: 19, name: "Iced Tea", category: "Beverages", sellPrice: 5, foodCost: 2.20, popularity: 80, quadrant: "plowhorse" },
  { id: 20, name: "Cheese Nachos", category: "Starters", sellPrice: 12, foodCost: 5.10, popularity: 84, quadrant: "plowhorse" },
  { id: 21, name: "Tap Beer", category: "Beverages", sellPrice: 7, foodCost: 3.10, popularity: 90, quadrant: "plowhorse" },

  // PUZZLES — Low Popularity + High Margin
  { id: 22, name: "Lobster Thermidor", category: "Grill", sellPrice: 48, foodCost: 14.00, popularity: 22, quadrant: "puzzle" },
  { id: 23, name: "Duck Confit", category: "Mains", sellPrice: 36, foodCost: 10.80, popularity: 28, quadrant: "puzzle" },
  { id: 24, name: "Butter Chicken", category: "Mains", sellPrice: 34, foodCost: 9.80, popularity: 32, quadrant: "puzzle" },
  { id: 25, name: "Crème Brûlée", category: "Desserts", sellPrice: 14, foodCost: 3.20, popularity: 35, quadrant: "puzzle" },
  { id: 26, name: "Lamb Rack", category: "Grill", sellPrice: 42, foodCost: 12.60, popularity: 26, quadrant: "puzzle" },
  { id: 27, name: "Aged Negroni", category: "Beverages", sellPrice: 18, foodCost: 4.20, popularity: 30, quadrant: "puzzle" },
  { id: 28, name: "Burrata Salad", category: "Starters", sellPrice: 17, foodCost: 4.50, popularity: 34, quadrant: "puzzle" },
  { id: 29, name: "Truffle Fries", category: "Starters", sellPrice: 14, foodCost: 3.60, popularity: 38, quadrant: "puzzle" },
  { id: 30, name: "Premium Wine Glass", category: "Beverages", sellPrice: 22, foodCost: 5.80, popularity: 24, quadrant: "puzzle" },
  { id: 31, name: "Tiramisu", category: "Desserts", sellPrice: 13, foodCost: 3.10, popularity: 40, quadrant: "puzzle" },

  // DOGS — Low Popularity + Low Margin
  { id: 32, name: "Vegetable Soup", category: "Starters", sellPrice: 9, foodCost: 3.80, popularity: 18, quadrant: "dog" },
  { id: 33, name: "Plain Grilled Chicken", category: "Grill", sellPrice: 18, foodCost: 7.60, popularity: 20, quadrant: "dog" },
  { id: 34, name: "House Salad", category: "Starters", sellPrice: 10, foodCost: 4.20, popularity: 16, quadrant: "dog" },
  { id: 35, name: "Steamed Rice Bowl", category: "Mains", sellPrice: 12, foodCost: 5.40, popularity: 14, quadrant: "dog" },
  { id: 36, name: "Fruit Platter", category: "Desserts", sellPrice: 10, foodCost: 4.80, popularity: 12, quadrant: "dog" },
  { id: 37, name: "Sparkling Water", category: "Beverages", sellPrice: 5, foodCost: 2.40, popularity: 22, quadrant: "dog" },
  { id: 38, name: "Mixed Greens Wrap", category: "Mains", sellPrice: 14, foodCost: 6.20, popularity: 15, quadrant: "dog" },
  { id: 39, name: "Onion Rings", category: "Starters", sellPrice: 8, foodCost: 3.60, popularity: 24, quadrant: "dog" },
  { id: 40, name: "Lemon Sorbet", category: "Desserts", sellPrice: 8, foodCost: 3.20, popularity: 10, quadrant: "dog" },
  { id: 41, name: "Club Sandwich", category: "Mains", sellPrice: 14, foodCost: 6.40, popularity: 26, quadrant: "dog" },
  { id: 42, name: "Mineral Water", category: "Beverages", sellPrice: 3, foodCost: 1.60, popularity: 28, quadrant: "dog" },
];

export const getMenuItems = () => menuItems.map(item => ({
  ...item,
  contributionMargin: item.sellPrice - item.foodCost,
  marginPercent: ((item.sellPrice - item.foodCost) / item.sellPrice * 100).toFixed(1),
}));

export const getMenuByCategory = () => {
  const grouped = {};
  MENU_CATEGORIES.forEach(cat => { grouped[cat] = []; });
  menuItems.forEach(item => {
    if (grouped[item.category]) grouped[item.category].push(item);
  });
  return grouped;
};

export const getQuadrantData = () => {
  const items = getMenuItems();
  return items.map(item => ({
    name: item.name,
    x: item.popularity,
    y: item.contributionMargin,
    quadrant: item.quadrant,
    category: item.category,
    sellPrice: item.sellPrice,
    foodCost: item.foodCost,
  }));
};

export { MENU_CATEGORIES };
export default menuItems;
