
import { useState } from "react";
import { TSHIRT_COLOR_IMAGES } from "@/hooks/design/types";

interface TshirtDesignPreviewProps {
  color?: string;
  designImage?: string;
}

const TshirtDesignPreview = ({ color = "#FFFFFF", designImage }: TshirtDesignPreviewProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [tshirtImageError, setTshirtImageError] = useState(false);
  
  // Get the corresponding t-shirt image for the selected color
  const tshirtImageSrc = TSHIRT_COLOR_IMAGES[color] || TSHIRT_COLOR_IMAGES["#FFFFFF"];
  
  return (
    <div className="relative flex items-center justify-center bg-gray-50 rounded-lg p-4">
      <div className="relative w-full max-w-sm">
        {/* T-shirt image */}
        <div className="relative w-full aspect-[3/4] flex items-center justify-center">
          {!tshirtImageError ? (
            <img 
              src={tshirtImageSrc}
              alt={`T-shirt in ${color}`}
              className="w-full h-full object-contain"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setTshirtImageError(true);
                setIsLoading(false);
              }}
            />
          ) : (
            // Fallback SVG if image fails to load
            <div 
              className="w-full h-full rounded-lg shadow-sm relative flex items-center justify-center"
              style={{ backgroundColor: color }}
            >
              {/* T-shirt outline SVG fallback */}
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
            </div>
          )}
          
          {/* Design area overlay - positioned in the center of the t-shirt */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[45%] aspect-square flex items-center justify-center">
              {/* Design image */}
              {designImage ? (
                <img 
                  src={designImage} 
                  alt="T-shirt design" 
                  className="max-w-full max-h-full object-contain rounded-sm shadow-sm"
                  style={{
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                  }}
                />
              ) : (
                <div className="w-full h-full border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center bg-white/50">
                  <span className="text-xs text-gray-500 text-center p-2">
                    Your design will appear here
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Color indicator */}
        <div className="mt-2 flex items-center justify-center gap-2">
          <div 
            className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
            style={{ backgroundColor: color }}
          />
          <span className="text-sm text-gray-600 capitalize">
            {Object.entries(TSHIRT_COLOR_IMAGES).find(([colorCode]) => colorCode === color)?.[0] === color ? 
              Object.keys({
                "#000000": "Black",
                "#FFFFFF": "White", 
                "#DC2626": "Red",
                "#8A898C": "Grey",
                "#1EAEDB": "Blue"
              }).find(key => key === color) ? 
              {
                "#000000": "Black",
                "#FFFFFF": "White",
                "#DC2626": "Red", 
                "#8A898C": "Grey",
                "#1EAEDB": "Blue"
              }[color] : "Custom"
              : "Custom"
            }
          </span>
        </div>
      </div>
      
      {isLoading && !tshirtImageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      )}
    </div>
  );
};

export default TshirtDesignPreview;
