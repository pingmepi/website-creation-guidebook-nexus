
import { useState } from "react";
import { DesignStep, DesignStage, Theme } from "./types";
import { Answer } from "@/components/design/QuestionFlow";
import { useUser } from "@/contexts/UserContext";

export function useDesignNavigation() {
  const { isAuthenticated } = useUser();
  const [currentStep, setCurrentStep] = useState<DesignStep>("preferences");
  const [currentStage, setCurrentStage] = useState<DesignStage>("theme-selection");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  // Navigation handlers
  const handleThemeSelect = (
    theme: Theme, 
    setSelectedTheme: (theme: Theme | null) => void
  ) => {
    console.log("Theme selected:", theme);
    setSelectedTheme(theme);
    setCurrentStage("question-flow");
  };

  const handleQuestionFlowComplete = (
    questionAnswers: Answer[],
    setAnswers: (answers: Answer[]) => void
  ) => {
    console.log("Question flow complete with answers:", questionAnswers);
    setAnswers(questionAnswers);
    setShowConfirmation(true);
  };

  const handleConfirmDesign = (
    proceedToDesignStage: () => Promise<void>
  ) => {
    console.log("Design confirmed");
    setShowConfirmation(false);

    // Check if user is logged in
    if (!isAuthenticated) {
      console.log("User not authenticated, showing login dialog");
      setShowLoginDialog(true);
      return;
    }

    proceedToDesignStage();
  };

  const handleLoginSuccess = (
    proceedToDesignStage: () => Promise<void>
  ) => {
    console.log("Login success callback in Design page");
    setShowLoginDialog(false);
    proceedToDesignStage();
  };

  const handleBackToThemes = (
    setSelectedTheme: (theme: Theme | null) => void
  ) => {
    console.log("Going back to themes");
    setCurrentStage("theme-selection");
    setSelectedTheme(null);
  };

  const proceedToDesignStage = (
    selectedTheme: Theme | null,
    answers: Answer[],
    generateDesignWithAI: () => Promise<void>,
    setDesignImage: (image?: string) => void
  ) => {
    console.log("Proceeding to design stage");
    setCurrentStep("design");
    setCurrentStage("customization");

    // Generate design with AI using the selected theme and answers
    if (selectedTheme && answers.length > 0) {
      generateDesignWithAI().catch((error) => {
        console.error("Error generating AI design:", error);
        setDesignImage(undefined);
      });
    } else {
      // Set placeholder design image if no theme or answers
      setDesignImage(undefined);
    }
  };

  // This method is specifically for loading saved designs
  const setDesignStage = () => {
    console.log("Setting design stage for loaded design");
    setCurrentStep("design");
    setCurrentStage("customization");
  };

  return {
    currentStep,
    currentStage,
    showConfirmation,
    showLoginDialog,
    setCurrentStep,
    setCurrentStage,
    setShowConfirmation,
    setShowLoginDialog,
    handleThemeSelect,
    handleQuestionFlowComplete,
    handleConfirmDesign,
    handleLoginSuccess,
    handleBackToThemes,
    proceedToDesignStage,
    setDesignStage
  };
}
