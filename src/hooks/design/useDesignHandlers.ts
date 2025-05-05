
import { useState } from "react";
import { Answer } from "@/components/design/QuestionFlow";
import { Theme, DesignStage, DesignStep } from "./types";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";
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
  const [tshirtColor, setTshirtColor] = useState("#FFFFFF");
  const [designImage, setDesignImage] = useState<string | undefined>(undefined);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
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
      try {
        const generatedImageUrl = await generateDesignWithAI(
          selectedTheme, 
          answers, 
          tshirtColor,
          designName
        );
        
        if (generatedImageUrl) {
          setDesignImage(generatedImageUrl);
        }
      } catch (error) {
        console.error("Error generating design:", error);
        // Set placeholder design image if generation fails
        setDesignImage("/assets/images/design/placeholder.svg");
      }
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
    setDesignImage(designDataUrl);
    setHasUnsavedChanges(true);
  };
  
  const handleSaveDesign = async () => {
    if (!isAuthenticated) {
      setShowLoginDialog(true);
      return;
    }
    
    if (!designImage || !user) {
      toast.error("Cannot save design", { 
        description: "Please complete your design before saving"
      });
      return;
    }
    
    try {
      const savedId = await saveDesignToDatabase(
        designImage,
        "",
        answers,
        selectedTheme,
        tshirtColor,
        designId,
        designName
      );
      
      if (savedId) {
        setDesignId(savedId);
        setHasUnsavedChanges(false);
        
        toast.success("Design saved successfully!", {
          description: "You can find it in your saved designs."
        });
      }
    } catch (error) {
      console.error("Error saving design:", error);
      toast.error("Failed to save design", {
        description: "Please try again later."
      });
    }
  };

  // Load an existing design
  const loadSavedDesign = (savedDesign: any) => {
    setIsLoading(true);
    try {
      console.log("Loading saved design:", savedDesign);
      
      if (savedDesign.name) {
        setDesignName(savedDesign.name);
      }
      
      if (savedDesign.t_shirt_color) {
        setTshirtColor(savedDesign.t_shirt_color);
      }
      
      if (savedDesign.preview_url) {
        console.log("Setting design image from preview URL:", savedDesign.preview_url.substring(0, 50) + "...");
        setDesignImage(savedDesign.preview_url);
      }
      
      if (savedDesign.id) {
        setDesignId(savedDesign.id);
      }
      
      // Parse design data if available
      if (savedDesign.design_data) {
        const designData = typeof savedDesign.design_data === 'string'
          ? JSON.parse(savedDesign.design_data)
          : savedDesign.design_data;
          
        console.log("Parsed design data:", designData);
        
        if (designData.answers) {
          setAnswers(designData.answers);
        }
        
        if (designData.theme_id && designData.theme) {
          setSelectedTheme(designData.theme);
        }
      }
      
      // Skip to customization stage
      setCurrentStep("design");
      setCurrentStage("customization");
      setHasUnsavedChanges(false);
      
    } catch (error) {
      console.error("Error loading saved design:", error);
      toast.error("Failed to load design", {
        description: "There was an error loading your design. Please try again later."
      });
    } finally {
      setIsLoading(false);
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
    isLoading,
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
    loadSavedDesign,
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
