
import { Progress } from "@/components/ui/progress";

type DesignStep = "preferences" | "design" | "options";

interface DesignStepperProps {
  currentStep: DesignStep;
}

const DesignStepper = ({ currentStep }: DesignStepperProps) => {
  // Calculate progress based on current step
  const getProgress = () => {
    switch (currentStep) {
      case "preferences":
        return 33;
      case "design":
        return 66;
      case "options":
        return 100;
      default:
        return 33;
    }
  };

  return (
    <div className="mb-10">
      <div className="max-w-xs mx-auto mb-8">
        <Progress value={getProgress()} className="h-2" />
      </div>
      <div className="flex justify-between items-center">
        <div className="flex flex-col items-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            currentStep === "preferences" 
              ? "bg-blue-600 text-white" 
              : "bg-white border-2 border-gray-200 text-gray-700"
          }`}>
            1
          </div>
          <span className="mt-2 text-sm font-medium">Preferences</span>
        </div>
        
        <div className="flex flex-col items-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            currentStep === "design" 
              ? "bg-blue-600 text-white" 
              : "bg-white border-2 border-gray-200 text-gray-700"
          }`}>
            2
          </div>
          <span className="mt-2 text-sm font-medium">Design</span>
        </div>
        
        <div className="flex flex-col items-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            currentStep === "options" 
              ? "bg-blue-600 text-white" 
              : "bg-white border-2 border-gray-200 text-gray-700"
          }`}>
            3
          </div>
          <span className="mt-2 text-sm font-medium">Options</span>
        </div>
      </div>
    </div>
  );
};

export default DesignStepper;
