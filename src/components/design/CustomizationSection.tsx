
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import TshirtDesignPreview from "./TshirtDesignPreview";
import { Separator } from "@/components/ui/separator";
import { ShirtIcon, Save, Loader2 } from "lucide-react";
import { Answer } from "./QuestionFlow";

interface CustomizationSectionProps {
  answers: Answer[];
  tshirtColor: string;
  designImage?: string;
  isSaving: boolean;
  isGenerating?: boolean;
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
  isGenerating,
  tshirtColors,
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
      <div className="flex flex-col md:flex-row md:gap-8">
        {/* T-shirt preview */}
        <div className="md:w-1/2">
          <div className="bg-white rounded-lg p-4">
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
            
            <div className="mt-4 space-y-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">
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
            </div>
          </div>
        </div>
        
        {/* Design details */}
        <div className="md:w-1/2 mt-6 md:mt-0">
          <div className="bg-white rounded-lg p-4">
            <h3 className="font-medium text-lg mb-4">Design Details</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="design-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Design Name
                </label>
                <Input
                  id="design-name"
                  placeholder="My Awesome Design"
                  className="w-full"
                  disabled={isGenerating}
                />
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Design Preferences</h4>
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
            
            <div className="mt-6 flex justify-end">
              <Button 
                onClick={onSaveDesign}
                disabled={isSaving || !designImage || isGenerating}
                className="flex items-center gap-2"
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
      </div>
    </div>
  );
};

export default CustomizationSection;
