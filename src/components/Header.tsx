
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-md"></div>
            <span className="font-bold text-xl">GitHub Docs Website</span>
          </div>
          
          <Button variant="outline" className="flex items-center gap-2">
            <Github size={18} />
            <span>Connect Repository</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
