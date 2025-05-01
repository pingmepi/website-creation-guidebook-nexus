
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold">T</div>
            <Link to="/" className="font-bold text-xl">Custom T-Shirts</Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors">Home</Link>
            <Link to="/shop" className="text-gray-700 hover:text-blue-600 transition-colors">Shop</Link>
            <Link to="/design" className="text-gray-700 hover:text-blue-600 transition-colors">Design Your Own</Link>
            <Link to="/about" className="text-gray-700 hover:text-blue-600 transition-colors">About</Link>
          </nav>
          
          <Button variant="outline" className="flex items-center gap-2">
            <ShoppingCart size={18} />
            <span className="hidden sm:inline">Cart (0)</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
