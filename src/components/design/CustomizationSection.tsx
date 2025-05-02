
import React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import TshirtDesignPreview from "./TshirtDesignPreview";
import { Separator } from "@/components/ui/separator";
import { Save, Loader2 } from "lucide-react";
import { Answer } from "./QuestionFlow";
import DesignCanvas from "./DesignCanvas";

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
  const tshirtColorOptions = Object.entries(tshirtColors).map(([name, value]) => ({
    name,
    value
  }));

  return (
    <div className="py-6">
      {/* Design Name at Top Left */}
      <div className="mb-6">
        <Input
          id="design-name"
          placeholder="My Awesome Design"
          value={designName}
          onChange={(e) => onDesignNameChange && onDesignNameChange(e.target.value)}
          className="text-lg font-medium w-full max-w-xs"
          disabled={isGenerating}
        />
      </div>

      <div className="flex flex-col space-y-8">
        {/* Top Section: Design Canvas and Tools */}
        <div className="flex flex-col md:flex-row md:gap-6">
          {/* Design Tools - Left Side */}
          <div className="md:w-1/3">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-medium text-lg mb-4">Design Tools</h3>
              
              {/* T-shirt Color Selection */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  T-Shirt Color
                </label>
                <Select
                  value={tshirtColor}
                  onValueChange={onColorChange}
                  disabled={isGenerating}
                >
                  <SelectTrigger className="bg-white">
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
              
              {/* Design Canvas Tools */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Canvas Tools</h4>
                <DesignCanvas 
                  tshirtColor={tshirtColor} 
                  onDesignChange={onDesignChange} 
                  initialImage={designImage}
                />
              </div>
              
              {/* Save Button */}
              <div className="mt-6">
                <Button 
                  onClick={onSaveDesign}
                  disabled={isSaving || !designImage || isGenerating}
                  className="w-full flex items-center justify-center gap-2"
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
              </div>
            </div>
          </div>
          
          {/* Design Preview - Right Side */}
          <div className="md:w-2/3 mt-6 md:mt-0">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-medium text-lg mb-4">Preview</h3>
              <div className="relative">
                <TshirtDesignPreview 
                  color={tshirtColor} 
                  designImage={designImage}
                />

                {isGenerating && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 rounded-lg">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                    <p className="mt-4 text-blue-800 font-medium">Generating your design...</p>
                    <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Design Preferences - Below Main Content */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-medium text-lg mb-4">Design Preferences</h3>
          <div className="border rounded-md p-3 bg-gray-50">
            {answers.map((answer, index) => (
              <div key={index} className="py-2">
                <p className="text-sm font-medium">{answer.question}</p>
                <p className="text-sm text-gray-600">{answer.answer}</p>
                {index < answers.length - 1 && <Separator className="my-2" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizationSection;
