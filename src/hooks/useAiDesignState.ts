
import { useState } from "react";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/integrations/supabase/client";
import { TSHIRT_COLORS } from "./useDesignState";

export interface AiGeneratedDesign {
  id: string;
  user_id: string;
  prompt: string;
  design_image: string;
  created_at: string;
  is_favorite: boolean;
  theme_id?: string;
}

export function useAiDesignState() {
  const { user, isAuthenticated } = useUser();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedDesigns, setGeneratedDesigns] = useState<AiGeneratedDesign[]>([]);
  const [selectedDesign, setSelectedDesign] = useState<AiGeneratedDesign | null>(null);
  
  const generateDesign = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt for your design");
      return;
    }
    
    if (!isAuthenticated || !user) {
      toast.error("Please log in to generate designs");
      return;
    }
    
    try {
      setIsGenerating(true);
      
      // Call the edge function to generate a design
      const { data: aiResponse, error: aiError } = await supabase.functions.invoke(
        'generate-ai-design',
        {
          body: { prompt },
        }
      );
      
      if (aiError) throw new Error(aiError.message);
      
      if (!aiResponse || !aiResponse.imageUrl) {
        throw new Error("No design image was generated");
      }
      
      // Save the generated design to Supabase
      const { data, error } = await supabase
        .from('ai_generated_designs')
        .insert({
          user_id: user.id,
          prompt: prompt,
          design_image: aiResponse.imageUrl,
          is_favorite: false
        })
        .select();
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        const newDesign = data[0] as unknown as AiGeneratedDesign;
        setGeneratedDesigns(prev => [newDesign, ...prev]);
        setSelectedDesign(newDesign);
        
        toast.success("Design generated successfully!", {
          description: "Your design is ready to customize."
        });
      }
      
    } catch (error) {
      console.error("Error generating design:", error);
      toast.error("Failed to generate design", {
        description: "Please try again later."
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const fetchUserDesigns = async () => {
    if (!isAuthenticated || !user) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('ai_generated_designs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setGeneratedDesigns(data as unknown as AiGeneratedDesign[] || []);
    } catch (error) {
      console.error("Error fetching AI designs:", error);
      toast.error("Failed to load your AI designs");
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleFavorite = async (designId: string) => {
    try {
      // Find the design in state
      const design = generatedDesigns.find(d => d.id === designId);
      if (!design) return;
      
      // Update local state immediately for better UX
      setGeneratedDesigns(generatedDesigns.map(d => 
        d.id === designId ? {...d, is_favorite: !d.is_favorite} : d
      ));
      
      // Update in Supabase
      const { error } = await supabase
        .from('ai_generated_designs')
        .update({ is_favorite: !design.is_favorite })
        .eq('id', designId);
        
      if (error) throw error;
      
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Failed to update favorite status");
      
      // Revert the state change if there was an error
      fetchUserDesigns();
    }
  };
  
  const useAiDesignInTshirt = async (design: AiGeneratedDesign) => {
    try {
      // Create a new t-shirt design using the AI-generated design
      const { data, error } = await supabase
        .from('designs')
        .insert({
          user_id: user!.id,
          name: `AI Design - ${new Date().toLocaleString("en-US", {
            month: "short", day: "numeric", hour: "numeric", minute: "numeric"
          })}`,
          t_shirt_color: TSHIRT_COLORS.WHITE,
          preview_url: design.design_image,
          design_data: JSON.stringify({
            prompt: design.prompt,
            ai_design_id: design.id
          }),
          is_public: false
        })
        .select();
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        toast.success("AI design applied to t-shirt!", {
          description: "You can now customize your t-shirt design."
        });
        return data[0].id;
      }
      
    } catch (error) {
      console.error("Error using AI design:", error);
      toast.error("Failed to create t-shirt from AI design");
    }
    
    return null;
  };
  
  return {
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
  };
}
