import { useState } from "react";
import { Theme } from "./types";
import { Answer } from "@/components/design/QuestionFlow";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";

export function useDesignGeneration() {
  const { user } = useUser();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateDesignWithAI = async (
    selectedTheme: Theme | null,
    answers: Answer[],
    setDesignImage: (image: string) => void,
    saveDesignToDatabase: (imageUrl: string, prompt: string, userId: string) => Promise<void>
  ) => {
    if (!selectedTheme || answers.length === 0) {
      toast.error("Theme and answers are required to generate design");
      return;
    }

    try {
      setIsGenerating(true);
      const toastId = toast.loading("Generating your design with AI...");
      const startTime = Date.now();

      // Prepare the payload
      const payload = {
        theme: selectedTheme,
        answers: answers,
        userId: user?.id
      };

      console.log("📡 CLIENT: Preparing to call Edge Function with payload:", {
        theme: selectedTheme.name,
        answersCount: answers.length,
        hasUserId: !!user?.id
      });

      // Get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("❌ CLIENT: Session error:", sessionError);
        throw new Error("Authentication error: " + sessionError.message);
      }

      console.log("🔑 CLIENT: Session available:", !!session);

      // We'll use a simple timeout without AbortController since we removed the signal
      let functionTimedOut = false;
      const timeoutId = setTimeout(() => {
        functionTimedOut = true;
      }, 15000); // 15 second timeout

      try {
        console.log("📡 CLIENT: Calling supabase.functions.invoke now...");

        const { data: aiResponse, error: aiError } = await supabase.functions.invoke(
          'generate-ai-design',
          {
            body: payload,
            headers: session ? {
              Authorization: `Bearer ${session.access_token}`
            } : undefined,
            method: 'POST'
            // Remove signal property as it's not supported in the FunctionInvokeOptions type
          }
        );

        console.log(`✅ CLIENT: Function invocation completed in ${Date.now() - startTime}ms`);

        if (aiError) {
          console.error("❌ CLIENT: Function returned error:", aiError);
          throw new Error(aiError.message);
        }

        if (!aiResponse) {
          console.error("❌ CLIENT: No response data from function");
          throw new Error("No response data from design generation function");
        }

        console.log("✅ CLIENT: Received AI response:", {
          hasImageUrl: !!aiResponse.imageUrl,
          isMock: aiResponse.isMock || false,
          hasError: !!aiResponse.error
        });

        // Set the image in the UI
        setDesignImage(aiResponse.imageUrl);

        // Save to database if not already saved by the function
        if (user?.id && !aiResponse.savedToDatabase) {
          await saveDesignToDatabase(aiResponse.imageUrl, aiResponse.prompt, user.id);
        }

        toast.dismiss(toastId);

        if (aiResponse.isMock) {
          toast.warning("Using placeholder design", {
            description: aiResponse.error || "The design service is currently unavailable."
          });
        } else {
          toast.success("Design generated successfully!");
        }

      } catch (error) {
        console.error("❌ CLIENT: Function call error:", error);

        if (functionTimedOut) {
          console.error("❌ CLIENT: Function call timed out");
          throw new Error("Design generation timed out. Please try again later.");
        }
        throw error;
      } finally {
        clearTimeout(timeoutId);
      }

    } catch (error) {
      console.error("❌ CLIENT: Error generating design with AI:", error);

      // Use placeholder image as fallback
      setDesignImage("/assets/images/design/placeholder.svg");

      toast.dismiss();
      toast.error("Design generation failed", {
        description: error.message || "Please try again later."
      });
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
