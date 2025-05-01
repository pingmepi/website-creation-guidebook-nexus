
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

type AuthMode = "login" | "signup";

interface LoginDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  name?: string;
  email: string;
  password: string;
}

const LoginDialog = ({ open, onClose, onSuccess }: LoginDialogProps) => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>();
  
  const toggleMode = () => {
    setMode(mode === "login" ? "signup" : "login");
    reset();
  };
  
  const onSubmit = (data: FormData) => {
    // Placeholder for Supabase integration
    console.log("Form submitted:", data);
    
    if (mode === "login") {
      // Mock successful login for now
      toast.success("Logged in successfully");
      onSuccess();
    } else {
      // Mock successful signup for now
      toast.success("Account created successfully");
      setMode("login");
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "login" ? "Log in to your account" : "Create an account"}
          </DialogTitle>
          <DialogDescription>
            {mode === "login" 
              ? "Enter your email and password to continue with your design" 
              : "Fill in the details below to create a new account"}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                {...register("name", { required: mode === "signup" })}
                placeholder="Enter your name"
              />
              {errors.name && <p className="text-sm text-red-500">Name is required</p>}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email", { 
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
                }
              })}
              placeholder="Enter your email"
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                {...register("password", { 
                  required: "Password is required",
                  minLength: { value: 6, message: "Password must be at least 6 characters" }
                })}
                placeholder="Enter your password"
                className="pr-10"
              />
              <button 
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
          </div>
          
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={toggleMode}>
              {mode === "login" ? "Need an account? Sign up" : "Already have an account? Log in"}
            </Button>
            <Button type="submit">
              {mode === "login" ? "Log in" : "Sign up"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
