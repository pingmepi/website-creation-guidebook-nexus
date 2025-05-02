
import TshirtCard from "@/components/TshirtCard";
import { Button } from "@/components/ui/button";
import { tshirtImages } from "../../assets";
import { Link } from "react-router-dom";

const Index = () => {
  // Featured t-shirt collection
  const featuredTshirts = [
    { id: 1, name: "Classic White Tee", price: "$24.99", image: tshirtImages.mockup1 },
    { id: 2, name: "Urban Black Design", price: "$29.99", image: tshirtImages.mockup2 },
    { id: 3, name: "Summer Collection", price: "$26.99", image: tshirtImages.mockup3 },
    { id: 4, name: "Modern Minimalist", price: "$27.99", image: tshirtImages.mockup5 },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-white overflow-hidden">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                Custom T-shirts <br />
                <span className="text-blue-600">For Every Style</span>
              </h1>
              <p className="text-xl text-gray-600">
                Express yourself with unique designs, premium quality, and perfect fit.
                Create your own or shop our collections.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700" asChild>
                  <Link to="/design">Design Your Own</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/shop">View Collection</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <img
                src={tshirtImages.mockup1}
                alt="Featured T-shirt"
                className="w-full h-auto rounded-lg shadow-lg"
              />
              <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-full shadow-md">
                <span className="font-medium text-blue-600">New Arrival</span>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Featured Collection */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Featured Collection</h2>
            <Button variant="link" className="text-blue-600" asChild>
              <Link to="/shop">View All</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {featuredTshirts.map((tshirt) => (
              <TshirtCard
                key={tshirt.id}
                id={tshirt.id}
                name={tshirt.name}
                price={tshirt.price}
                image={tshirt.image}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Design Your Own CTA */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Create Your Perfect T-shirt</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Express your style with our easy-to-use design tool. Choose from various themes,
            answer simple questions, and we'll create a custom design just for you.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700" asChild>
              <Link to="/design">Start Designing Now</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Index;
