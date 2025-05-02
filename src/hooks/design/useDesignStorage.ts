
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";
import { useLocation, useNavigate } from "react-router-dom";
import { Answer } from "@/components/design/QuestionFlow";
import { Theme } from "./useDesignTypes";

export function useDesignStorage() {
  const { user } = useUser();
  const [isSaving, setIsSaving] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const saveDesignToDatabase = async (
    imageUrl: string, 
    prompt: string, 
    answers: Answer[], 
    selectedTheme: Theme | null, 
    tshirtColor: string, 
    designId: string | null, 
    designName: string,
    setDesignId: (id: string | null) => void,
    setHasUnsavedChanges: (value: boolean) => void
  ) => {
    try {
      if (!user) return;

      setIsSaving(true);
      
      // Create a new design record or update if designId exists
      const designData = {
        user_id: user.id,
        name: designName,
        t_shirt_color: tshirtColor,
        preview_url: imageUrl,
        design_data: JSON.stringify({
          answers: answers,
          theme_id: selectedTheme?.id,
          prompt: prompt
        })
      };
      
      let result;
      
      if (designId) {
        // Update existing design
        result = await supabase
          .from('designs')
          .update(designData)
          .eq('id', designId)
          .select();
      } else {
        // Create new design
        result = await supabase
          .from('designs')
          .insert(designData)
          .select();
      }
      
      const { data, error } = result;
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setDesignId(data[0].id);
        
        // Update URL with the design ID if it's not already there
        const params = new URLSearchParams(location.search);
        if (!params.has('id') || params.get('id') !== data[0].id) {
          navigate(`/design?id=${data[0].id}`, { replace: true });
        }
      }
      
      setHasUnsavedChanges(false);
      
      return data?.[0]?.id;
    } catch (error) {
      console.error("Error saving design to database:", error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    saveDesignToDatabase,
    isSaving
  };
}
