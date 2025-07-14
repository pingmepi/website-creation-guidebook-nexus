
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, ShoppingCart } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useCart } from "@/contexts/CartContext";
import LoginButton from "./auth/LoginButton";
import { CartSidebar } from "./cart/CartSidebar";

const Header = () => {
  const { isAuthenticated } = useUser();
  const { cartCount } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-gray-900">
            TeeDesign
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            <Link to="/shop" className="text-gray-600 hover:text-gray-900 transition-colors">
              Shop
            </Link>
            <Link to="/design" className="text-gray-600 hover:text-gray-900 transition-colors">
              Design
            </Link>
            <Link to="/about" className="text-gray-600 hover:text-gray-900 transition-colors">
              About
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <CartSidebar />
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/dashboard">
                    <User className="h-4 w-4 mr-1" />
                    Dashboard
                  </Link>
                </Button>
              </div>
            ) : (
              <LoginButton />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
