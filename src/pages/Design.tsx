
import { useState, useEffect } from "react";
import DesignStepper from "@/components/design/DesignStepper";
import ConfirmationDialog from "@/components/design/ConfirmationDialog";
import LoginDialog from "@/components/auth/LoginDialog";
import { useDesignState } from "@/hooks/design";
import LoadingSpinner from "@/components/design/LoadingSpinner";
import PreferencesSection from "@/components/design/PreferencesSection";
import CustomizationSection from "@/components/design/CustomizationSection";
import DesignCanvasRefactored from "@/components/design/canvas/DesignCanvasRefactored";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Define TshirtColor type for proper type checking
interface TshirtColor {
  name: string;
  value: string;
}

// Convert TSHIRT_COLORS object to an array of TshirtColor objects
const TSHIRT_COLORS: TshirtColor[] = [
  { name: "Black", value: "#000000" },
  { name: "White", value: "#FFFFFF" },
  { name: "Grey", value: "#8A898C" },
  { name: "Blue", value: "#1EAEDB" }
];

const Design = () => {
  const location = useLocation();
  const {
    currentStep,
    currentStage,
    selectedTheme,
    answers,
    showConfirmation,
    showLoginDialog,
    tshirtColor,
    designImage,
    isSaving,
    isGenerating,
    isLoading,
    designName,
    setShowConfirmation,
    setShowLoginDialog,
    setTshirtColor,
    setDesignName,
    handleThemeSelect,
    handleQuestionFlowComplete,
    handleConfirmDesign,
    handleLoginSuccess,
    handleBackToThemes,
    handleDesignChange,
    handleSaveDesign,
    loadSavedDesign
  } = useDesignState();

  // Check for design ID in the URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const designId = params.get('id');
    
    if (designId) {
      fetchDesign(designId);
    }
  }, [location.search]);

  // Fetch design data from Supabase
  const fetchDesign = async (id: string) => {
    try {
      console.log("Fetching design with ID:", id);
      
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
        return;
      }
      
      console.log("Design loaded:", data);
      loadSavedDesign(data);
      
    } catch (error) {
      console.error("Error fetching design:", error);
      toast.error("Failed to load design", {
        description: "Please try again later."
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="max-w-5xl mx-auto text-center mb-8">
        <DesignStepper currentStep={currentStep} />
      </section>

      <section className="max-w-5xl mx-auto bg-white rounded-lg shadow-sm p-6">
        {isLoading ? (
          <LoadingSpinner message="Loading design..." />
        ) : (
          <>
            {currentStage === "theme-selection" || currentStage === "question-flow" ? (
              <PreferencesSection
                selectedTheme={selectedTheme}
                tshirtColor={tshirtColor}
                onThemeSelect={handleThemeSelect}
                onQuestionFlowComplete={handleQuestionFlowComplete}
                onBackToThemes={handleBackToThemes}
              />
            ) : currentStage === "customization" && (
              <CustomizationSection
                answers={answers}
                tshirtColor={tshirtColor}
                designImage={designImage}
                isSaving={isSaving}
                isGenerating={isGenerating}
                tshirtColors={TSHIRT_COLORS}
                designName={designName}
                onDesignNameChange={setDesignName}
                onColorChange={setTshirtColor}
                onDesignChange={handleDesignChange}
                onSaveDesign={handleSaveDesign}
                CustomCanvas={DesignCanvasRefactored}
              />
            )}
          </>
        )}
      </section>

      <ConfirmationDialog
        open={showConfirmation}
        answers={answers}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmDesign}
        onEdit={() => setShowConfirmation(false)}
      />

      <LoginDialog
        open={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default Design;
