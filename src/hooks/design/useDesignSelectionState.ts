
import { useState } from "react";
import { Answer } from "@/components/design/QuestionFlow";
import { Theme } from "./types";

export function useDesignSelectionState() {
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  
  const handleThemeSelect = (theme: Theme) => {
    setSelectedTheme(theme);
  };
  
  const handleQuestionFlowComplete = (questionAnswers: Answer[]) => {
    setAnswers(questionAnswers);
  };

  return {
    selectedTheme,
    answers,
    setSelectedTheme,
    setAnswers,
    handleThemeSelect,
    handleQuestionFlowComplete
  };
}
