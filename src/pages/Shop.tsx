
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TshirtCard from "@/components/TshirtCard";
import { tshirtImages } from "../../assets";

const Shop = () => {
  const tshirtProducts = [
    { id: 1, name: "Classic White Tee", price: "$24.99", image: tshirtImages.mockup1 },
    { id: 2, name: "Urban Black Design", price: "$29.99", image: tshirtImages.mockup2 },
    { id: 3, name: "Summer Collection", price: "$26.99", image: tshirtImages.mockup3 },
    { id: 4, name: "Vintage Edition", price: "$32.99", image: tshirtImages.mockup4 },
    { id: 5, name: "Modern Minimalist", price: "$27.99", image: tshirtImages.mockup5 },
    { id: 6, name: "Artist Series", price: "$34.99", image: tshirtImages.mockup6 },
    // Duplicate some for more content
    { id: 7, name: "Classic Blue Tee", price: "$24.99", image: tshirtImages.mockup1 },
    { id: 8, name: "Urban Gray Design", price: "$29.99", image: tshirtImages.mockup2 },
    { id: 9, name: "Winter Collection", price: "$26.99", image: tshirtImages.mockup3 }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shop All T-Shirts</h1>
          <p className="text-gray-600">Browse our collection of premium quality t-shirts</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tshirtProducts.map((tshirt) => (
            <TshirtCard
              key={tshirt.id}
              id={tshirt.id}
              name={tshirt.name}
              price={tshirt.price}
              image={tshirt.image}
            />
          ))}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Shop;
