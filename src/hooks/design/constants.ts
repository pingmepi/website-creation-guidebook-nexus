// Centralized design constants and color definitions
import { tshirtColors } from "../../assets";

// Define t-shirt color options
export const TSHIRT_COLORS = {
  BLACK: "#000000",
  WHITE: "#FFFFFF",
  RED: "#DC2626",
  GREY: "#8A898C",
  BLUE: "#1EAEDB"
};

// Map colors to their corresponding t-shirt images using proper imports
export const TSHIRT_COLOR_IMAGES = {
  "#000000": tshirtColors.black,  // Black
  "#FFFFFF": tshirtColors.white,  // White
  "#DC2626": tshirtColors.red,    // Red
  "#8A898C": tshirtColors.grey,   // Grey
  "#1EAEDB": tshirtColors.blue    // Blue
};

// Available t-shirt sizes
export const TSHIRT_SIZES = [
  { name: "XS", value: "XS" },
  { name: "S", value: "S" },
  { name: "M", value: "M" },
  { name: "L", value: "L" },
  { name: "XL", value: "XL" },
  { name: "XXL", value: "XXL" }
];

export const DEFAULT_CANVAS_SIZE = 300;
export const DEFAULT_TSHIRT_COLOR = TSHIRT_COLORS.WHITE;
export const DEFAULT_SIZE = "M";