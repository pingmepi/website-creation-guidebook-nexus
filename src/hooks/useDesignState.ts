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
  // Update the id type to accept both number (for local themes) and string (for Supabase themes)
  id: number | string;
  name: string;
  description?: string;
  color?: string;
  // Update category to be either string[] (local themes) or string (Supabase themes)
  category?: string[] | string;
  // Add optional fields that come from Supabase
  created_at?: string;
  is_active?: boolean;
  thumbnail_url?: string;
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
  const [isGenerating, setIsGenerating] = useState(false);
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
      
      console.log("Fetched design data:", data);
      
      // Set the design data
      setDesignName(data.name || "Untitled Design");
      setTshirtColor(data.t_shirt_color || TSHIRT_COLORS.WHITE);
      
      // Make sure to set the designImage from the preview_url in the database
      if (data.preview_url) {
        setDesignImage(data.preview_url);
        console.log("Set design image from preview_url:", data.preview_url);
      }
      
      // Parse the design data JSON
      if (data.design_data) {
        const designData = typeof data.design_data === 'string' 
          ? JSON.parse(data.design_data) 
          : data.design_data;
        
        console.log("Parsed design data:", designData);
        
        if (designData.answers) {
          setAnswers(designData.answers);
          console.log("Set answers:", designData.answers);
        }
        
        // Fix the theme_id handling - ensure it's a proper UUID string
        if (designData.theme_id) {
          try {
            // Ensure theme_id is a valid string format that can be used for the database query
            const themeId = String(designData.theme_id);
            
            // Validate if this looks like a UUID before querying
            if (themeId && themeId !== "3" && themeId !== "undefined" && 
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(themeId)) {
              console.log("Attempting to fetch theme with ID:", themeId);
              
              const { data: themeData, error: themeError } = await supabase
                .from('themes')
                .select('*')
                .eq('id', themeId)
                .single();
                
              if (themeError) {
                console.error("Error fetching theme:", themeError);
              } else if (themeData) {
                setSelectedTheme(themeData);
                console.log("Set selected theme:", themeData);
              }
            } else {
              console.warn("Invalid theme ID format:", themeId, "- skipping theme fetch");
            }
          } catch (themeError) {
            console.error("Error processing theme:", themeError);
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
  
  const proceedToDesignStage = async () => {
    console.log("Proceeding to design stage");
    setCurrentStep("design");
    setCurrentStage("customization");
    
    // Generate design with AI using the selected theme and answers
    if (selectedTheme && answers.length > 0) {
      await generateDesignWithAI();
    } else {
      // Set placeholder design image if no theme or answers
      setDesignImage("/assets/images/design/placeholder.svg");
    }
  };

  const generateDesignWithAI = async () => {
    if (!selectedTheme || answers.length === 0) {
      toast.error("Theme and answers are required to generate design");
      return;
    }

    try {
      setIsGenerating(true);
      toast.loading("Generating your design with AI...");
      
      // Call the edge function to generate the design
      const { data: aiResponse, error: aiError } = await supabase.functions.invoke(
        'generate-ai-design',
        {
          body: { 
            theme: selectedTheme,
            answers: answers
          },
          method: 'POST'
        }
      );
      
      if (aiError) throw new Error(aiError.message);
      
      console.log("AI response:", aiResponse);
      
      if (!aiResponse || !aiResponse.imageUrl) {
        throw new Error("No design image was generated");
      }
      
      // Set the generated design image
      setDesignImage(aiResponse.imageUrl);
      
      // Save the design image with the answers and theme
      if (user) {
        await saveDesignToDatabase(aiResponse.imageUrl, aiResponse.prompt || '');
      }
      
      toast.dismiss();
      toast.success("Your design is ready!", {
        description: "We've created a custom t-shirt design based on your preferences."
      });
    } catch (error) {
      console.error("Error generating design with AI:", error);
      toast.dismiss();
      toast.error("Failed to generate design", {
        description: "Please try again later."
      });
      
      // Set placeholder design image if generation fails
      setDesignImage("/assets/images/design/placeholder.svg");
    } finally {
      setIsGenerating(false);
    }
  };

  const saveDesignToDatabase = async (imageUrl: string, prompt: string) => {
    try {
      if (!user) return;

      // Create a new design record
      const { data, error } = await supabase
        .from('designs')
        .insert({
          user_id: user.id,
          name: designName,
          t_shirt_color: tshirtColor,
          preview_url: imageUrl,
          design_data: JSON.stringify({
            answers: answers,
            theme_id: selectedTheme?.id,
            prompt: prompt
          })
        })
        .select();
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        setDesignId(data[0].id);
      }
    } catch (error) {
      console.error("Error saving AI design to database:", error);
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
      
      // Important: Include the current designImage in the save data
      const designData = {
        id: designId,
        user_id: user.id,
        name: designName,
        preview_url: designImage, // Always save the current designImage
        t_shirt_color: tshirtColor,
        theme: selectedTheme?.name || null,
        design_data: JSON.stringify({
          answers: serializedAnswers,
          theme_id: selectedTheme?.id
        })
      };
      
      console.log("Saving design with data:", designData);
      
      let result;
      
      // If we have a designId, update the existing record
      if (designId) {
        result = await supabase
          .from('designs')
          .update({
            name: designName,
            preview_url: designImage,
            t_shirt_color: tshirtColor,
            theme: selectedTheme?.name || null,
            design_data: JSON.stringify({
              answers: serializedAnswers,
              theme_id: selectedTheme?.id
            })
          })
          .eq('id', designId)
          .select();
      } else {
        // Otherwise insert a new record
        result = await supabase
          .from('designs')
          .insert(designData)
          .select();
      }
      
      const { data, error } = result;
      
      if (error) {
        console.error("Error saving design:", error);
        throw error;
      }
      
      console.log("Design saved successfully, response data:", data);
      
      if (data && data.length > 0) {
        setDesignId(data[0].id as string);
        
        // Update URL with the design ID if it's not already there
        const params = new URLSearchParams(location.search);
        if (!params.has('id')) {
          navigate(`/design?id=${data[0].id}`, { replace: true });
        }
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
    isGenerating,
    designId,
    designName,
    isLoading,
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
