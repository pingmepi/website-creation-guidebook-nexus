
import { useState } from "react";
import { Button } from "@/components/ui/button";
import LoginDialog from "./LoginDialog";

const LoginButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenDialog = () => setIsOpen(true);
  const handleCloseDialog = () => setIsOpen(false);
  const handleSuccess = () => {
    setIsOpen(false);
    // User is now logged in, the auth state will be handled by UserContext
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={handleOpenDialog}>
        Login
      </Button>
      <LoginDialog 
        open={isOpen} 
        onClose={handleCloseDialog} 
        onSuccess={handleSuccess} 
      />
    </>
  );
};

export default LoginButton;
