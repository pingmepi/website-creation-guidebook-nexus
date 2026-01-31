import { useState, useEffect, useCallback } from "react";
import { Theme } from "./types";
import { TSHIRT_COLORS } from "./constants";
import { Answer } from "@/components/design/QuestionFlow";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/toast";
import { useUser } from "@/contexts/UserContext";

export function useDesignData(setDesignStage: () => void) {
  const { user } = useUser();
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [designId, setDesignId] = useState<string | null>(null);
  const [designName, setDesignName] = useState<string>("");
  const [tshirtColor, setTshirtColor] = useState(TSHIRT_COLORS.WHITE);
  const [designImage, setDesignImage] = useState<string | undefined>(undefined);
  const [selectedSize, setSelectedSize] = useState<string>("M");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Fetch existing design data if editing
  const fetchDesignData = useCallback(async (id: string) => {
    try {
      setIsLoading(true);

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

      console.log("Fetched design data:", data);

      // Set the design data
      setDesignName((data as any).name || "Untitled Design");
      setTshirtColor((data as any).t_shirt_color || TSHIRT_COLORS.WHITE);
      setDesignImage((data as any).preview_url);

      // Parse the design data JSON
      if ((data as any).design_data) {
        const designData = typeof (data as any).design_data === 'string'
          ? JSON.parse((data as any).design_data)
          : (data as any).design_data;

        console.log("Parsed design data:", designData);

        if (designData.answers) {
          setAnswers(designData.answers);
        }

        if (designData.theme_id) {
          try {
            // Convert theme_id to proper UUID format if it's a number
            let themeId = designData.theme_id;

            // If theme_id is a number, we need to look it up differently
            if (typeof themeId === 'number') {
              console.log("Converting numeric theme_id to UUID:", themeId);
              // For now, skip theme loading for numeric IDs to prevent errors
              console.warn("Numeric theme_id detected, skipping theme fetch to prevent UUID errors");
            } else if (typeof themeId === 'string' && themeId.length > 0) {
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

      // Important: Set the design stage to customization
      // This ensures we bypass the theme selection flow
      setDesignStage();

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
  }, [setDesignStage, router]);

  // Extract design ID from URL query parameters
  useEffect(() => {
    const id = searchParams.get('id');

    if (id && id !== designId) {
      setDesignId(id);
      fetchDesignData(id);
    } else if (!id && !designName) {
      // Generate a design name using the current date and time
      const date = new Date();
      setDesignName(`Design ${date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric"
      })}`);
    }
  }, [searchParams, designId, designName]); // Removed fetchDesignData from dependencies

  const handleDesignChange = (designDataUrl: string) => {
    console.log("Design canvas updated");
    setDesignImage(designDataUrl);
  };

  const saveDesignToDatabase = async (
    imageUrl: string,
    prompt: string,
    userId: string
  ) => {
    try {
      if (!userId) return;

      // Create a new design record
      const { data, error } = await supabase
        .from('designs')
        .insert({
          user_id: userId,
          name: designName.replace(/<[^>]*>/g, '').trim(),
          t_shirt_color: tshirtColor.replace(/<[^>]*>/g, '').trim(),
          preview_url: imageUrl,
          design_data: JSON.stringify({
            answers: (answers || []).map(a => ({
              question: String(a?.question || '').replace(/<[^>]*>/g, '').trim(),
              answer: String(a?.answer || '').replace(/<[^>]*>/g, '').trim(),
            })),
            theme_id: selectedTheme?.id,
            prompt: String(prompt || '').replace(/<[^>]*>/g, '').trim()
          })
        } as any)
        .select('id');

      if (error) throw error;

      if (data && data.length > 0) {
        setDesignId((data as any)[0].id);
      }
    } catch (error) {
      console.error("Error saving AI design to database:", error);
    }
  };

  return {
    selectedTheme,
    answers,
    designId,
    designName,
    tshirtColor,
    selectedSize,
    designImage,
    isLoading,
    setSelectedTheme,
    setAnswers,
    setDesignId,
    setDesignName,
    setTshirtColor,
    setSelectedSize,
    setDesignImage,
    setIsLoading,
    fetchDesignData,
    handleDesignChange,
    saveDesignToDatabase
  };
}