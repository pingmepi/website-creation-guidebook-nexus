
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import LoginButton from "./auth/LoginButton";
import { CartSidebar } from "./cart/CartSidebar";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useUser();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-gray-900">
              ThreadCraft
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">
              Home
            </Link>
            <Link to="/shop" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">
              Shop
            </Link>
            <Link to="/design" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">
              Design
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">
              About
            </Link>
          </nav>

          {/* Desktop Auth & Cart */}
          <div className="hidden md:flex items-center space-x-4">
            <CartSidebar />
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm">
                    Dashboard
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={logout}>
                  Logout
                </Button>
              </div>
            ) : (
              <LoginButton />
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-gray-900 focus:outline-none focus:text-gray-900"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
              <Link
                to="/"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900"
                onClick={toggleMenu}
              >
                Home
              </Link>
              <Link
                to="/shop"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900"
                onClick={toggleMenu}
              >
                Shop
              </Link>
              <Link
                to="/design"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900"
                onClick={toggleMenu}
              >
                Design
              </Link>
              <Link
                to="/about"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900"
                onClick={toggleMenu}
              >
                About
              </Link>
              
              <div className="flex items-center justify-between px-3 py-2">
                <CartSidebar />
                {isAuthenticated ? (
                  <div className="flex items-center space-x-2">
                    <Link to="/dashboard">
                      <Button variant="ghost" size="sm" onClick={toggleMenu}>
                        Dashboard
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={() => { logout(); toggleMenu(); }}>
                      Logout
                    </Button>
                  </div>
                ) : (
                  <LoginButton />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
