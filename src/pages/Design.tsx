
import { useState, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type DesignStep = "preferences" | "design" | "options";
type DesignStage = "theme-selection" | "question-flow" | "customization";

// Define t-shirt color options
const TSHIRT_COLORS = {
  BLACK: "#000000",
  WHITE: "#FFFFFF",
  GREY: "#8A898C",
  BLUE: "#1EAEDB"
};

const Design = () => {
  const { user, isAuthenticated } = useUser();
  const [currentStep, setCurrentStep] = useState<DesignStep>("preferences");
  const [currentStage, setCurrentStage] = useState<DesignStage>("theme-selection");
  const [selectedTheme, setSelectedTheme] = useState<any>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [tshirtColor, setTshirtColor] = useState(TSHIRT_COLORS.WHITE);
  const [designImage, setDesignImage] = useState<string | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);
  const [designId, setDesignId] = useState<string | null>(null);
  const [designName, setDesignName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract design ID from URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    
    if (id) {
      setDesignId(id);
      fetchDesignData(id);
    } else {
      // Generate a design name using the current date and time
      if (!designName) {
        const date = new Date();
        setDesignName(`Design ${date.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "numeric"
        })}`);
      }
    }
  }, [location.search]);
  
  // Fetch existing design data if editing
  const fetchDesignData = async (id: string) => {
    try {
      setIsLoading(true);
      
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
        navigate('/dashboard/designs');
        return;
      }
      
      // Set the design data
      setDesignName(data.name);
      setTshirtColor(data.t_shirt_color);
      setDesignImage(data.preview_url);
      
      // Parse the design data JSON
      if (data.design_data) {
        const designData = JSON.parse(data.design_data);
        
        if (designData.answers) {
          setAnswers(designData.answers);
        }
        
        if (designData.theme_id) {
          // Fetch the theme data
          const { data: themeData } = await supabase
            .from('themes')
            .select('*')
            .eq('id', designData.theme_id)
            .single();
            
          if (themeData) {
            setSelectedTheme(themeData);
          }
        }
      }
      
      // Skip to the customization stage
      setCurrentStep("design");
      setCurrentStage("customization");
      
      toast.success("Design loaded successfully", {
        description: "You can now continue editing your design."
      });
    } catch (error) {
      console.error("Error fetching design:", error);
      toast.error("Failed to load design", {
        description: "Please try again later."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleThemeSelect = (theme: any) => {
    console.log("Theme selected:", theme);
    setSelectedTheme(theme);
    setCurrentStage("question-flow");
  };
  
  const handleQuestionFlowComplete = (questionAnswers: Answer[]) => {
    console.log("Question flow complete with answers:", questionAnswers);
    setAnswers(questionAnswers);
    setShowConfirmation(true);
  };
  
  const handleConfirmDesign = () => {
    console.log("Design confirmed");
    setShowConfirmation(false);
    
    // Check if user is logged in
    if (!isAuthenticated) {
      console.log("User not authenticated, showing login dialog");
      setShowLoginDialog(true);
      return;
    }
    
    proceedToDesignStage();
  };
  
  const handleLoginSuccess = () => {
    console.log("Login success callback in Design page");
    setShowLoginDialog(false);
    proceedToDesignStage();
  };
  
  const proceedToDesignStage = () => {
    console.log("Proceeding to design stage");
    setCurrentStep("design");
    setCurrentStage("customization");
    toast.success("Your design is being created!", {
      description: "We're generating your custom t-shirt design."
    });
    
    // Set placeholder design image if none exists yet
    if (!designImage) {
      setDesignImage("/assets/images/design/placeholder.svg");
    }
  };
  
  const handleBackToThemes = () => {
    console.log("Going back to themes");
    setCurrentStage("theme-selection");
    setSelectedTheme(null);
  };

  const handleDesignChange = (designDataUrl: string) => {
    console.log("Design canvas updated");
    setDesignImage(designDataUrl);
  };
  
  const handleSaveDesign = async () => {
    console.log("Save design button clicked");
    
    if (!isAuthenticated) {
      console.log("User not authenticated, showing login dialog");
      setShowLoginDialog(true);
      return;
    }
    
    if (!designImage || !user) {
      console.log("Cannot save design - missing design image or user");
      toast.error("Cannot save design", { 
        description: "Please complete your design before saving"
      });
      return;
    }
    
    try {
      console.log("Starting design save process");
      setIsSaving(true);
      
      // Convert the answers to a format that can be stored as JSON
      const serializedAnswers = answers.map(answer => ({
        question: answer.question,
        answer: answer.answer
      }));
      
      const designData = {
        id: designId || crypto.randomUUID(),
        user_id: user.id,
        name: designName,
        preview_url: designImage,
        t_shirt_color: tshirtColor,
        theme: selectedTheme?.name || null,
        design_data: JSON.stringify({
          answers: serializedAnswers,
          theme_id: selectedTheme?.id
        })
      };
      
      console.log("Saving design with data:", designData);
      
      const { data, error } = await supabase
        .from('designs')
        .upsert(designData)
        .select();
      
      if (error) {
        console.error("Error saving design:", error);
        throw error;
      }
      
      console.log("Design saved successfully, response data:", data);
      
      if (data && data.length > 0) {
        setDesignId(data[0].id);
      }
      
      toast.success("Design saved successfully!", {
        description: "You can find it in your saved designs."
      });
    } catch (error) {
      console.error("Error saving design:", error);
      toast.error("Failed to save design", {
        description: "Please try again later."
      });
    } finally {
      setIsSaving(false);
    }
  };
  
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
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                <span className="ml-3">Loading design...</span>
              </div>
            ) : (
              <>
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
                        <div className="flex justify-between items-center mb-4">
                          <h2 className="text-2xl font-bold">Customize Your Design</h2>
                          <Button 
                            onClick={handleSaveDesign} 
                            disabled={isSaving}
                            className="flex items-center gap-2"
                          >
                            <Save className="h-4 w-4" />
                            {isSaving ? "Saving..." : "Save Design"}
                          </Button>
                        </div>
                        
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
                            <h3 className="font-medium mb-2">T-Shirt Color Options</h3>
                            <div className="flex gap-2 flex-wrap">
                              {Object.values(TSHIRT_COLORS).map((color) => (
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
