
import React from "react";
import Header from "./Header";
import { Link } from "react-router-dom";
import { Wand2 } from "lucide-react";

const HeaderWithAI = () => {
  return (
    <Header>
      <>
        <Link 
          to="/ai-design" 
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 gap-1"
        >
          <Wand2 className="h-4 w-4" />
          AI Design
        </Link>
      </>
    </Header>
  );
};

export default HeaderWithAI;
