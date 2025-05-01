
import { useState } from "react";
import ThemeSelector from "./ThemeSelector";
import QuestionFlow from "./QuestionFlow";
import TshirtDesignPreview from "./TshirtDesignPreview";
import { Theme } from "@/hooks/useDesignState";
import { Answer } from "./QuestionFlow";

interface PreferencesSectionProps {
  selectedTheme: Theme | null;
  tshirtColor: string;
  onThemeSelect: (theme: Theme) => void;
  onQuestionFlowComplete: (answers: Answer[]) => void;
  onBackToThemes: () => void;
}

const PreferencesSection = ({
  selectedTheme,
  tshirtColor,
  onThemeSelect,
  onQuestionFlowComplete,
  onBackToThemes
}: PreferencesSectionProps) => {
  return (
    <>
      {!selectedTheme ? (
        <ThemeSelector onThemeSelect={onThemeSelect} />
      ) : (
        <div className="flex flex-col md:flex-row md:gap-8">
          <div className="md:w-3/5">
            <QuestionFlow 
              selectedTheme={selectedTheme}
              onComplete={onQuestionFlowComplete}
              onBack={onBackToThemes}
            />
          </div>
          <div className="md:w-2/5 mt-8 md:mt-0">
            <h3 className="text-lg font-medium mb-4 text-center">Preview</h3>
            <TshirtDesignPreview color={tshirtColor} />
            
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                Complete the questions to generate your custom AI design
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PreferencesSection;
