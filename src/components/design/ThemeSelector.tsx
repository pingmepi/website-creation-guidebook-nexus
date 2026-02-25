
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { trackEvent } from "@/lib/trackEvent";

// Define theme categories and themes
const categories = ["All", "Artistic", "Minimal", "Nature", "Abstract", "Typography", "Lifestyle", "Style"];

interface Theme {
  id: number;
  name: string;
  description: string;
  color: string;
  category: string[];
  image: string;
}

const themes: Theme[] = [
  // Original 8 themes
  { id: 1, name: "Travel", description: "Capture your wanderlust", color: "#00BCD4", category: ["Artistic"], image: "/uploads/1fb8d5ab-666d-49a1-b349-c0a086a816fa.png" },
  { id: 2, name: "Music", description: "Express your rhythm", color: "#9C27B0", category: ["Abstract", "Artistic"], image: "/uploads/754dd742-8aea-49d6-ac83-97af6c757084.png" },
  { id: 3, name: "Vintage", description: "Classic retro style", color: "#A67C52", category: ["Artistic"], image: "/uploads/6676f311-43f9-47ee-86aa-e7bd93150976.png" },
  { id: 4, name: "Nature", description: "Connect with the outdoors", color: "#8BC34A", category: ["Nature"], image: "/uploads/3de9e312-dbc0-48a8-ad72-5f348b474fb9.png" },
  { id: 5, name: "Abstract", description: "Bold geometric patterns", color: "#FF1493", category: ["Abstract"], image: "/uploads/3390f772-94a3-49ac-9380-6d8e091a4c65.png" },
  { id: 6, name: "Artistic", description: "Expressive and creative", color: "#00E5B2", category: ["Artistic"], image: "/uploads/0a1a3611-6080-4670-a291-9e87b4247dec.png" },
  { id: 7, name: "Cyberpunk", description: "Futuristic neon aesthetics", color: "#E91E63", category: ["Abstract"], image: "/uploads/8398eed3-bd38-4e5f-9278-00f9f2ca7c7a.png" },
  { id: 8, name: "Funny", description: "Lighthearted and humorous", color: "#FFC107", category: ["Typography"], image: "/uploads/a864a361-eb88-4887-ae3b-93c9731c347a.png" },
  // 10 new themes for PRD compliance
  { id: 9, name: "Sports", description: "Athletic and sports-themed designs", color: "#FF5722", category: ["Lifestyle"], image: "/uploads/theme_sports.png" },
  { id: 10, name: "Motivational", description: "Inspiring quotes and positive vibes", color: "#FFB300", category: ["Typography"], image: "/uploads/theme_motivational.png" },
  { id: 11, name: "Pop Culture", description: "Trending memes and cultural references", color: "#E040FB", category: ["Abstract"], image: "/uploads/theme_popculture.png" },
  { id: 12, name: "Food & Drink", description: "Culinary and beverage inspired art", color: "#F48FB1", category: ["Artistic"], image: "/uploads/theme_food.png" },
  { id: 13, name: "Animals", description: "Wildlife and pet-themed designs", color: "#795548", category: ["Nature"], image: "/uploads/theme_animals.png" },
  { id: 14, name: "Tech", description: "Developer and technology aesthetics", color: "#00BFA5", category: ["Abstract"], image: "/uploads/theme_tech.png" },
  { id: 15, name: "Fashion", description: "High-fashion and streetwear style", color: "#212121", category: ["Style"], image: "/uploads/theme_fashion.png" },
  { id: 16, name: "Humor", description: "Witty and comedic designs", color: "#FFEB3B", category: ["Typography"], image: "/uploads/theme_humor.png" },
  { id: 17, name: "Spiritual", description: "Zen, meditation, and mindfulness", color: "#CE93D8", category: ["Minimal"], image: "/uploads/theme_spiritual.png" },
  { id: 18, name: "Fitness", description: "Gym and workout motivation", color: "#F44336", category: ["Lifestyle"], image: "/uploads/theme_fitness.png" }
];


interface ThemeSelectorProps {
  onThemeSelect: (theme: Theme) => void;
}

const ThemeSelector = ({ onThemeSelect }: ThemeSelectorProps) => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedThemes, setSelectedThemes] = useState<number[]>([]);

  const filteredThemes = selectedCategory === "All"
    ? themes
    : themes.filter(theme => theme.category.includes(selectedCategory));

  const toggleThemeSelection = (themeId: number) => {
    const theme = themes.find(t => t.id === themeId);
    if (selectedThemes.includes(themeId)) {
      setSelectedThemes(selectedThemes.filter(id => id !== themeId));
      trackEvent("theme_deselected", { theme_id: themeId, theme_name: theme?.name });
    } else {
      if (selectedThemes.length < 3) {
        setSelectedThemes([...selectedThemes, themeId]);
        trackEvent("theme_selected", { theme_id: themeId, theme_name: theme?.name });
      }
    }
  };

  const isThemeSelected = (themeId: number) => selectedThemes.includes(themeId);

  return (
    <div className="py-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2 flex items-center">
          <span className="inline-flex items-center justify-center w-8 h-8 mr-2 bg-blue-100 text-blue-800 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          </span>
          Choose Your Design Themes
        </h2>
        <p className="text-gray-600">Select up to 3 themes that best match the style you're looking for.</p>
      </div>

      <div className="mb-6">
        <h3 className="text-sm uppercase font-semibold text-gray-500 mb-3">FILTER BY CATEGORY</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <Toggle
              key={category}
              variant="outline"
              pressed={selectedCategory === category}
              onPressedChange={() => {
                setSelectedCategory(category);
                trackEvent("theme_category_filtered", { category });
              }}
              className={`rounded-full px-4 py-2 text-sm ${selectedCategory === category
                ? 'bg-blue-50 text-blue-800 border-blue-200'
                : 'bg-gray-50 text-gray-700'
                }`}
            >
              {category}
            </Toggle>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {filteredThemes.map(theme => (
          <Card
            key={theme.id}
            className={`overflow-hidden cursor-pointer transition-all ${isThemeSelected(theme.id)
              ? 'ring-2 ring-blue-600 ring-offset-2'
              : 'hover:shadow-md'
              }`}
            onClick={() => toggleThemeSelection(theme.id)}
          >
            <div className="h-36 relative overflow-hidden">
              <img
                src={theme.image}
                alt={theme.name}
                className="w-full h-full object-cover"
              />
            </div>
            <CardContent className="p-4">
              <h3 className="font-medium mb-1">{theme.name}</h3>
              <p className="text-gray-600 text-sm">{theme.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-right">
        <Button
          onClick={() => {
            const selected = themes.find(t => t.id === selectedThemes[0]);
            if (selected) {
              const selectedNames = selectedThemes.map(id => themes.find(t => t.id === id)?.name).filter(Boolean);
              trackEvent("theme_step_completed", { theme_count: selectedThemes.length, theme_names: selectedNames.join(", ") });
              onThemeSelect(selected);
            }
          }}
          disabled={selectedThemes.length === 0}
          className="px-6"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default ThemeSelector;
