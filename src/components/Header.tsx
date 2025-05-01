
import { Button } from "@/components/ui/button";
import { ShoppingCart, LogIn, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import LoginDialog from "./auth/LoginDialog";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/integrations/supabase/client";

const Header = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const { user, isLoading, logout } = useUser();

  useEffect(() => {
    console.log("Header rendered with user state:", user ? `User: ${user.email}` : "No user", "isLoading:", isLoading);
    
    // Fetch cart count when user is authenticated
    if (user) {
      fetchCartCount();
      
      // Set up subscription for cart updates
      const channel = supabase
        .channel('cart-changes')
        .on(
          'postgres_changes',
          {
            event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'cart_items',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchCartCount(); // Refresh the cart count
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, isLoading]);
  
  const fetchCartCount = async () => {
    if (!user) return;
    
    try {
      const { count, error } = await supabase
        .from('cart_items')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      setCartCount(count || 0);
    } catch (error) {
      console.error("Error fetching cart count:", error);
    }
  };

  const handleLoginClick = () => {
    console.log("Login button clicked");
    setShowLogin(true);
  };

  const handleLoginClose = () => {
    console.log("Login dialog closed");
    setShowLogin(false);
  };

  const handleLoginSuccess = () => {
    console.log("Login success callback triggered");
    setShowLogin(false);
  };

  const handleLogout = async () => {
    console.log("Logout button clicked");
    try {
      await logout();
      console.log("Logout completed in Header");
      setCartCount(0); // Reset cart count on logout
    } catch (error) {
      console.error("Error during logout in Header:", error);
    }
  };

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
          
          <div className="flex items-center gap-3">
            {!isLoading && (
              user ? (
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    className="flex items-center gap-2"
                    asChild
                  >
                    <Link to="/dashboard">
                      <User size={18} />
                      <span className="hidden sm:inline-block">
                        {user.name || user.email.split('@')[0]}
                      </span>
                    </Link>
                  </Button>
                  <Button variant="outline" onClick={handleLogout}>
                    Log out
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={handleLoginClick}
                >
                  <LogIn size={18} />
                  <span>Login</span>
                </Button>
              )
            )}
            
            <Button variant="outline" className="flex items-center gap-2" asChild>
              <Link to="/cart">
                <ShoppingCart size={18} />
                <span className="hidden sm:inline">Cart ({cartCount})</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
      
      <LoginDialog 
        open={showLogin} 
        onClose={handleLoginClose} 
        onSuccess={handleLoginSuccess} 
      />
    </header>
  );
};

export default Header;
