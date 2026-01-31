
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { Theme, DesignStep, DesignStage } from "./types";
import { Answer } from "@/components/design/QuestionFlow";

export const useDesignFetch = (
  setDesignStage: (stage: DesignStage) => void,
  setDesignName: (name: string) => void,
  setTshirtColor: (color: string) => void,
  setDesignImage: (image: string) => void,
  setAnswers: (answers: Answer[]) => void,
  setSelectedTheme: (theme: Theme) => void,
  setStep: (step: DesignStep) => void,
  setPreviousStep: (step: DesignStep) => void
) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const fetchDesignData = async (
    id: string,
  ) => {
    try {
      setIsLoading(true);

      console.log("Fetching design data for ID:", id);

      const { data, error } = await supabase
        .from('designs')
        .select('id, name, t_shirt_color, preview_url, design_data')
        .eq('id', id as any)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        toast.error("Design not found");
        router.push('/dashboard/designs');
        return;
      }

      console.log("Design data loaded:", data);

      // Set the design data
      setDesignName((data as any).name || "Untitled Design");
      setTshirtColor((data as any).t_shirt_color);

      // Set the design image if available
      if ((data as any).preview_url) {
        console.log("Setting preview URL:", (data as any).preview_url.substring(0, 50) + "...");
        setDesignImage((data as any).preview_url);
      }

      // Parse the design data JSON
      if ((data as any).design_data) {
        const designData = typeof (data as any).design_data === 'string'
          ? JSON.parse((data as any).design_data)
          : (data as any).design_data;

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
                .select('id, name, description, category, is_active, thumbnail_url, created_at')
                .eq('id', themeId as any)
                .single();

              if (themeError) {
                console.error("Error fetching theme:", themeError);
              } else if (themeData) {
                setSelectedTheme(themeData as any);
              }
            }
          } catch (themeError) {
            console.error("Error processing theme:", themeError);
          }
        }
      }

      // Skip to the customization stage
      setStep("design");
      setDesignStage("customization");

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
