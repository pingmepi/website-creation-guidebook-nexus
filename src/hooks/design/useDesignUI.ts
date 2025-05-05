import { useState } from "react";
import { Theme } from "./types";
import { Answer } from "@/components/design/QuestionFlow";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";
import { useLocation, useNavigate } from "react-router-dom";

export function useDesignUI() {
  const { user, isAuthenticated } = useUser();
  const [isSaving, setIsSaving] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleSaveDesign = async (
    designImage: string | undefined,
    designId: string | null,
    designName: string,
    tshirtColor: string,
    selectedTheme: Theme | null,
    answers: Answer[],
    setDesignId: (id: string) => void
  ) => {
    console.log("Save design button clicked");

    if (!isAuthenticated) {
      console.log("User not authenticated, showing login dialog");
      return false;
    }

    if (!designImage || !user) {
      console.log("Cannot save design - missing design image or user");
      toast.error("Cannot save design", {
        description: "Please complete your design before saving"
      });
      return false;
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
      
      return true;
    } catch (error) {
      console.error("Error saving design:", error);
      toast.error("Failed to save design", {
        description: "Please try again later."
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    setIsSaving,
    handleSaveDesign
  };
}
