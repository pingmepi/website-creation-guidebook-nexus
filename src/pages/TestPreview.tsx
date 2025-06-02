import React from "react";
import TshirtDesignPreview from "@/components/design/TshirtDesignPreview";
import { TSHIRT_COLORS } from "@/hooks/design/types";

const TestPreview = () => {
  const testDesignImage = "/assets/images/design/placeholder.svg";

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">T-Shirt Preview Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Object.entries(TSHIRT_COLORS).map(([name, color]) => (
          <div key={name} className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-center">
              {name} ({color})
            </h3>
            <TshirtDesignPreview 
              color={color} 
              designImage={testDesignImage}
            />
          </div>
        ))}
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Preview without Design</h2>
        <div className="flex justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <TshirtDesignPreview color="#FFFFFF" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPreview;
