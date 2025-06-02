
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
    <div className="relative w-full max-w-md mx-auto">
      <div className="relative w-full aspect-[4/5]">
        {/* T-shirt base image */}
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
          // Fallback if image fails to load
          <div 
            className="w-full h-full rounded-lg shadow-sm relative flex items-center justify-center"
            style={{ backgroundColor: color }}
          >
            <svg 
              className="w-full h-full" 
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
        
        {/* Design overlay positioned in the center of the t-shirt */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Position the design in the center-upper area of the t-shirt */}
          <div className="relative" style={{ marginTop: '10%' }}>
            <div className="w-32 h-32 flex items-center justify-center">
              {designImage ? (
                <img 
                  src={designImage} 
                  alt="T-shirt design" 
                  className="max-w-full max-h-full object-contain rounded-sm"
                  style={{
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))'
                  }}
                />
              ) : (
                <div className="w-24 h-24 border-2 border-dashed border-gray-400 rounded-md flex items-center justify-center bg-white/30">
                  <span className="text-xs text-gray-600 text-center p-1">
                    Design preview
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Color indicator */}
      <div className="mt-3 flex items-center justify-center gap-2">
        <div 
          className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
          style={{ backgroundColor: color }}
        />
        <span className="text-sm text-gray-600 capitalize">
          {(() => {
            const colorNames = {
              "#000000": "Black",
              "#FFFFFF": "White",
              "#DC2626": "Red",
              "#8A898C": "Grey",
              "#1EAEDB": "Blue"
            };
            return colorNames[color as keyof typeof colorNames] || "Custom";
          })()}
        </span>
      </div>
      
      {isLoading && !tshirtImageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}
    </div>
  );
};

export default TshirtDesignPreview;
