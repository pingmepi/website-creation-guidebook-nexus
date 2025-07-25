
import { useState } from "react";
import { Answer } from "@/components/design/QuestionFlow";
import { Theme, DesignStage, DesignStep } from "./types";
import { useUser } from "@/contexts/UserContext";
import { toast } from "@/hooks/use-toast";
import { useDesignStorage } from "./useDesignStorage";
import { useDesignGeneration } from "./useDesignGeneration";

export function useDesignHandlers() {
  const { isAuthenticated, user } = useUser();
  const [currentStep, setCurrentStep] = useState<DesignStep>("preferences");
  const [currentStage, setCurrentStage] = useState<DesignStage>("theme-selection");
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [designId, setDesignId] = useState<string | null>(null);
  const [designName, setDesignName] = useState<string>("");
  const [tshirtColor, setTshirtColor] = useState("#FFFFFF"); // Default to white
  const [designImage, setDesignImage] = useState<string | undefined>(undefined);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const { saveDesignToDatabase, isSaving } = useDesignStorage();
  const { generateDesignWithAI, isGenerating } = useDesignGeneration();

  
  const handleThemeSelect = (theme: Theme) => {
    setSelectedTheme(theme);
    setCurrentStage("question-flow");
  };
  
  const handleQuestionFlowComplete = (questionAnswers: Answer[]) => {
    setAnswers(questionAnswers);
    setShowConfirmation(true);
  };
  
  const handleConfirmDesign = () => {
    setShowConfirmation(false);
    
    // Check if user is logged in
    if (!isAuthenticated) {
      setShowLoginDialog(true);
      return;
    }
    
    proceedToDesignStage();
  };
  
  const handleLoginSuccess = () => {
    setShowLoginDialog(false);
    proceedToDesignStage();
  };
  
  const proceedToDesignStage = async () => {
    setCurrentStep("design");
    setCurrentStage("customization");
    
    // Generate design with AI using the selected theme and answers
    if (selectedTheme && answers.length > 0) {
      await generateDesignWithAI(
        selectedTheme, 
        answers, 
        setDesignImage,
        async (imageUrl: string, prompt: string, userId: string) => {
          if (user) {
            await saveDesignToDatabase(
              imageUrl,
              prompt,
              answers,
              selectedTheme,
              tshirtColor,
              designId,
              designName,
              setDesignId,
              setHasUnsavedChanges
            );
          }
        }
      );
    } else {
      // Set placeholder design image if no theme or answers
      setDesignImage("/assets/images/design/placeholder.svg");
    }
  };
  
  const handleBackToThemes = () => {
    setCurrentStage("theme-selection");
    setSelectedTheme(null);
  };

  const handleDesignChange = (designDataUrl: string) => {
    console.log("🎨 Design change received in handler:", designDataUrl.slice(0, 50) + "...");
    setDesignImage(designDataUrl);
    setHasUnsavedChanges(true);
  };
  
  const handleSaveDesign = async () => {
    if (!isAuthenticated) {
      setShowLoginDialog(true);
      return;
    }
    
    if (!designImage || !user) {
      toast({
        variant: "destructive",
        title: "Cannot save design",
        description: "Please complete your design before saving"
      });
      return;
    }
    
    try {
      await saveDesignToDatabase(
        designImage,
        "",
        answers,
        selectedTheme,
        tshirtColor,
        designId,
        designName,
        setDesignId,
        setHasUnsavedChanges
      );
      
      toast({
        title: "Design saved successfully!",
        description: "You can find it in your saved designs."
      });
    } catch (error) {
      console.error("Error saving design:", error);
      toast({
        variant: "destructive",
        title: "Failed to save design",
        description: "Please try again later."
      });
    }
  };

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
  };
}
