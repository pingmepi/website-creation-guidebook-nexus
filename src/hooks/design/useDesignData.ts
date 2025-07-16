import { useState, useEffect, useCallback } from "react";
import { Theme } from "./types";
import { TSHIRT_COLORS } from "./constants";
import { Answer } from "@/components/design/QuestionFlow";
import { useLocation, useNavigate } from "react-router-dom";
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

  const location = useLocation();
  const navigate = useNavigate();

  // Fetch existing design data if editing
  const fetchDesignData = useCallback(async (id: string) => {
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
      setDesignImage(data.preview_url);

      // Parse the design data JSON
      if (data.design_data) {
        const designData = typeof data.design_data === 'string'
          ? JSON.parse(data.design_data)
          : data.design_data;

        console.log("Parsed design data:", designData);

        if (designData.answers) {
          setAnswers(designData.answers);
        }

        if (designData.theme_id) {
          // Make sure the theme_id is a valid UUID
          try {
            // Fetch the theme data - ensure theme_id is a string
            const themeId = String(designData.theme_id);

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
  }, [setDesignStage, navigate]);

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
  }, [location.search, designName, fetchDesignData]);

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