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

export const DISH_TYPE_UNITS = {
    BY_PIECE: ["pieces"],
    SOUP_STEW: ["liters"],
    SOLID_IN_SOUP: ["pieces"],
    DRY_SCOOPED: ["scoops", "grams (g)", "kilograms (kg)", "cups", "servings"],
    SAUCE_BASED: ["grams (g)", "kilograms (kg)", "servings", "cups", "pieces"],
};

export const DISH_TYPES = [
    {
        key: "BY_PIECE",
        icon: "Drumstick",
        label: "By Piece",
        desc: "Countable items served per piece",
        example: "e.g. fried chicken, pork chop, egg",
    },
    {
        key: "SOUP_STEW",
        icon: "Soup",
        label: "Soup / Stew",
        desc: "Liquid-based dishes served by volume",
        example: "e.g. arroz caldo, lugaw, bulalo",
    },
    {
        key: "SOLID_IN_SOUP",
        icon: "FlameKindling",
        label: "Solid in Soup",
        desc: "Has both solid components and soup",
        example: "e.g. sinigang, nilaga, tinola",
    },
    {
        key: "DRY_SCOOPED",
        icon: "Wheat",
        label: "Dry / Scooped",
        desc: "Served by scoop or weight",
        example: "e.g. rice, pancit, chopsuey",
    },
    {
        key: "SAUCE_BASED",
        icon: "ChefHat",
        label: "Sauce-Based",
        desc: "Solid dish with thick sauce, not soup",
        example: "e.g. adobo, kaldereta, menudo",
    },
];

export const DEFAULT_PRODUCTS = [];
