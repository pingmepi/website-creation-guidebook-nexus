
import { useState } from "react";
import { Theme } from "./types";
import { Answer } from "@/components/design/QuestionFlow";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { ErrorLogger } from "@/services/ErrorLogger";
import { sanitizeAnswers, sanitizeText } from "@/lib/sanitization";

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
      const error = new Error("Theme and answers are required to generate design");
      ErrorLogger.log(error, "DesignGeneration:Validation", {
        hasTheme: !!selectedTheme,
        answersLength: answers.length
      });

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
        description: "Creating your custom t-shirt design with AI"
      });

      // Check authentication status
      console.log("CLIENT: Authentication status:", isAuthenticated);
      console.log("🔍 CLIENT: User data:", user ? `ID: ${user.id}` : "No user");

      // Validate answers to ensure they have the right format
      const validAnswers = answers.filter(answer =>
        answer && typeof answer.question === 'string' && typeof answer.answer === 'string'
      );

      if (validAnswers.length === 0) {
        throw new Error("No valid answers provided");
      }

      // Sanitize inputs
      const sanitizedTheme = selectedTheme ? { ...selectedTheme, name: sanitizeText(selectedTheme.name) } : null;
      const sanitizedAnswers = sanitizeAnswers(validAnswers);

      // Prepare payload with explicit userId
      const payload = {
        theme: sanitizedTheme,
        answers: sanitizedAnswers,
        userId: user?.id || null
      };

      console.log("CLIENT [DEPLOY_CHECK]: Invoking generate-ai-design function with:", {
        theme: selectedTheme.name,
        answersCount: validAnswers.length,
        userId: user?.id || "not provided"
      });

      const startTime = Date.now();

      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      console.log("🔑 CLIENT: Session available for function call:", !!session);
      if (session) {
        console.log("🔑 CLIENT: Token prefix:", session.access_token.substring(0, 10) + "...");
      }

      // Call the edge function to generate the design
      console.log("📡 CLIENT: Invoking generate-ai-design. Payload (truncated):", {
        theme: payload.theme?.name,
        answersCount: payload.answers.length,
        userId: payload.userId
      });

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
        ErrorLogger.log(new Error(aiError.message), "DesignGeneration:AIFunction", {
          functionError: aiError,
          theme: selectedTheme.name,
          userId: user?.id
        });
        throw new Error(aiError.message);
      }

      console.log("✅ CLIENT: AI response received:", {
        hasImageUrl: !!aiResponse?.imageUrl,
        promptLength: aiResponse?.prompt?.length || 0,
        responseSize: JSON.stringify(aiResponse).length
      });

      if (!aiResponse || !aiResponse.imageUrl) {
        console.error("❌ CLIENT: Missing image URL in response");
        ErrorLogger.log(new Error("No design image was generated"), "DesignGeneration:MissingImage", {
          response: aiResponse,
          theme: selectedTheme.name
        });
        throw new Error("No design image was generated");
      }

      // Set the generated design image
      setDesignImage(aiResponse.imageUrl);

      // Save the design image with the answers and theme
      if (user) {
        await saveDesignCallback(aiResponse.imageUrl, aiResponse.prompt || '', user.id);
      }

      toast({
        title: aiResponse.fallback ? "Design created with fallback" : "Your design is ready!",
        description: aiResponse.fallback
          ? "We used a simplified design due to content restrictions."
          : "We've created a custom t-shirt design based on your preferences."
      });
    } catch (error) {
      console.error("❌ CLIENT: Error generating design with AI:", error);
      console.error("❌ CLIENT: Error details:", {
        message: (error as any).message,
        stack: (error as any).stack,
        name: (error as any).name
      });

      ErrorLogger.log(error as Error, "DesignGeneration:GeneralError", {
        theme: selectedTheme?.name,
        answersCount: answers.length,
        userId: user?.id,
        isAuthenticated
      });

      toast({
        variant: "destructive",
        title: "Failed to generate design",
        description: "Please try again with different preferences."
      });

      // Set placeholder design image if generation fails
      console.log("Setting fallback placeholder design image");
      setDesignImage("/placeholder.svg");
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
