export const PRIMARY_CATEGORY = "Electronics";

export const ELECTRONICS_SUBCATEGORIES = [
  "Phones",
  "Laptops",
  "Tablets",
  "Audio",
  "TV",
  "Gaming",
  "Accessories",
  "Monitors",
  "Storage",
  "Cameras",
  "Wearables",
  "Smart home",
  "Desktops",
  "Printers",
  "Networking",
  "Drones",
  "General",
] as const;

export type ElectronicsSubcategory = (typeof ELECTRONICS_SUBCATEGORIES)[number];
