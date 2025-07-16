
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/toast";
import { useNavigate } from "react-router-dom";
import { Theme, DesignStep, DesignStage } from "./useDesignTypes";
import { Answer } from "@/components/design/QuestionFlow";

export function useDesignFetch() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const fetchDesignData = async (
    id: string,
    setDesignName: (name: string) => void,
    setTshirtColor: (color: string) => void,
    setDesignImage: (image?: string) => void,
    setAnswers: (answers: Answer[]) => void,
    setSelectedTheme: (theme: Theme | null) => void,
    setCurrentStep: (step: DesignStep) => void,
    setCurrentStage: (stage: DesignStage) => void
  ) => {
    try {
      setIsLoading(true);
      
      console.log("Fetching design data for ID:", id);
      
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
      
      console.log("Design data loaded:", data);
      
      // Set the design data
      setDesignName(data.name || "Untitled Design");
      setTshirtColor(data.t_shirt_color);
      
      // Set the design image if available
      if (data.preview_url) {
        console.log("Setting preview URL:", data.preview_url.substring(0, 50) + "...");
        setDesignImage(data.preview_url);
      }
      
      // Parse the design data JSON
      if (data.design_data) {
        const designData = typeof data.design_data === 'string' 
          ? JSON.parse(data.design_data) 
          : data.design_data;
        
        if (designData.answers) {
          setAnswers(designData.answers);
        }
        
        // Fetch theme data if theme_id is present
        if (designData.theme_id) {
          try {
            const themeId = String(designData.theme_id);
            
            // Validate if this looks like a UUID before querying
            if (themeId && themeId !== "3" && themeId !== "undefined" && 
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(themeId)) {
              
              const { data: themeData, error: themeError } = await supabase
                .from('themes')
                .select('*')
                .eq('id', themeId)
                .single();
                
              if (themeError) {
                console.error("Error fetching theme:", themeError);
              } else if (themeData) {
                setSelectedTheme(themeData);
              }
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

  return {
    fetchDesignData,
    isLoading
  };
}
