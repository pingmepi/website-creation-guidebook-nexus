
import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { useDesignStorage } from "./useDesignStorage";
import { toast } from "@/hooks/use-toast";
import { ErrorLogger } from "@/services/ErrorLogger";
import { Theme } from "./types";
import { Answer } from "@/components/design/QuestionFlow";

export function useDesignUI() {
  const { user, isAuthenticated } = useUser();
  const { saveDesignToDatabase } = useDesignStorage();
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveDesign = async (
    designImage: string | undefined,
    designId: string | null,
    designName: string,
    tshirtColor: string,
    selectedTheme: Theme | null,
    answers: Answer[],
    setDesignId: (id: string) => void
  ): Promise<boolean> => {
    if (!isAuthenticated) {
      console.log("User not authenticated for save");
      return false;
    }

    if (!designImage || !user) {
      ErrorLogger.log(
        new Error("Cannot save design - missing image or user"),
        "DesignSave:Validation",
        { hasImage: !!designImage, hasUser: !!user }
      );
      
      toast({
        variant: "destructive",
        title: "Cannot save design",
        description: "Please complete your design before saving"
      });
      return false;
    }

    try {
      setIsSaving(true);
      console.log("Starting design save process");

      await saveDesignToDatabase(
        designImage,
        "", // Empty prompt for manual saves
        answers,
        selectedTheme,
        tshirtColor,
        designId,
        designName,
        setDesignId,
        () => {} // No unsaved changes callback needed here
      );

      toast({
        title: "Design saved successfully!",
        description: "You can find it in your saved designs."
      });

      return true;
    } catch (error) {
      console.error("Error saving design:", error);
      ErrorLogger.log(error as Error, "DesignSave:DatabaseError", {
        designId,
        designName,
        userId: user?.id
      });
      
      toast({
        variant: "destructive",
        title: "Failed to save design",
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
