
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDesignHandlers } from "./design/useDesignHandlers";
import { useDesignFetch } from "./design/useDesignFetch";
import { TSHIRT_COLORS } from "./design/useDesignTypes";

export { TSHIRT_COLORS } from "./design/useDesignTypes";
export type { DesignStep, DesignStage, Theme } from "./design/useDesignTypes";

export function useDesignState() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    currentStep,
    currentStage,
    selectedTheme,
    answers,
    showConfirmation,
    showLoginDialog,
    tshirtColor,
    designImage,
    isSaving,
    isGenerating,
    designId,
    designName,
    hasUnsavedChanges,
    setShowConfirmation,
    setShowLoginDialog,
    setTshirtColor,
    setDesignName,
    setAnswers,
    setDesignImage,
    setSelectedTheme,
    setCurrentStep,
    setCurrentStage,
    setDesignId,
    handleThemeSelect,
    handleQuestionFlowComplete,
    handleConfirmDesign,
    handleLoginSuccess,
    handleBackToThemes,
    handleDesignChange,
    handleSaveDesign,
    generateDesignWithAI
  } = useDesignHandlers();

  const { fetchDesignData, isLoading } = useDesignFetch();
  
  // Extract design ID from URL query parameters on component mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    
    if (id) {
      console.log("Design ID found in URL:", id);
      setDesignId(id);
      fetchDesignData(
        id,
        setDesignName,
        setTshirtColor,
        setDesignImage,
        setAnswers,
        setSelectedTheme,
        setCurrentStep,
        setCurrentStage
      );
    } else {
      // Generate a design name using the current date and time if none exists
      if (!designName) {
        const date = new Date();
        setDesignName(`Design ${date.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "numeric"
        })}`);
      }
    }
  }, [location.search]);
  
  return {
    currentStep,
    currentStage,
    selectedTheme,
    answers,
    showConfirmation,
    showLoginDialog,
    tshirtColor,
    designImage,
    isSaving,
    isGenerating,
    designId,
    designName,
    isLoading,
    hasUnsavedChanges,
    setShowConfirmation,
    setShowLoginDialog,
    setTshirtColor,
    setDesignName,
    handleThemeSelect,
    handleQuestionFlowComplete,
    handleConfirmDesign,
    handleLoginSuccess,
    handleBackToThemes,
    handleDesignChange,
    handleSaveDesign,
    generateDesignWithAI
  };
}
