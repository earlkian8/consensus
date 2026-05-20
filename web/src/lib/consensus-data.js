export const PLAN_COLORS = [
    "#1D9E75",
    "#534AB7",
    "#BA7517",
    "#D85A30",
    "#185FA5",
    "#0F6E56",
    "#993556",
];

export const PLAN_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

export const PRODUCT_CATEGORIES = [
    "Main dish",
    "Side dish",
    "Soup / Stew",
    "Bread / Pastry",
    "Dessert",
    "Beverage",
    "Snack",
];

export const PRODUCT_UNITS = [
    "servings",
    "portions",
    "slices",
    "pieces",
    "grams (g)",
    "kilograms (kg)",
    "cups",
    "liters (L)",
    "packs",
    "trays",
    "bowls",
    "orders",
];

export const DISPOSITIONS = [
    "Given to staff as meal",
    "Donated to charity",
    "Sold as discounted takeaway",
    "Repurposed into new dish",
    "Composted",
    "Discarded",
];

export const CONDITIONS = ["Still sellable", "Repurposable", "Must discard"];

export const DEFAULT_PRODUCTS = [
    {
        id: 1,
        name: "Garlic Fried Rice",
        cat: "Side dish",
        qty: 60,
        unit: "servings",
        cost: 15,
        notes: "",
    },
    {
        id: 2,
        name: "Chicken Adobo",
        cat: "Main dish",
        qty: 45,
        unit: "servings",
        cost: 120,
        notes: "Popular daily",
    },
    {
        id: 3,
        name: "Sinigang na Baboy",
        cat: "Soup / Stew",
        qty: 30,
        unit: "bowls",
        cost: 95,
        notes: "",
    },
    {
        id: 4,
        name: "Pandesal",
        cat: "Bread / Pastry",
        qty: 80,
        unit: "pieces",
        cost: 8,
        notes: "Morning only",
    },
];
