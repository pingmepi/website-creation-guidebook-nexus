
import { Answer } from "@/components/design/QuestionFlow";

// Define t-shirt color type
export interface TshirtColor {
  name: string;
  value: string;
}

// Define t-shirt color options
export const TSHIRT_COLORS: { [key: string]: string } = {
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

export interface DesignState {
  // Navigation state
  currentStep: DesignStep;
  currentStage: DesignStage;
  
  // Design data
  selectedTheme: Theme | null;
  answers: Answer[];
  designId: string | null;
  designName: string;
  
  // UI state
  showConfirmation: boolean;
  showLoginDialog: boolean;
  tshirtColor: string;
  designImage?: string;
  isSaving: boolean;
  isGenerating: boolean;
  isLoading: boolean;
  
  // Setters
  setShowConfirmation: (show: boolean) => void;
  setShowLoginDialog: (show: boolean) => void;
  setTshirtColor: (color: string) => void;
  setDesignName: (name: string) => void;
  
  // Handlers
  handleThemeSelect: (theme: Theme) => void;
  handleQuestionFlowComplete: (answers: Answer[]) => void;
  handleConfirmDesign: () => void;
  handleLoginSuccess: () => void;
  handleBackToThemes: () => void;
  handleDesignChange: (designDataUrl: string) => void;
  handleSaveDesign: () => Promise<void>;
  generateDesignWithAI: () => Promise<void>;
}
