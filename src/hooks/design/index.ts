
import { useDesignNavigation } from "./useDesignNavigation";
import { useDesignData } from "./useDesignData";
import { useDesignGeneration } from "./useDesignGeneration";
import { useDesignUI } from "./useDesignUI";
import { Theme } from "./types";
import { Answer } from "@/components/design/QuestionFlow";

export function useDesignState() {
  // Use all the individual hooks
  const navigation = useDesignNavigation();
  // Pass the setDesignStage function to useDesignData to ensure proper stage setting when loading designs
  const data = useDesignData(navigation.setDesignStage);
  const generation = useDesignGeneration();
  const ui = useDesignUI();

  // Implement coordinating handler methods that connect the individual hooks
  const handleThemeSelect = (theme: Theme) => {
    navigation.handleThemeSelect(theme, data.setSelectedTheme);
  };

  const handleQuestionFlowComplete = (questionAnswers: Answer[]) => {
    navigation.handleQuestionFlowComplete(questionAnswers, data.setAnswers);
  };

  const handleConfirmDesign = () => {
    navigation.handleConfirmDesign(proceedToDesignStage);
  };

  const handleLoginSuccess = () => {
    navigation.handleLoginSuccess(proceedToDesignStage);
  };

  const handleBackToThemes = () => {
    navigation.handleBackToThemes(data.setSelectedTheme);
  };

  const proceedToDesignStage = async () => {
    navigation.proceedToDesignStage(
      data.selectedTheme,
      data.answers,
      generateDesignWithAI,
      data.setDesignImage
    );
  };

  const generateDesignWithAI = async () => {
    await generation.generateDesignWithAI(
      data.selectedTheme,
      data.answers,
      data.setDesignImage,
      data.saveDesignToDatabase
    );
  };

  const handleSaveDesign = async () => {
    if (!navigation.showLoginDialog && !ui.isSaving) {
      const success = await ui.handleSaveDesign(
        data.designImage,
        data.designId,
        data.designName,
        data.tshirtColor,
        data.selectedTheme,
        data.answers,
        data.setDesignId
      );
      
      if (!success && !navigation.showLoginDialog) {
        navigation.setShowLoginDialog(true);
      }
    }
  };

  // Return a unified API that matches the original hook
  return {
    // Navigation state
    currentStep: navigation.currentStep,
    currentStage: navigation.currentStage,
    
    // Design data
    selectedTheme: data.selectedTheme,
    answers: data.answers,
    designId: data.designId,
    designName: data.designName,
    tshirtColor: data.tshirtColor,
    selectedSize: data.selectedSize,
    designImage: data.designImage,
    
    // UI state
    showConfirmation: navigation.showConfirmation,
    showLoginDialog: navigation.showLoginDialog,
    isSaving: ui.isSaving,
    isGenerating: generation.isGenerating,
    isLoading: data.isLoading,
    
    // Setters
    setShowConfirmation: navigation.setShowConfirmation,
    setShowLoginDialog: navigation.setShowLoginDialog,
    setTshirtColor: data.setTshirtColor,
    setSelectedSize: data.setSelectedSize,
    setDesignName: data.setDesignName,
    
    // Handlers
    handleThemeSelect,
    handleQuestionFlowComplete,
    handleConfirmDesign,
    handleLoginSuccess,
    handleBackToThemes,
    handleDesignChange: data.handleDesignChange,
    handleSaveDesign,
    generateDesignWithAI
  };
}

// Re-export types and constants
export * from "./types";
