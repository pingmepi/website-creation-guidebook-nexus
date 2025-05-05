
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";
import TshirtDesignPreview from "./TshirtDesignPreview";
import { Answer } from "./QuestionFlow";
import DesignCanvas from "./DesignCanvas";
import LoadingSpinner from "./LoadingSpinner";

interface TshirtColor {
  name: string;
  value: string;
}

interface CustomizationSectionProps {
  answers: Answer[];
  tshirtColor: string;
  designImage?: string;
  isSaving: boolean;
  isGenerating: boolean;
  tshirtColors: TshirtColor[];
  designName: string;
  onDesignNameChange: (name: string) => void;
  onColorChange: (color: string) => void;
  onDesignChange: (designImage: string) => void;
  onSaveDesign: () => void;
  CustomCanvas?: React.ComponentType<{
    tshirtColor: string;
    initialImage?: string;
    onDesignChange?: (dataURL: string) => void;
  }>;
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
  onSaveDesign,
  CustomCanvas = DesignCanvas
}: CustomizationSectionProps) => {
  const [activeTab, setActiveTab] = useState("canvas");

  const isLoading = isGenerating || isSaving;

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 order-2 md:order-1">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="canvas">Design Canvas</TabsTrigger>
              <TabsTrigger value="preview">T-Shirt Preview</TabsTrigger>
            </TabsList>
            <TabsContent value="canvas" className="border rounded-md p-4">
              {isLoading ? (
                <LoadingSpinner 
                  message={isGenerating ? "Generating your design..." : "Saving your design..."} 
                />
              ) : (
                <CustomCanvas
                  tshirtColor={tshirtColor}
                  initialImage={designImage}
                  onDesignChange={onDesignChange}
                />
              )}
            </TabsContent>
            <TabsContent value="preview" className="border rounded-md p-4">
              <TshirtDesignPreview
                tshirtColor={tshirtColor}
                designImage={designImage}
              />
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="md:w-1/3 order-1 md:order-2">
          <div className="bg-slate-50 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-semibold mb-4">Design Settings</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="design-name">Design Name</Label>
                <Input
                  id="design-name"
                  value={designName}
                  onChange={(e) => onDesignNameChange(e.target.value)}
                  placeholder="My Awesome Design"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label>T-Shirt Color</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {tshirtColors.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      className={`w-8 h-8 rounded-full ${
                        tshirtColor === color.value
                          ? "ring-2 ring-offset-2 ring-black"
                          : ""
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                      onClick={() => onColorChange(color.value)}
                    />
                  ))}
                </div>
              </div>

              <Button
                onClick={onSaveDesign}
                disabled={isLoading}
                className="w-full"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Design
              </Button>
            </div>
          </div>
          
          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">Design Information</h3>
            {answers.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {answers.map((answer, index) => (
                  <li key={index} className="flex">
                    <span className="font-medium text-slate-700 mr-2">
                      {answer.question}:
                    </span>
                    <span className="text-slate-600">
                      {Array.isArray(answer.answer)
                        ? answer.answer.join(", ")
                        : answer.answer.toString()}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">
                No design information available.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizationSection;
