
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";

// Define theme categories and themes
const categories = ["All", "Artistic", "Minimal", "Nature", "Abstract", "Typography"];

interface Theme {
  id: number;
  name: string;
  description: string;
  color: string;
  category: string[];
}

const themes: Theme[] = [
  { id: 1, name: "Travel", description: "Capture your wanderlust", color: "#00BCD4", category: ["Artistic"] },
  { id: 2, name: "Music", description: "Express your rhythm", color: "#9C27B0", category: ["Abstract", "Artistic"] },
  { id: 3, name: "Sports", description: "Show your active side", color: "#FF5722", category: ["Minimal"] },
  { id: 4, name: "Nature", description: "Connect with the outdoors", color: "#8BC34A", category: ["Nature"] },
  { id: 5, name: "Abstract", description: "Bold geometric patterns", color: "#FF1493", category: ["Abstract"] },
  { id: 6, name: "Vintage", description: "Classic retro style", color: "#A67C52", category: ["Artistic"] },
  { id: 7, name: "Minimal", description: "Clean and simple", color: "#212121", category: ["Minimal"] },
  { id: 8, name: "Bold", description: "Stand out with strong design", color: "#FF0000", category: ["Typography"] },
  { id: 9, name: "Funny", description: "Lighthearted and humorous", color: "#FFC107", category: ["Typography"] },
  { id: 10, name: "Artistic", description: "Expressive and creative", color: "#00E5B2", category: ["Artistic"] }
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
    if (selectedThemes.includes(themeId)) {
      setSelectedThemes(selectedThemes.filter(id => id !== themeId));
    } else {
      if (selectedThemes.length < 3) {
        setSelectedThemes([...selectedThemes, themeId]);
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
              onPressedChange={() => setSelectedCategory(category)}
              className={`rounded-full px-4 py-2 text-sm ${
                selectedCategory === category 
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
            className={`overflow-hidden cursor-pointer transition-all ${
              isThemeSelected(theme.id) 
                ? 'ring-2 ring-blue-600 ring-offset-2' 
                : 'hover:shadow-md'
            }`}
            onClick={() => toggleThemeSelection(theme.id)}
          >
            <div 
              className="h-36 flex items-center justify-center" 
              style={{ backgroundColor: theme.color }}
            />
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
            if (selected) onThemeSelect(selected);
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
