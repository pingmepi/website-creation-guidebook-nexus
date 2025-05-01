
import { useState } from "react";
import DesignStepper from "@/components/design/DesignStepper";
import ConfirmationDialog from "@/components/design/ConfirmationDialog";
import LoginDialog from "@/components/auth/LoginDialog";
import { TSHIRT_COLORS, useDesignState } from "@/hooks/useDesignState";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
    isLoading,
    setShowConfirmation,
    setShowLoginDialog,
    setTshirtColor,
    handleThemeSelect,
    handleQuestionFlowComplete,
    handleConfirmDesign,
    handleLoginSuccess,
    handleBackToThemes,
    handleDesignChange,
    handleSaveDesign
  } = useDesignState();
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <section className="max-w-4xl mx-auto text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">Design Your T-Shirt</h1>
            <DesignStepper currentStep={currentStep} />
          </section>
          
          <section className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6">
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
                    tshirtColors={TSHIRT_COLORS}
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
      </div>
      <Footer />
    </div>
  );
};

export default Design;
