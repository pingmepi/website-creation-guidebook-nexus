
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Answer } from "@/components/design/QuestionFlow";
import { Theme } from "./types";
import { toast } from "sonner";

export function useDesignGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateDesignWithAI = async (
    selectedTheme: Theme, 
    answers: Answer[], 
    tshirtColor: string,
    designId: string | null,
    designName: string,
    setDesignImage: (image: string) => void,
    setHasUnsavedChanges: (value: boolean) => void,
    setDesignId: (id: string | null) => void
  ) => {
    if (!selectedTheme) {
      console.error("No theme selected for design generation");
      return;
    }

    setIsGenerating(true);
    
    try {
      // Prepare the prompt from the answers
      const prompt = answers.map(a => `${a.question}: ${a.answer}`).join(", ");
      console.log("Generating design with prompt:", prompt);
      
      // Call the AI generation function or API
      const { data, error } = await supabase.functions.invoke('generate-ai-design', {
        body: {
          prompt,
          theme: selectedTheme.name,
          tshirtColor
        }
      });
      
      if (error) {
        console.error("Error generating design:", error);
        toast.error("Failed to generate design", { 
          description: "Please try again or choose a different theme."
        });
        throw error;
      }
      
      console.log("Design generated successfully:", data);
      
      if (data?.imageUrl) {
        // Set the generated design image
        setDesignImage(data.imageUrl);
        setHasUnsavedChanges(true);
        
        // Save the generated design to the database if the user is logged in
        try {
          // Save to AI generated designs collection
          const { data: savedDesign, error: saveError } = await supabase
            .from('ai_generated_designs')
            .insert({
              prompt,
              design_image: data.imageUrl,
              theme_id: selectedTheme.id,
              is_favorite: false
            })
            .select()
            .single();
          
          if (saveError) {
            console.error("Error saving AI generated design:", saveError);
          } else if (savedDesign) {
            console.log("AI design saved to database:", savedDesign);
          }
          
        } catch (saveError) {
          console.error("Error saving AI design:", saveError);
        }
      } else {
        console.error("No image URL returned from design generation");
        toast.error("Failed to generate design", { 
          description: "No image was returned. Please try again."
        });
      }
      
    } catch (error) {
      console.error("Error in AI design generation:", error);
      toast.error("Failed to generate design", { 
        description: "An unexpected error occurred."
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateDesignWithAI,
    isGenerating
  };
}
