
import React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import TshirtDesignPreview from "./TshirtDesignPreview";
import { Separator } from "@/components/ui/separator";
import { Save, Loader2 } from "lucide-react";
import { Answer } from "./QuestionFlow";
import DesignCanvas from "./DesignCanvas";
import { CanvasErrorBoundary } from "@/components/error/CanvasErrorBoundary";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import AddToCartButton from "./AddToCartButton";
import PlaceOrderButton from "./PlaceOrderButton";

interface CustomizationSectionProps {
  answers: Answer[];
  tshirtColor: string;
  designImage?: string;
  isSaving: boolean;
  isGenerating?: boolean;
  tshirtColors: Record<string, string>;
  designName: string;
  onDesignNameChange?: (name: string) => void;
  onColorChange: (color: string) => void;
  onDesignChange: (designDataUrl: string) => void;
  onSaveDesign: () => void;
}

const CustomizationSection = ({
  answers,
  tshirtColor,
  designImage,
  isSaving,
  isGenerating,
  tshirtColors,
  designName,
  onDesignNameChange,
  onColorChange,
  onDesignChange,
  onSaveDesign
}: CustomizationSectionProps) => {
  // Enhanced color options with proper names
  const enhancedTshirtColors = {
    ...tshirtColors,
    RED: "#DC2626" // Add red to existing colors
  };
  
  const tshirtColorOptions = Object.entries(enhancedTshirtColors).map(([name, value]) => ({
    name: name.charAt(0) + name.slice(1).toLowerCase(), // Capitalize first letter
    value
  }));

  // Debounced design name change to prevent excessive logging
  const handleDesignNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onDesignNameChange) {
      onDesignNameChange(e.target.value);
    }
  };

  // Handle design changes from canvas and sync with preview
  const handleCanvasDesignChange = (designDataUrl: string) => {
    console.log("🎨 Design change from canvas:", designDataUrl.slice(0, 50) + "...");
    onDesignChange(designDataUrl);
  };

  return (
    <div className="py-6">
      {/* Design Name at Top Left */}
      <div className="mb-6">
        <Input
          id="design-name"
          placeholder="My Awesome Design"
          value={designName}
          onChange={handleDesignNameChange}
          className="text-lg font-medium w-full max-w-xs"
          disabled={isGenerating}
        />
      </div>

      <div className="flex flex-col space-y-8">
        {/* Top Section: Design Canvas and Preview side by side */}
        <div className="flex flex-col lg:flex-row lg:gap-6">
          {/* Design Tools & Canvas - Left Side */}
          <div className="w-full lg:w-1/2 mb-6 lg:mb-0">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-lg">Design Tools</h3>
                
                {/* T-shirt Color Selection */}
                <div className="flex items-center">
                  <label className="text-sm font-medium text-gray-700 mr-2">
                    T-Shirt Color:
                  </label>
                  <Select
                    value={tshirtColor}
                    onValueChange={onColorChange}
                    disabled={isGenerating}
                  >
                    <SelectTrigger className="bg-white w-36">
                      <SelectValue placeholder="Select a color" />
                    </SelectTrigger>
                    <SelectContent>
                      {tshirtColorOptions.map(option => (
                        <SelectItem key={option.name} value={option.value}>
                          <div className="flex items-center">
                            <div 
                              className="w-4 h-4 rounded-full mr-2 border border-gray-300" 
                              style={{ backgroundColor: option.value }}
                            />
                            {option.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Design Canvas Tools with Error Boundary */}
              <div className="mb-4">
                <CanvasErrorBoundary>
                  <DesignCanvas 
                    tshirtColor={tshirtColor} 
                    onDesignChange={handleCanvasDesignChange}
                    initialImage={designImage}
                  />
                </CanvasErrorBoundary>
              </div>
            </div>
          </div>
          
          {/* Design Preview - Right Side */}
          <div className="w-full lg:w-1/2">
            <div className="bg-white rounded-lg p-4 shadow-sm h-full">
              <h3 className="font-medium text-lg mb-4">T-Shirt Preview</h3>
              <div className="relative flex items-center justify-center">
                <ErrorBoundary context="TshirtPreview">
                  <TshirtDesignPreview 
                    color={tshirtColor} 
                    designImage={designImage}
                  />
                </ErrorBoundary>

                {isGenerating && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 rounded-lg">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                    <p className="mt-4 text-blue-800 font-medium">Generating your design...</p>
                    <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
                  </div>
                )}
              </div>
              
              {/* Action Buttons - Below Preview */}
              <div className="mt-6 space-y-3">
                <Button 
                  onClick={onSaveDesign}
                  disabled={isSaving || !designImage || isGenerating}
                  className="w-full flex items-center justify-center gap-2"
                  variant="outline"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Design
                    </>
                  )}
                </Button>

                <AddToCartButton 
                  designImage={designImage}
                  tshirtColor={tshirtColor}
                  designName={designName}
                  answers={answers}
                  onSaveDesign={onSaveDesign}
                />

                <PlaceOrderButton 
                  designImage={designImage}
                  tshirtColor={tshirtColor}
                  designName={designName}
                  answers={answers}
                  onSaveDesign={onSaveDesign}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Design Preferences - Below Main Content */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-medium text-lg mb-4">Design Preferences</h3>
          <div className="border rounded-md p-3 bg-gray-50">
            {answers.length > 0 ? (
              answers.map((answer, index) => (
                <div key={index} className="py-2">
                  <p className="text-sm font-medium">{answer.question}</p>
                  <p className="text-sm text-gray-600">{answer.answer}</p>
                  {index < answers.length - 1 && <Separator className="my-2" />}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No design preferences set.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizationSection;
