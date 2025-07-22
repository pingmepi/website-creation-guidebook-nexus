
import { useState } from "react";
import { TSHIRT_COLOR_IMAGES } from "@/hooks/design/constants";

interface TshirtDesignPreviewProps {
  color?: string;
  designImage?: string;
}

const TshirtDesignPreview = ({ color = "#FFFFFF", designImage }: TshirtDesignPreviewProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [tshirtImageError, setTshirtImageError] = useState(false);
  const [designImageError, setDesignImageError] = useState(false);
  
  // Get the corresponding t-shirt image for the selected color
  const tshirtImageSrc = TSHIRT_COLOR_IMAGES[color] || TSHIRT_COLOR_IMAGES["#FFFFFF"];
  
  const handleTshirtImageLoad = () => {
    setIsLoading(false);
    setTshirtImageError(false);
  };
  
  const handleTshirtImageError = () => {
    console.error("Failed to load t-shirt image:", tshirtImageSrc);
    setTshirtImageError(true);
    setIsLoading(false);
  };
  
  const handleDesignImageError = () => {
    console.error("Failed to load design image:", designImage);
    setDesignImageError(true);
  };
  
  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="relative w-full aspect-[4/5]">
        {/* T-shirt base image */}
        {!tshirtImageError ? (
          <img 
            src={tshirtImageSrc}
            alt={`T-shirt in ${color}`}
            className="w-full h-full object-contain filter drop-shadow-lg"
            onLoad={handleTshirtImageLoad}
            onError={handleTshirtImageError}
            style={{
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
            }}
          />
        ) : (
          // Enhanced fallback SVG if image fails to load
          <div 
            className="w-full h-full rounded-lg shadow-lg relative flex items-center justify-center border border-gray-200"
            style={{ backgroundColor: color }}
          >
            <svg 
              className="w-full h-full" 
              viewBox="0 0 400 500" 
              fill="none" 
              preserveAspectRatio="xMidYMid meet"
            >
              {/* T-shirt outline */}
              <path 
                d="M150 50 L100 100 L100 400 L300 400 L300 100 L250 50 L220 80 L200 90 L180 80 L150 50Z" 
                stroke="#00000033" 
                strokeWidth="3" 
                fill={color}
              />
              {/* Left sleeve */}
              <path 
                d="M100 100 L50 80 L75 150 L100 140" 
                stroke="#00000033" 
                strokeWidth="3" 
                fill={color}
              />
              {/* Right sleeve */}
              <path 
                d="M300 100 L350 80 L325 150 L300 140" 
                stroke="#00000033" 
                strokeWidth="3" 
                fill={color}
              />
              {/* Neck opening */}
              <ellipse 
                cx="200" 
                cy="75" 
                rx="20" 
                ry="15" 
                fill="none" 
                stroke="#00000033" 
                strokeWidth="2"
              />
            </svg>
          </div>
        )}
        
        {/* Design overlay positioned in the center of the t-shirt - Increased size */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Position the design in the center-upper area of the t-shirt with larger size */}
          <div className="relative" style={{ marginTop: '8%' }}>
            <div className="w-44 h-44 flex items-center justify-center">
              {designImage && !designImageError ? (
                <img 
                  src={designImage} 
                  alt="T-shirt design" 
                  className="max-w-full max-h-full object-contain"
                  style={{
                    filter: `drop-shadow(0 2px 6px rgba(0,0,0,0.15))`,
                    borderRadius: '6px',
                    // Blend borders with t-shirt color using box-shadow
                    boxShadow: `inset 0 0 0 2px ${color === '#FFFFFF' ? 'rgba(255,255,255,0.8)' : color + '80'}`,
                    background: `linear-gradient(145deg, ${color}20, transparent)`,
                    backdropFilter: 'blur(0.5px)'
                  }}
                  onError={handleDesignImageError}
                />
              ) : (
                <div className="w-36 h-36 border-2 border-dashed border-gray-400 rounded-md flex items-center justify-center bg-white/20 backdrop-blur-sm">
                  <span className="text-xs text-gray-600 text-center p-1 font-medium">
                    {designImage && designImageError ? "Failed to load" : "Design preview"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced color indicator */}
      <div className="mt-4 flex items-center justify-center gap-3">
        <div 
          className="w-5 h-5 rounded-full border-2 border-white shadow-lg ring-1 ring-gray-200"
          style={{ backgroundColor: color }}
        />
        <span className="text-sm text-gray-700 font-medium capitalize">
          {(() => {
            // Import color names from constants to avoid duplication
            const colorNames: Record<string, string> = {
              "#000000": "Black",
              "#FFFFFF": "White",
              "#DC2626": "Red",
              "#8A898C": "Grey",
              "#1EAEDB": "Blue"
            };
            return colorNames[color] || "Custom";
          })()}
        </span>
      </div>
      
      {/* Loading overlay */}
      {isLoading && !tshirtImageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Loading preview...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TshirtDesignPreview;
