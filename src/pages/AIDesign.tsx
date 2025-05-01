
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AIDesignGenerator from "@/components/design/AIDesignGenerator";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import LoginDialog from "@/components/auth/LoginDialog";
import { useState } from "react";

const AIDesign = () => {
  const { isAuthenticated } = useUser();
  const [showLoginDialog, setShowLoginDialog] = useState(!isAuthenticated);
  
  const handleLoginSuccess = () => {
    setShowLoginDialog(false);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <section className="max-w-4xl mx-auto text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">AI T-Shirt Design</h1>
            <p className="text-lg text-gray-600">
              Generate unique designs with AI and customize them to your liking
            </p>
          </section>
          
          <section className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6">
            {isAuthenticated ? (
              <AIDesignGenerator />
            ) : (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold mb-4">Login to Generate AI Designs</h2>
                <p className="text-gray-600 mb-6">
                  You need to be logged in to use our AI design generator.
                </p>
                <Button onClick={() => setShowLoginDialog(true)}>
                  Login to Continue
                </Button>
              </div>
            )}
          </section>
        </div>
      </div>
      
      <LoginDialog
        open={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
        onSuccess={handleLoginSuccess}
      />
      
      <Footer />
    </div>
  );
};

export default AIDesign;
