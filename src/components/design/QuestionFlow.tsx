
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface Answer {
  question: string;
  answer: string;
}

interface QuestionFlowProps {
  selectedTheme: any;
  onComplete: (answers: Answer[]) => void;
  onBack: () => void;
}

interface QuestionType {
  id: number;
  question: string;
  type: "text" | "radio" | "textarea";
  options?: string[];
}

const QuestionFlow = ({ selectedTheme, onComplete, onBack }: QuestionFlowProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  
  const questions: QuestionType[] = [
    { 
      id: 1, 
      question: "What's the main message you want on your t-shirt?", 
      type: "text" 
    },
    { 
      id: 2, 
      question: "What style are you looking for?", 
      type: "radio",
      options: ["Casual", "Formal", "Sporty", "Vintage", "Minimal"] 
    },
    { 
      id: 3, 
      question: "What's the occasion for this t-shirt?", 
      type: "radio",
      options: ["Everyday wear", "Special event", "Gift", "Team/Group", "Casual wear"] 
    },
    { 
      id: 4, 
      question: "Any additional details you'd like to include in your design?", 
      type: "textarea" 
    }
  ];
  
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
  }, [currentQuestionIndex, answers]);
  
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
      // Don't proceed if answer is empty
      return;
    }
    
    saveAnswer();
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      console.log("All questions answered:", answers);
      onComplete([...answers, { 
        question: questions[currentQuestionIndex].question, 
        answer: currentAnswer 
      }]);
    }
  };
  
  const handleBack = () => {
    if (currentAnswer.trim()) {
      saveAnswer();
    }
    
    if (currentQuestionIndex > 0) {
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
            <path d="M15 18l-6-6 6-6"/>
          </svg>
          {currentQuestionIndex === 0 ? 'Back to Themes' : 'Previous Question'}
        </Button>
        
        <Button 
          onClick={handleNext}
          disabled={!currentAnswer.trim()}
        >
          {currentQuestionIndex === questions.length - 1 ? 'Complete' : 'Next Question'}
          <svg className="ml-2" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </Button>
      </div>
    </div>
  );
};

export default QuestionFlow;
