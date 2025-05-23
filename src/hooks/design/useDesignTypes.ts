
import { Answer } from "@/components/design/QuestionFlow";

// Define t-shirt color options
export const TSHIRT_COLORS = {
  BLACK: "#000000",
  WHITE: "#FFFFFF",
  GREY: "#8A898C",
  BLUE: "#1EAEDB"
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
