'use client';

import { Suspense } from "react";
import DesignStepper from "@/components/design/DesignStepper";
import ConfirmationDialog from "@/components/design/ConfirmationDialog";
import LoginDialog from "@/components/auth/LoginDialog";
import { TSHIRT_COLORS, useDesignState } from "@/hooks/design";
import LoadingSpinner from "@/components/design/LoadingSpinner";
import PreferencesSection from "@/components/design/PreferencesSection";
import CustomizationSection from "@/components/design/CustomizationSection";
import { DesignErrorBoundary } from "@/components/error/DesignErrorBoundary";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";

function DesignContent() {
    const {
        currentStep,
        currentStage,
        selectedTheme,
        answers,
        showConfirmation,
        showLoginDialog,
        tshirtColor,
        selectedSize,
        designImage,
        isSaving,
        isGenerating,
        isLoading,
        designName,
        setShowConfirmation,
        setShowLoginDialog,
        setTshirtColor,
        setSelectedSize,
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
        <DesignErrorBoundary>
            <div className="container mx-auto px-4 py-8">
                <ErrorBoundary context="DesignStepper">
                    <section className="max-w-5xl mx-auto text-center mb-8">
                        <DesignStepper currentStep={currentStep} />
                    </section>
                </ErrorBoundary>

                <section className="max-w-5xl mx-auto bg-white rounded-lg shadow-sm p-6">
                    {isLoading ? (
                        <LoadingSpinner message="Loading design..." />
                    ) : (
                        <ErrorBoundary context="DesignContent">
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
                                    selectedSize={selectedSize}
                                    designImage={designImage}
                                    isSaving={isSaving}
                                    isGenerating={isGenerating}
                                    tshirtColors={TSHIRT_COLORS}
                                    designName={designName}
                                    onDesignNameChange={setDesignName}
                                    onColorChange={setTshirtColor}
                                    onSizeChange={setSelectedSize}
                                    onDesignChange={handleDesignChange}
                                    onSaveDesign={handleSaveDesign}
                                />
                            )}
                        </ErrorBoundary>
                    )}
                </section>

                <ErrorBoundary context="DesignDialogs">
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
                </ErrorBoundary>
            </div>
        </DesignErrorBoundary>
    );
}

export default function Design() {
    return (
        <Suspense fallback={<LoadingSpinner message="Loading..." />}>
            <DesignContent />
        </Suspense>
    );
}
