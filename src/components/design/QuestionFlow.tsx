
import { useState, useEffect, useMemo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Theme } from "@/hooks/design/types";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/trackEvent";

export interface Answer {
  question: string;
  answer: string;
}

interface QuestionFlowProps {
  selectedTheme: Theme;
  onComplete: (answers: Answer[]) => void;
  onBack: () => void;
}

interface QuestionType {
  id: number | string;
  question: string;
  type: "text" | "radio" | "textarea" | "color" | "choice";
  options?: string[];
}

// Default fallback questions if database fetch fails
const defaultQuestions: QuestionType[] = [
  { id: 1, question: "What's the main message you want on your t-shirt?", type: "text" },
  { id: 2, question: "What style are you looking for?", type: "radio", options: ["Casual", "Formal", "Sporty", "Vintage", "Minimal"] },
  { id: 3, question: "What's the occasion for this t-shirt?", type: "radio", options: ["Everyday wear", "Special event", "Gift", "Team/Group", "Casual wear"] },
  { id: 4, question: "What colors do you prefer?", type: "radio", options: ["Dark", "Light", "Vibrant", "Pastel", "Monochrome"] },
  { id: 5, question: "Any additional details you'd like to include in your design?", type: "textarea" }
];

const QuestionFlow = ({ selectedTheme, onComplete, onBack }: QuestionFlowProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [questions, setQuestions] = useState<QuestionType[]>(defaultQuestions);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch questions from database based on theme
  const fetchQuestions = useCallback(async () => {
    try {
      setIsLoading(true);

      // Use the theme ID if it's a valid UUID, otherwise skip DB fetch
      const themeId = typeof selectedTheme.id === 'string' &&
        selectedTheme.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
        ? selectedTheme.id
        : null;

      if (!themeId) {
        console.log("Theme ID is not a UUID, using default questions");
        setQuestions(defaultQuestions);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.rpc('get_theme_questions', {
        theme_uuid: themeId
      });

      if (error) {
        console.error("Error fetching theme questions:", error);
        setQuestions(defaultQuestions);
      } else if (data && data.length > 0) {
        // Transform database questions to component format
        const dbQuestions: QuestionType[] = data.map((q: any) => ({
          id: q.id,
          question: q.question_text,
          type: q.type === 'choice' ? 'radio' : q.type,
          options: q.options ? (Array.isArray(q.options) ? q.options : JSON.parse(q.options)) : undefined
        }));
        setQuestions(dbQuestions);
        console.log(`Loaded ${dbQuestions.length} questions for theme: ${selectedTheme.name}`);
      } else {
        console.log("No questions found in database, using defaults");
        setQuestions(defaultQuestions);
      }
    } catch (err) {
      console.error("Failed to fetch questions:", err);
      setQuestions(defaultQuestions);
    } finally {
      setIsLoading(false);
    }
  }, [selectedTheme]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  useEffect(() => {
    // Pre-populate answers if they exist
    const existingAnswer = answers.find(a =>
      a.question === questions[currentQuestionIndex].question
    );

    if (existingAnswer) {
      setCurrentAnswer(existingAnswer.answer);
    } else {
      setCurrentAnswer("");
    }
  }, [currentQuestionIndex, answers, questions]);

  const saveAnswer = () => {
    if (!currentAnswer.trim()) return; // Don't save empty answers

    const question = questions[currentQuestionIndex];
    console.log(`Saving answer for question: ${question.question}, answer: ${currentAnswer}`);

    // Update or add the answer
    const newAnswers = [...answers];
    const existingIndex = answers.findIndex(a => a.question === question.question);

    if (existingIndex >= 0) {
      newAnswers[existingIndex] = {
        question: question.question,
        answer: currentAnswer
      };
    } else {
      newAnswers.push({
        question: question.question,
        answer: currentAnswer
      });
    }

    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (!currentAnswer.trim()) {
      return;
    }

    saveAnswer();

    trackEvent("question_answered", {
      question_index: currentQuestionIndex,
      question_type: questions[currentQuestionIndex]?.type,
      total_questions: questions.length,
    });

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      const updatedAnswers = [...answers];
      const currentQ = questions[currentQuestionIndex];
      const existingIndex = answers.findIndex(a => a.question === currentQ.question);

      if (existingIndex >= 0) {
        updatedAnswers[existingIndex] = {
          question: currentQ.question,
          answer: currentAnswer,
        };
      } else {
        updatedAnswers.push({
          question: currentQ.question,
          answer: currentAnswer,
        });
      }

      trackEvent("questions_completed", {
        answer_count: updatedAnswers.length,
        theme_name: selectedTheme.name,
      });
      console.log("All questions answered:", updatedAnswers);
      onComplete(updatedAnswers);
    }
  };

  const handleBack = () => {
    if (currentAnswer.trim()) {
      saveAnswer();
    }

    if (currentQuestionIndex > 0) {
      trackEvent("question_skipped", { question_index: currentQuestionIndex });
      setCurrentQuestionIndex(prev => prev - 1);
    } else {
      onBack();
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const renderQuestionInput = () => {
    switch (currentQuestion.type) {
      case "text":
        return (
          <Input
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            className="w-full text-lg p-4 h-auto"
            placeholder="Enter your text here"
          />
        );
      case "radio":
        return (
          <RadioGroup
            value={currentAnswer}
            onValueChange={setCurrentAnswer}
            className="space-y-3"
          >
            {currentQuestion.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={option} />
                <Label htmlFor={option}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      case "textarea":
        return (
          <Textarea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder="Enter your details here"
            className="min-h-32"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="py-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Create Your T-Shirt Design</h2>
        <p className="text-gray-600 mb-4">Question {currentQuestionIndex + 1} of {questions.length}</p>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-medium mb-6">{currentQuestion.question}</h2>
        {renderQuestionInput()}
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          {currentQuestionIndex === 0 ? 'Back to Themes' : 'Previous Question'}
        </Button>

        <Button
          onClick={handleNext}
          disabled={!currentAnswer.trim()}
        >
          {currentQuestionIndex === questions.length - 1 ? 'Complete' : 'Next Question'}
          <svg className="ml-2" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Button>
      </div>
    </div>
  );
};

export default QuestionFlow;
