
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
}

interface UserContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  console.log("UserProvider initialized");
  
  // Check for user session on mount
  useEffect(() => {
    const checkUserSession = async () => {
      console.log("Checking user session...");
      try {
        setIsLoading(true);
        
        // Get session from Supabase
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log("Session check result:", session ? "Session found" : "No session", sessionError ? `Error: ${sessionError.message}` : "No error");
        
        if (session?.user) {
          const { user: authUser } = session;
          console.log("User found in session:", authUser.id);
          
          // Get user profile data
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("id", authUser.id)
            .single();
            
          console.log("Profile data fetch result:", profileData, profileError ? `Error: ${profileError.message}` : "No error");
            
          setUser({
            id: authUser.id,
            email: authUser.email || "",
            name: profileData?.full_name || authUser.email?.split("@")[0] || "",
            avatar_url: profileData?.avatar_url || undefined
          });
          console.log("User state set to:", authUser.id);
        } else {
          console.log("No user session found");
        }
      } catch (error) {
        console.error("Error checking user session:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkUserSession();
    
    // Set up auth state change listener
    console.log("Setting up auth state change listener");
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state change event:", event);
        console.log("Session in auth change event:", session ? "Present" : "Not present");
        
        if (session?.user) {
          const { user: authUser } = session;
          console.log("Auth changed: User logged in:", authUser.id);
          
          // Use setTimeout to avoid deadlocks with Supabase calls
          setTimeout(async () => {
            try {
              // Get user profile data
              const { data: profileData, error: profileError } = await supabase
                .from("profiles")
                .select("full_name, avatar_url")
                .eq("id", authUser.id)
                .single();
                
              console.log("Profile data fetch on auth change:", profileData, profileError ? `Error: ${profileError.message}` : "No error");
                
              setUser({
                id: authUser.id,
                email: authUser.email || "",
                name: profileData?.full_name || authUser.email?.split("@")[0] || "",
                avatar_url: profileData?.avatar_url || undefined
              });
              console.log("User state updated on auth change to:", authUser.id);
            } catch (error) {
              console.error("Error fetching profile data:", error);
            }
          }, 0);
        } else {
          console.log("Auth changed: User logged out or no user");
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );
    
    // Cleanup subscription
    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, []);
  
  // Authentication methods
  const login = async (email: string, password: string) => {
    console.log("Login attempt with email:", email);
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log("Login response:", data ? "Data received" : "No data", error ? `Error: ${error.message}` : "No error");
      
      if (error) {
        console.error("Login error details:", error);
        throw error;
      }
      
      console.log("Login successful for user:", data.user?.id);
      
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const signup = async (email: string, password: string, name?: string) => {
    console.log("Signup attempt with email:", email, "and name:", name);
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name || email.split("@")[0],
          },
        },
      });
      
      console.log("Signup response:", data ? "Data received" : "No data", error ? `Error: ${error.message}` : "No error");
      
      if (error) {
        console.error("Signup error details:", error);
        throw error;
      }
      
      console.log("Signup successful, user created:", data.user?.id);
      
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = async () => {
    console.log("Logout attempt");
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Logout error details:", error);
        throw error;
      }
      
      console.log("Logout successful");
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
