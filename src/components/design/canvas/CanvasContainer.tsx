
import { ReactNode } from "react";

interface CanvasContainerProps {
  children: ReactNode;
}

const CanvasContainer = ({ children }: CanvasContainerProps) => {
  return (
    <div className="mt-6 relative flex justify-center">
      <div 
        className="canvas-container relative border border-gray-300 shadow-md mb-4"
        style={{ minHeight: "300px" }}
      >
        {children}
      </div>
    </div>
  );
};

export default CanvasContainer;
