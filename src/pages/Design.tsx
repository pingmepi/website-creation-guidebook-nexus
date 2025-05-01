
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DesignStepper from "@/components/design/DesignStepper";
import ThemeSelector from "@/components/design/ThemeSelector";
import QuestionFlow from "@/components/design/QuestionFlow";
import ConfirmationDialog from "@/components/design/ConfirmationDialog";
import { Answer } from "@/components/design/QuestionFlow";
import { toast } from "sonner";

type DesignStep = "preferences" | "design" | "options";
type DesignStage = "theme-selection" | "question-flow" | "customization";

const Design = () => {
  const [currentStep, setCurrentStep] = useState<DesignStep>("preferences");
  const [currentStage, setCurrentStage] = useState<DesignStage>("theme-selection");
  const [selectedTheme, setSelectedTheme] = useState<any>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const handleThemeSelect = (theme: any) => {
    setSelectedTheme(theme);
    setCurrentStage("question-flow");
  };
  
  const handleQuestionFlowComplete = (questionAnswers: Answer[]) => {
    setAnswers(questionAnswers);
    setShowConfirmation(true);
  };
  
  const handleConfirmDesign = () => {
    setShowConfirmation(false);
    setCurrentStep("design");
    setCurrentStage("customization");
    toast("Your design is being created!", {
      description: "We're generating your custom t-shirt design."
    });
  };
  
  const handleBackToThemes = () => {
    setCurrentStage("theme-selection");
    setSelectedTheme(null);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <section className="max-w-4xl mx-auto text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Design Your T-Shirt</h1>
          <DesignStepper currentStep={currentStep} />
        </section>
        
        <section className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6">
          {currentStage === "theme-selection" && (
            <ThemeSelector onThemeSelect={handleThemeSelect} />
          )}
          
          {currentStage === "question-flow" && (
            <QuestionFlow 
              selectedTheme={selectedTheme}
              onComplete={handleQuestionFlowComplete}
              onBack={handleBackToThemes}
            />
          )}
          
          {currentStage === "customization" && (
            <div className="py-6 text-center">
              <h2 className="text-2xl font-bold mb-4">Customize Your Design</h2>
              <p className="text-gray-600 mb-8">
                Your design is being prepared based on your preferences.
              </p>
              <div className="p-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Design preview will appear here</p>
              </div>
            </div>
          )}
        </section>
        
        <ConfirmationDialog
          open={showConfirmation}
          answers={answers}
          onClose={() => setShowConfirmation(false)}
          onConfirm={handleConfirmDesign}
          onEdit={() => setShowConfirmation(false)}
        />
      </main>
      
      <Footer />
    </div>
  );
};

export default Design;
