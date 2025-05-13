
import { useState } from "react";
import { Theme } from "./types";
import { Answer } from "@/components/design/QuestionFlow";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useUser } from "@/contexts/UserContext";

export function useDesignGeneration() {
  const { user, isAuthenticated } = useUser();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateDesignWithAI = async (
    selectedTheme: Theme | null,
    answers: Answer[],
    setDesignImage: (image: string) => void,
    saveDesignCallback: (imageUrl: string, prompt: string, userId: string) => Promise<void>
  ) => {
    if (!selectedTheme || answers.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Theme and answers are required to generate design"
      });
      return;
    }

    try {
      setIsGenerating(true);
      toast({
        title: "Generating design...",
        description: "Creating your custom t-shirt design with AI",
      });

      // Check authentication status
      console.log("CLIENT: Authentication status:", isAuthenticated);
      console.log("🔍 CLIENT: User data:", user ? `ID: ${user.id}` : "No user");

      // Prepare payload with explicit userId
      const payload = {
        theme: selectedTheme,
        answers: answers,
        userId: user?.id || null
      };

      console.log("CLIENT: Invoking generate-ai-design function with:", {
        theme: selectedTheme.name,
        answersCount: answers.length,
        userId: user?.id || "not provided"
      });

      // Log the exact payload being sent
      console.log("📦 CLIENT: Sending exact payload:", JSON.stringify(payload, null, 2));

      const startTime = Date.now();

      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      console.log("🔑 CLIENT: Session available:", !!session);

      // Call the edge function to generate the design with explicit headers
      console.log("📡 CLIENT: Calling supabase.functions.invoke now...");
      const { data: aiResponse, error: aiError } = await supabase.functions.invoke(
        'generate-ai-design',
        {
          body: payload,
          headers: session ? {
            Authorization: `Bearer ${session.access_token}`
          } : undefined,
        }
      );

      console.log(`✅ CLIENT: Function invocation completed in ${Date.now() - startTime}ms`);

      if (aiError) {
        console.error("❌ CLIENT: Function returned error:", aiError);
        throw new Error(aiError.message);
      }

      console.log("✅ CLIENT: AI response received:", {
        hasImageUrl: !!aiResponse?.imageUrl,
        promptLength: aiResponse?.prompt?.length || 0,
        responseSize: JSON.stringify(aiResponse).length
      });

      if (!aiResponse || !aiResponse.imageUrl) {
        console.error("❌ CLIENT: Missing image URL in response");
        throw new Error("No design image was generated");
      }

      // Set the generated design image
      setDesignImage(aiResponse.imageUrl);

      // Save the design image with the answers and theme
      if (user) {
        await saveDesignCallback(aiResponse.imageUrl, aiResponse.prompt || '', user.id);
      }

      toast({
        title: "Your design is ready!",
        description: "We've created a custom t-shirt design based on your preferences."
      });
    } catch (error) {
      console.error("❌ CLIENT: Error generating design with AI:", error);
      console.error("❌ CLIENT: Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });

      toast({
        variant: "destructive",
        title: "Failed to generate design",
        description: "Please try again later."
      });

      // Set placeholder design image if generation fails
      setDesignImage("/assets/images/design/placeholder.svg");
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    setIsGenerating,
    generateDesignWithAI
  };
}
