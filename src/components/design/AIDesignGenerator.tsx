
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Wand2, Heart, Loader2, ShirtIcon, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAiDesignState } from "@/hooks/useAiDesignState";

const AIDesignGenerator = () => {
  const {
    prompt,
    setPrompt,
    isGenerating,
    isLoading,
    generatedDesigns,
    selectedDesign,
    setSelectedDesign,
    generateDesign,
    fetchUserDesigns,
    toggleFavorite,
    useAiDesignInTshirt
  } = useAiDesignState();
  
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchUserDesigns();
  }, []);
  
  const handleUseDesign = async () => {
    if (!selectedDesign) return;
    
    const designId = await useAiDesignInTshirt(selectedDesign);
    if (designId) {
      navigate(`/design?id=${designId}`);
    }
  };
  
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Generate T-Shirt Design with AI</h2>
        <p className="text-gray-600">
          Enter a detailed prompt describing your ideal t-shirt design, and our AI will generate it for you!
        </p>
        
        <div className="flex items-center gap-2">
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="E.g., A minimalist mountain landscape with sunset colors"
            className="flex-1"
            disabled={isGenerating}
          />
          <Button 
            onClick={generateDesign}
            disabled={isGenerating || !prompt.trim()}
            className="flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                Generate
              </>
            )}
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : generatedDesigns.length > 0 ? (
        <div className="space-y-4">
          {selectedDesign && (
            <div className="space-y-4 border rounded-lg p-6">
              <div className="flex justify-between items-start">
                <h3 className="font-medium">Selected Design</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => toggleFavorite(selectedDesign.id)}
                >
                  {selectedDesign.is_favorite ? (
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ) : (
                    <Star className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 flex justify-center">
                <img 
                  src={selectedDesign.design_image} 
                  alt={selectedDesign.prompt}
                  className="max-h-72 object-contain"
                />
              </div>
              
              <p className="text-sm text-gray-600">
                <span className="font-medium">Prompt:</span> {selectedDesign.prompt}
              </p>
              
              <Button 
                className="w-full flex items-center gap-2"
                onClick={handleUseDesign}
              >
                <ShirtIcon className="h-4 w-4" />
                Use This Design
              </Button>
            </div>
          )}
          
          <h3 className="font-medium">Your Generated Designs</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {generatedDesigns.map((design) => (
              <Card 
                key={design.id} 
                className={`overflow-hidden cursor-pointer transition-all ${
                  selectedDesign?.id === design.id ? 'ring-2 ring-blue-600' : ''
                }`}
                onClick={() => setSelectedDesign(design)}
              >
                <div className="h-40 bg-gray-50 flex items-center justify-center">
                  <img 
                    src={design.design_image} 
                    alt={design.prompt}
                    className="max-h-full object-contain"
                  />
                </div>
                <CardContent className="p-3">
                  <div className="flex justify-between items-start">
                    <p className="text-xs text-gray-500 truncate flex-1">
                      {new Date(design.created_at).toLocaleDateString()}
                    </p>
                    {design.is_favorite && (
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg bg-gray-50">
          <Wand2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium">No designs yet</h3>
          <p className="mt-1 text-gray-500">Generate your first AI design</p>
        </div>
      )}
    </div>
  );
};

export default AIDesignGenerator;
