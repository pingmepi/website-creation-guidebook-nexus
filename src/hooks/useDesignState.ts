
import { useState, useEffect } from "react";
import { Answer } from "@/components/design/QuestionFlow";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/integrations/supabase/client";
import { useLocation, useNavigate } from "react-router-dom";

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
  id: number;
  name: string;
  description?: string;
  color?: string;
  category?: string[];
}

export function useDesignState() {
  const { user, isAuthenticated } = useUser();
  const [currentStep, setCurrentStep] = useState<DesignStep>("preferences");
  const [currentStage, setCurrentStage] = useState<DesignStage>("theme-selection");
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [tshirtColor, setTshirtColor] = useState(TSHIRT_COLORS.WHITE);
  const [designImage, setDesignImage] = useState<string | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);
  const [designId, setDesignId] = useState<string | null>(null);
  const [designName, setDesignName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract design ID from URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    
    if (id) {
      setDesignId(id);
      fetchDesignData(id);
    } else {
      // Generate a design name using the current date and time
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
  
  // Fetch existing design data if editing
  const fetchDesignData = async (id: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('designs')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        throw error;
      }
      
      if (!data) {
        toast.error("Design not found");
        navigate('/dashboard/designs');
        return;
      }
      
      // Set the design data
      setDesignName(data.name);
      setTshirtColor(data.t_shirt_color);
      setDesignImage(data.preview_url);
      
      // Parse the design data JSON
      if (data.design_data) {
        const designData = JSON.parse(data.design_data as string);
        
        if (designData.answers) {
          setAnswers(designData.answers);
        }
        
        if (designData.theme_id) {
          // Fetch the theme data
          const { data: themeData } = await supabase
            .from('themes')
            .select('*')
            .eq('id', designData.theme_id)
            .single();
            
          if (themeData) {
            setSelectedTheme(themeData);
          }
        }
      }
      
      // Skip to the customization stage
      setCurrentStep("design");
      setCurrentStage("customization");
      
      toast.success("Design loaded successfully", {
        description: "You can now continue editing your design."
      });
    } catch (error) {
      console.error("Error fetching design:", error);
      toast.error("Failed to load design", {
        description: "Please try again later."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleThemeSelect = (theme: Theme) => {
    console.log("Theme selected:", theme);
    setSelectedTheme(theme);
    setCurrentStage("question-flow");
  };
  
  const handleQuestionFlowComplete = (questionAnswers: Answer[]) => {
    console.log("Question flow complete with answers:", questionAnswers);
    setAnswers(questionAnswers);
    setShowConfirmation(true);
  };
  
  const handleConfirmDesign = () => {
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
  
  const handleLoginSuccess = () => {
    console.log("Login success callback in Design page");
    setShowLoginDialog(false);
    proceedToDesignStage();
  };
  
  const proceedToDesignStage = () => {
    console.log("Proceeding to design stage");
    setCurrentStep("design");
    setCurrentStage("customization");
    toast.success("Your design is being created!", {
      description: "We're generating your custom t-shirt design."
    });
    
    // Set placeholder design image if none exists yet
    if (!designImage) {
      setDesignImage("/assets/images/design/placeholder.svg");
    }
  };
  
  const handleBackToThemes = () => {
    console.log("Going back to themes");
    setCurrentStage("theme-selection");
    setSelectedTheme(null);
  };

  const handleDesignChange = (designDataUrl: string) => {
    console.log("Design canvas updated");
    setDesignImage(designDataUrl);
  };
  
  const handleSaveDesign = async () => {
    console.log("Save design button clicked");
    
    if (!isAuthenticated) {
      console.log("User not authenticated, showing login dialog");
      setShowLoginDialog(true);
      return;
    }
    
    if (!designImage || !user) {
      console.log("Cannot save design - missing design image or user");
      toast.error("Cannot save design", { 
        description: "Please complete your design before saving"
      });
      return;
    }
    
    try {
      console.log("Starting design save process");
      setIsSaving(true);
      
      // Convert the answers to a format that can be stored as JSON
      const serializedAnswers = answers.map(answer => ({
        question: answer.question,
        answer: answer.answer
      }));
      
      const designData = {
        id: designId || crypto.randomUUID(),
        user_id: user.id,
        name: designName,
        preview_url: designImage,
        t_shirt_color: tshirtColor,
        theme: selectedTheme?.name || null,
        design_data: JSON.stringify({
          answers: serializedAnswers,
          theme_id: selectedTheme?.id
        })
      };
      
      console.log("Saving design with data:", designData);
      
      const { data, error } = await supabase
        .from('designs')
        .upsert(designData)
        .select();
      
      if (error) {
        console.error("Error saving design:", error);
        throw error;
      }
      
      console.log("Design saved successfully, response data:", data);
      
      if (data && data.length > 0) {
        setDesignId(data[0].id as string);
      }
      
      toast.success("Design saved successfully!", {
        description: "You can find it in your saved designs."
      });
    } catch (error) {
      console.error("Error saving design:", error);
      toast.error("Failed to save design", {
        description: "Please try again later."
      });
    } finally {
      setIsSaving(false);
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
    designId,
    designName,
    isLoading,
    setShowConfirmation,
    setShowLoginDialog,
    setTshirtColor,
    handleThemeSelect,
    handleQuestionFlowComplete,
    handleConfirmDesign,
    handleLoginSuccess,
    handleBackToThemes,
    handleDesignChange,
    handleSaveDesign
  };
}
