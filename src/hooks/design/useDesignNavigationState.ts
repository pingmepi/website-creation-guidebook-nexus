
import { useState } from "react";
import { DesignStage, DesignStep } from "./types";

export function useDesignNavigationState() {
  const [currentStep, setCurrentStep] = useState<DesignStep>("preferences");
  const [currentStage, setCurrentStage] = useState<DesignStage>("theme-selection");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  
  const navigateToQuestionFlow = () => {
    setCurrentStage("question-flow");
  };
  
  const navigateToCustomization = () => {
    setCurrentStep("design");
    setCurrentStage("customization");
  };
  
  const navigateToThemeSelection = () => {
    setCurrentStage("theme-selection");
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
    navigateToQuestionFlow,
    navigateToCustomization,
    navigateToThemeSelection
  };
}
