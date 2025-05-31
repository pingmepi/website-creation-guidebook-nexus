
import { Theme } from "@/hooks/design/types";
import { Answer } from "@/components/design/QuestionFlow";

export const createMockTheme = (): Theme => ({
  id: "test-theme-id",
  name: "Test Theme",
  description: "A test theme for testing purposes",
  category: "test",
  thumbnail_url: "/test-thumbnail.jpg"
});

export const createMockAnswers = (): Answer[] => [
  {
    question: "What style do you prefer?",
    answer: "Modern"
  },
  {
    question: "What colors do you like?",
    answer: "Blue and white"
  },
  {
    question: "What's your favorite activity?",
    answer: "Reading"
  }
];

export const createMockUser = () => ({
  id: "test-user-id",
  email: "test@example.com",
  full_name: "Test User"
});

export const createMockDesignData = () => ({
  id: "test-design-id",
  name: "Test Design",
  theme: createMockTheme(),
  answers: createMockAnswers(),
  tshirtColor: "#FFFFFF",
  designImage: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQV"
});
