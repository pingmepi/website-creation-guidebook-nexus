
import { Answer } from "@/components/design/QuestionFlow";
// Import t-shirt images from the assets index file
import { tshirtColors } from "../../../assets/index";

// Define t-shirt color options with corresponding images
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

export type DesignStep = "preferences" | "design" | "options";
export type DesignStage = "theme-selection" | "question-flow" | "customization";

export interface Theme {
  // Accept both number (for local themes) and string (for Supabase themes)
  id: number | string;
  name: string;
  description?: string;
  color?: string;
  // Either string[] (local themes) or string (Supabase themes)
  category?: string[] | string;
  // Optional fields from Supabase
  created_at?: string;
  is_active?: boolean;
  thumbnail_url?: string;
}

export interface DesignStateData {
  currentStep: DesignStep;
  currentStage: DesignStage;
  selectedTheme: Theme | null;
  answers: Answer[];
  showConfirmation: boolean;
  showLoginDialog: boolean;
  tshirtColor: string;
  designImage?: string;
  isSaving: boolean;
  isGenerating: boolean;
  designId: string | null;
  designName: string;
  isLoading: boolean;
  hasUnsavedChanges: boolean;
}
