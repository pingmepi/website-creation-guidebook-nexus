
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import DesignCanvas from "./DesignCanvas";
import TshirtDesignPreview from "./TshirtDesignPreview";
import { Answer } from "./QuestionFlow";

interface CustomizationSectionProps {
  answers: Answer[];
  tshirtColor: string;
  designImage?: string;
  isSaving: boolean;
  tshirtColors: Record<string, string>;
  onColorChange: (color: string) => void;
  onDesignChange: (designDataUrl: string) => void;
  onSaveDesign: () => void;
}

const CustomizationSection = ({
  answers,
  tshirtColor,
  designImage,
  isSaving,
  tshirtColors,
  onColorChange,
  onDesignChange,
  onSaveDesign
}: CustomizationSectionProps) => {
  return (
    <div className="py-6">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-3/5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Customize Your Design</h2>
            <Button 
              onClick={onSaveDesign} 
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
                {Object.values(tshirtColors).map((color) => (
                  <button 
                    key={color} 
                    className={`w-8 h-8 rounded-full border ${tshirtColor === color ? 'border-2 border-blue-500' : 'border-gray-300'}`}
                    style={{ backgroundColor: color }}
                    onClick={() => onColorChange(color)}
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
                onDesignChange={onDesignChange}
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
  );
};

export default CustomizationSection;
