
import { Answer } from "@/components/design/QuestionFlow";
import { Theme } from "@/hooks/useDesignState";

export interface AiGeneratedDesign {
  id: string;
  user_id: string;
  prompt: string;
  design_image: string;
  created_at: string;
  is_favorite: boolean;
  theme_id?: string;
}
