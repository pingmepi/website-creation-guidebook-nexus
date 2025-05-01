
import { useState } from "react";

interface TshirtDesignPreviewProps {
  color?: string;
  designImage?: string;
}

const TshirtDesignPreview = ({ color = "#FFFFFF", designImage }: TshirtDesignPreviewProps) => {
  const [isLoading, setIsLoading] = useState(true);
  
  return (
    <div className="relative flex items-center justify-center bg-white rounded-lg p-4">
      <div className="relative w-full max-w-sm">
        {/* T-shirt mockup */}
        <div 
          className="w-full aspect-[3/4] rounded-lg shadow-sm relative flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: color }}
        >
          {/* T-shirt outline */}
          <svg 
            className="absolute inset-0 w-full h-full" 
            viewBox="0 0 400 500" 
            fill="none" 
            preserveAspectRatio="xMidYMid meet"
          >
            <path 
              d="M150 50 L100 100 L100 400 L300 400 L300 100 L250 50 L220 80 L200 90 L180 80 L150 50Z" 
              stroke="#00000022" 
              strokeWidth="2" 
              fill="none"
            />
            <path 
              d="M100 100 L50 80 L75 150 L100 140" 
              stroke="#00000022" 
              strokeWidth="2" 
              fill="none"
            />
            <path 
              d="M300 100 L350 80 L325 150 L300 140" 
              stroke="#00000022" 
              strokeWidth="2" 
              fill="none"
            />
          </svg>
          
          {/* Design preview area */}
          <div className="absolute w-[60%] aspect-square top-1/4 flex items-center justify-center">
            {designImage ? (
              <img 
                src={designImage} 
                alt="T-shirt design" 
                className="max-w-full max-h-full object-contain"
                onLoad={() => setIsLoading(false)}
                onError={() => setIsLoading(false)}
              />
            ) : (
              <div className="text-sm text-gray-500 text-center p-4 rounded-md bg-gray-100 w-full">
                Your design will appear here
              </div>
            )}
          </div>
        </div>
      </div>
      
      {isLoading && designImage && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      )}
    </div>
  );
};

export default TshirtDesignPreview;
