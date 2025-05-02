
import { useState } from "react";
import DesignStepper from "@/components/design/DesignStepper";
import ConfirmationDialog from "@/components/design/ConfirmationDialog";
import LoginDialog from "@/components/auth/LoginDialog";
import { TSHIRT_COLORS, useDesignState } from "@/hooks/useDesignState";
import MainLayout from "@/layouts/MainLayout";
import LoadingSpinner from "@/components/design/LoadingSpinner";
import PreferencesSection from "@/components/design/PreferencesSection";
import CustomizationSection from "@/components/design/CustomizationSection";

const Design = () => {
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
    handleSaveDesign
  } = useDesignState();

  return (
    <MainLayout>
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
    </MainLayout>
  );
};

export default Design;
