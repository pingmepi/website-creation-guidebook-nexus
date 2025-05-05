
import { useState } from "react";

export function useDesignAppearanceState() {
  const [designId, setDesignId] = useState<string | null>(null);
  const [designName, setDesignName] = useState<string>("");
  const [tshirtColor, setTshirtColor] = useState("#FFFFFF");
  const [designImage, setDesignImage] = useState<string | undefined>(undefined);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleDesignChange = (designDataUrl: string) => {
    setDesignImage(designDataUrl);
    setHasUnsavedChanges(true);
  };

  return {
    designId,
    designName,
    tshirtColor,
    designImage,
    hasUnsavedChanges,
    isLoading,
    setDesignId,
    setDesignName,
    setTshirtColor,
    setDesignImage,
    setHasUnsavedChanges,
    setIsLoading,
    handleDesignChange
  };
}
