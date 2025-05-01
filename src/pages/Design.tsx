
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DesignStepper from "@/components/design/DesignStepper";
import ThemeSelector from "@/components/design/ThemeSelector";
import QuestionFlow from "@/components/design/QuestionFlow";
import ConfirmationDialog from "@/components/design/ConfirmationDialog";
import LoginDialog from "@/components/auth/LoginDialog";
import TshirtDesignPreview from "@/components/design/TshirtDesignPreview";
import DesignCanvas from "@/components/design/DesignCanvas";
import { Answer } from "@/components/design/QuestionFlow";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";

type DesignStep = "preferences" | "design" | "options";
type DesignStage = "theme-selection" | "question-flow" | "customization";

const Design = () => {
  const { user, isAuthenticated } = useUser();
  const [currentStep, setCurrentStep] = useState<DesignStep>("preferences");
  const [currentStage, setCurrentStage] = useState<DesignStage>("theme-selection");
  const [selectedTheme, setSelectedTheme] = useState<any>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [tshirtColor, setTshirtColor] = useState("#FFFFFF");
  const [designImage, setDesignImage] = useState<string | undefined>(undefined);
  
  // Get t-shirt color from answers if available
  useEffect(() => {
    const colorAnswer = answers.find(a => a.question.toLowerCase().includes('color'));
    if (colorAnswer && colorAnswer.answer) {
      setTshirtColor(colorAnswer.answer);
    }
  }, [answers]);
  
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
    
    // Check if user is logged in
    if (!isAuthenticated) {
      setShowLoginDialog(true);
      return;
    }
    
    proceedToDesignStage();
  };
  
  const handleLoginSuccess = () => {
    setShowLoginDialog(false);
    proceedToDesignStage();
  };
  
  const proceedToDesignStage = () => {
    setCurrentStep("design");
    setCurrentStage("customization");
    toast.success("Your design is being created!", {
      description: "We're generating your custom t-shirt design."
    });
    
    // Set placeholder design image
    setDesignImage("/assets/images/design/placeholder.svg");
  };
  
  const handleBackToThemes = () => {
    setCurrentStage("theme-selection");
    setSelectedTheme(null);
  };

  const handleDesignChange = (designDataUrl: string) => {
    setDesignImage(designDataUrl);
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
            <div className="flex flex-col md:flex-row md:gap-8">
              <div className="md:w-3/5">
                <QuestionFlow 
                  selectedTheme={selectedTheme}
                  onComplete={handleQuestionFlowComplete}
                  onBack={handleBackToThemes}
                />
              </div>
              <div className="md:w-2/5 mt-8 md:mt-0">
                <h3 className="text-lg font-medium mb-4 text-center">Preview</h3>
                <TshirtDesignPreview color={tshirtColor} />
              </div>
            </div>
          )}
          
          {currentStage === "customization" && (
            <div className="py-6">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-3/5">
                  <h2 className="text-2xl font-bold mb-4">Customize Your Design</h2>
                  <p className="text-gray-600 mb-4">
                    Your design is ready! You can now customize it further to match your preferences.
                  </p>
                  
                  <div className="space-y-6">
                    <div className="p-4 border border-gray-200 rounded-md">
                      <h3 className="font-medium mb-2">Your Preferences</h3>
                      <div className="space-y-2">
                        {answers.map((answer, index) => (
                          <div key={index} className="flex justify-between">
                            <span className="text-gray-600">{answer.question}</span>
                            <span className="font-medium">{answer.answer}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="p-4 border border-gray-200 rounded-md">
                      <h3 className="font-medium mb-2">Color Options</h3>
                      <div className="flex gap-2 flex-wrap">
                        {["#FFFFFF", "#000000", "#FF0000", "#0000FF", "#00FF00"].map((color) => (
                          <button 
                            key={color} 
                            className={`w-8 h-8 rounded-full border ${tshirtColor === color ? 'border-2 border-blue-500' : 'border-gray-300'}`}
                            style={{ backgroundColor: color }}
                            onClick={() => setTshirtColor(color)}
                            aria-label={`Select color ${color}`}
                          />
                        ))}
                      </div>
                    </div>
                    
                    {/* Design Canvas */}
                    <div className="p-4 border border-gray-200 rounded-md">
                      <h3 className="font-medium mb-4">Design Editor</h3>
                      <DesignCanvas 
                        tshirtColor={tshirtColor}
                        onDesignChange={handleDesignChange}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="md:w-2/5">
                  <div className="sticky top-4">
                    <h3 className="text-lg font-medium mb-4 text-center">Preview</h3>
                    <TshirtDesignPreview color={tshirtColor} designImage={designImage} />
                  </div>
                </div>
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
        
        <LoginDialog
          open={showLoginDialog}
          onClose={() => setShowLoginDialog(false)}
          onSuccess={handleLoginSuccess}
        />
      </main>
      
      <Footer />
    </div>
  );
};

export default Design;
