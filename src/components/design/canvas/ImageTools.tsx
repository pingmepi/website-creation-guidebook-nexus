
import { Input } from "@/components/ui/input";

interface ImageToolsProps {
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ImageTools = ({ onImageUpload }: ImageToolsProps) => {
  return (
    <Input
      type="file"
      accept="image/*"
      onChange={onImageUpload}
    />
  );
};

export default ImageTools;
