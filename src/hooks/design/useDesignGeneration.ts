
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";
import { Answer } from "@/components/design/QuestionFlow";
import { Theme } from "./useDesignTypes";
import { useDesignStorage } from "./useDesignStorage";

export function useDesignGeneration() {
  const { user } = useUser();
  const [isGenerating, setIsGenerating] = useState(false);
  const { saveDesignToDatabase } = useDesignStorage();

  const generateDesignWithAI = async (
    selectedTheme: Theme | null, 
    answers: Answer[], 
    tshirtColor: string,
    designId: string | null,
    designName: string,
    setDesignImage: (image?: string) => void,
    setHasUnsavedChanges: (value: boolean) => void,
    setDesignId: (id: string | null) => void
  ) => {
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
      
      if (!aiResponse || !aiResponse.imageUrl) {
        throw new Error("No design image was generated");
      }
      
      // Set the generated design image
      setDesignImage(aiResponse.imageUrl);
      setHasUnsavedChanges(true);
      
      // Save the design image with the answers and theme
      if (user) {
        await saveDesignToDatabase(
          aiResponse.imageUrl, 
          aiResponse.prompt || '', 
          answers, 
          selectedTheme, 
          tshirtColor, 
          designId, 
          designName,
          setDesignId,
          setHasUnsavedChanges
        );
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

  return {
    generateDesignWithAI,
    isGenerating
  };
}
