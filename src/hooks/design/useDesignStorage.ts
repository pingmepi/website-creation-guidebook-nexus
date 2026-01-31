import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/toast";
import { useUser } from "@/contexts/UserContext";
import { useRouter, useSearchParams } from "next/navigation";
import { Answer } from "@/components/design/QuestionFlow";
import { Theme } from "./types";

export function useDesignStorage() {
  const { user } = useUser();
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

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
      if (!user) {
        console.log("No user logged in, cannot save design");
        return null;
      }

      setIsSaving(true);
      console.log("Saving design to database:", {
        designId,
        designName,
        tshirtColor,
        imageUrl: imageUrl?.substring(0, 50) + "..." // Log truncated image URL
      });

      // Create a new design record or update if designId exists
      const clean = (v: string) => v.replace(/<[^>]*>/g, '').trim();
      const designData = {
        user_id: user.id,
        name: clean(designName),
        t_shirt_color: clean(tshirtColor),
        preview_url: imageUrl,
        design_data: {
          answers: (answers || []).map(a => ({
            question: clean(String(a?.question || '')),
            answer: clean(String(a?.answer || '')),
          })),
          theme_id: selectedTheme?.id,
          prompt: clean(prompt)
        }
      };

      let result;

      if (designId) {
        console.log("Updating existing design:", designId);
        // Update existing design
        result = await supabase
          .from('designs')
          .update(designData as any)
          .eq('id', designId as any)
          .select('id');
      } else {
        console.log("Creating new design");
        // Create new design
        result = await supabase
          .from('designs')
          .insert(designData as any)
          .select('id');
      }

      const { data, error } = result;

      if (error) {
        console.error("Database error when saving design:", error);
        throw error;
      }

      if (data && data.length > 0) {
        console.log("Design saved successfully with ID:", (data as any)[0].id);
        setDesignId((data as any)[0].id);

        // Update URL with the design ID if it's not already there
        const currentId = searchParams.get('id');
        if (currentId !== (data as any)[0].id) {
          router.replace(`/design?id=${(data as any)[0].id}`);
        }
      } else {
        console.warn("No data returned when saving design");
      }

      setHasUnsavedChanges(false);

      return (data as any)?.[0]?.id;
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
