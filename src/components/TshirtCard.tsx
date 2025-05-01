
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

interface TshirtCardProps {
  id: number;
  name: string;
  price: string;
  image: string;
  colorOptions?: string[];
}

const TshirtCard = ({ id, name, price, image, colorOptions = ["#FFFFFF", "#000000", "#0000FF"] }: TshirtCardProps) => {
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);

  return (
    <Card className="overflow-hidden group">
      <div className="relative pb-[125%] overflow-hidden">
        <img 
          src={image} 
          alt={name} 
          className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105" 
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex gap-2 justify-center">
          <Button variant="secondary" size="sm" className="opacity-90 flex items-center gap-1">
            <Eye size={16} />
            <span>Quick view</span>
          </Button>
          <Button size="sm" className="opacity-90 flex items-center gap-1">
            <ShoppingCart size={16} />
            <span>Add to cart</span>
          </Button>
        </div>
      </div>
      <CardContent className="pt-4">
        <Link to={`/product/${id}`}>
          <h3 className="font-medium hover:text-blue-600 transition-colors">{name}</h3>
        </Link>
        <p className="text-lg font-medium mt-1">{price}</p>
        <div className="flex gap-2 mt-3">
          {colorOptions.map((color) => (
            <button
              key={color}
              className={`w-5 h-5 rounded-full border ${selectedColor === color ? 'ring-2 ring-blue-500 ring-offset-2' : 'border-gray-300'}`}
              style={{ backgroundColor: color }}
              onClick={() => setSelectedColor(color)}
              aria-label={`Select ${color} color`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TshirtCard;
