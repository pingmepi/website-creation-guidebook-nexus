
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { designImages } from "../../assets";
import { Link } from "react-router-dom";

const Design = () => {
  const designThemes = [
    { id: 1, name: "Minimalist", description: "Clean, simple designs with focus on typography" },
    { id: 2, name: "Vintage", description: "Retro-inspired designs with classic elements" },
    { id: 3, name: "Abstract", description: "Unique patterns and artistic expressions" },
    { id: 4, name: "Nature", description: "Designs inspired by the natural world" },
    { id: 5, name: "Urban", description: "Street art and city life-inspired designs" },
    { id: 6, name: "Geometric", description: "Shapes and patterns with mathematical precision" }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <section className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Design Your Own T-Shirt</h1>
          <p className="text-xl text-gray-600">
            Let us guide you through creating your perfect custom t-shirt design.
            Select a theme below to get started.
          </p>
        </section>
        
        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-12">
            <div>
              <h2 className="text-2xl font-bold mb-4">How It Works</h2>
              <ol className="space-y-4">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full text-white flex items-center justify-center font-medium">1</span>
                  <div>
                    <h3 className="font-medium">Select a Design Theme</h3>
                    <p className="text-gray-600">Choose from our curated themes that match your style</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full text-white flex items-center justify-center font-medium">2</span>
                  <div>
                    <h3 className="font-medium">Answer Simple Questions</h3>
                    <p className="text-gray-600">Tell us about your preferences to customize your design</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full text-white flex items-center justify-center font-medium">3</span>
                  <div>
                    <h3 className="font-medium">Customize Your Design</h3>
                    <p className="text-gray-600">Make final adjustments to perfect your t-shirt</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full text-white flex items-center justify-center font-medium">4</span>
                  <div>
                    <h3 className="font-medium">Order Your Custom T-shirt</h3>
                    <p className="text-gray-600">Select size, quantity, and checkout</p>
                  </div>
                </li>
              </ol>
            </div>
            <div>
              <img 
                src={designImages.designFlow} 
                alt="Design Process" 
                className="w-full h-auto rounded-lg shadow-lg" 
              />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-6">Select a Design Theme</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {designThemes.map((theme) => (
              <Card key={theme.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gray-100 flex items-center justify-center">
                  <img 
                    src={designImages.placeholder} 
                    alt={theme.name} 
                    className="w-16 h-16 opacity-40" 
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="font-medium text-lg mb-2">{theme.name}</h3>
                  <p className="text-gray-600 mb-4">{theme.description}</p>
                  <Button className="w-full">Select Theme</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Design;
