
import { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Wand2, ShirtIcon, Star, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AiGeneratedDesign } from "@/hooks/useAiDesignState";

const AIDesigns = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [designs, setDesigns] = useState<AiGeneratedDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchDesigns = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("ai_generated_designs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      setDesigns(data || []);
    } catch (error) {
      console.error("Error fetching AI designs:", error);
      toast.error("Failed to load your AI designs");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDesign = async (id: string) => {
    if (!confirm("Are you sure you want to delete this AI design?")) return;
    
    try {
      setDeleting(id);
      
      const { error } = await supabase
        .from("ai_generated_designs")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      setDesigns((designs) => designs.filter((design) => design.id !== id));
      toast.success("AI design deleted successfully");
    } catch (error) {
      console.error("Error deleting AI design:", error);
      toast.error("Failed to delete design");
    } finally {
      setDeleting(null);
    }
  };
  
  const handleToggleFavorite = async (design: AiGeneratedDesign) => {
    try {
      // Update local state immediately for better UX
      setDesigns(designs.map(d => 
        d.id === design.id ? {...d, is_favorite: !d.is_favorite} : d
      ));
      
      // Update in Supabase
      const { error } = await supabase
        .from('ai_generated_designs')
        .update({ is_favorite: !design.is_favorite })
        .eq('id', design.id);
        
      if (error) throw error;
      
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Failed to update favorite status");
      
      // Revert the state change if there was an error
      fetchDesigns();
    }
  };
  
  const handleCreateTshirt = async (design: AiGeneratedDesign) => {
    try {
      // Create a new t-shirt design using the AI-generated design
      const { data, error } = await supabase
        .from('designs')
        .insert({
          user_id: user!.id,
          name: `AI Design - ${new Date().toLocaleString("en-US", {
            month: "short", day: "numeric", hour: "numeric", minute: "numeric"
          })}`,
          t_shirt_color: "#FFFFFF", // White as default
          preview_url: design.design_image,
          is_ai_generated: true,
          design_data: JSON.stringify({
            prompt: design.prompt,
            ai_design_id: design.id
          })
        })
        .select();
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        toast.success("AI design applied to t-shirt!", {
          description: "You can now customize your t-shirt design."
        });
        navigate(`/design?id=${data[0].id}`);
      }
      
    } catch (error) {
      console.error("Error using AI design:", error);
      toast.error("Failed to create t-shirt from AI design");
    }
  };

  useEffect(() => {
    fetchDesigns();
  }, [user]);

  return (
    <DashboardLayout title="AI Designs">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">AI Generated Designs</h2>
          <Button asChild>
            <button onClick={() => navigate("/ai-design")}>
              <Wand2 className="mr-2 h-4 w-4" />
              Generate New Design
            </button>
          </Button>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-400" />
            <p className="mt-2 text-gray-500">Loading your AI designs...</p>
          </div>
        ) : designs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {designs.map((design) => (
              <Card key={design.id} className="overflow-hidden">
                <div className="h-48 bg-gray-50 flex items-center justify-center p-4">
                  <img 
                    src={design.design_image} 
                    alt={design.prompt}
                    className="max-h-full object-contain"
                  />
                </div>
                
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm text-gray-500">
                      {new Date(design.created_at).toLocaleDateString()}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 h-auto"
                      onClick={() => handleToggleFavorite(design)}
                    >
                      {design.is_favorite ? (
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ) : (
                        <Star className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {design.prompt}
                  </p>
                </CardContent>
                
                <CardFooter className="p-4 pt-0 flex justify-between gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleCreateTshirt(design)}
                  >
                    <ShirtIcon className="mr-1 h-3 w-3" />
                    Use Design
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleDeleteDesign(design.id)}
                    disabled={deleting === design.id}
                  >
                    {deleting === design.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border rounded-md bg-gray-50">
            <Wand2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium">No AI designs yet</h3>
            <p className="mt-1 text-gray-500">Generate your first AI design</p>
            <Button className="mt-6" onClick={() => navigate("/ai-design")}>
              Start Generating
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AIDesigns;
