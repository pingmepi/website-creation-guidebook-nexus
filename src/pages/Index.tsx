import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, Shirt, Zap, Star, Users, Truck } from "lucide-react";
import { tshirtImages } from "../../assets";

const Index = () => {
  const features = [
    {
      icon: <Palette className="h-8 w-8 text-blue-600" />,
      title: "AI-Powered Design",
      description: "Create unique designs with our advanced AI tools that understand your style preferences."
    },
    {
      icon: <Shirt className="h-8 w-8 text-blue-600" />,
      title: "Premium Quality",
      description: "High-quality materials and printing ensure your designs look great and last long."
    },
    {
      icon: <Zap className="h-8 w-8 text-blue-600" />,
      title: "Quick Turnaround",
      description: "Fast processing and shipping to get your custom t-shirts delivered quickly."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      rating: 5,
      comment: "Amazing quality and the design process was so easy! Love my custom t-shirt."
    },
    {
      name: "Mike Chen",
      rating: 5,
      comment: "The AI design suggestions were spot on. Exactly what I was looking for."
    },
    {
      name: "Emily Davis",
      rating: 5,
      comment: "Fast delivery and excellent customer service. Highly recommended!"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Design Your Perfect
                <span className="text-blue-600 block">Custom T-Shirt</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Create unique, personalized t-shirts with our AI-powered design tools. 
                Choose from themes, customize every detail, and get premium quality prints delivered to your door.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700" asChild>
                  <Link to="/design">Start Designing</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/shop">Browse Shop</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <img 
                  src={tshirtImages.mockup1} 
                  alt="Custom T-shirt Design 1" 
                  className="rounded-lg shadow-lg"
                />
                <img 
                  src={tshirtImages.mockup2} 
                  alt="Custom T-shirt Design 2" 
                  className="rounded-lg shadow-lg mt-8"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Mere Kapade?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We combine cutting-edge technology with premium quality to deliver the best custom t-shirt experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center border-0 shadow-lg">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Simple steps to create your perfect custom t-shirt
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2">Choose Theme</h3>
              <p className="text-gray-600">Select from our curated design themes that match your style</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2">AI Design</h3>
              <p className="text-gray-600">Our AI creates unique designs based on your preferences</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2">Customize</h3>
              <p className="text-gray-600">Fine-tune colors, text, and placement to perfection</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h3 className="text-lg font-semibold mb-2">Order</h3>
              <p className="text-gray-600">Place your order and get it delivered to your doorstep</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="flex justify-center mb-4">
                <Users className="h-8 w-8" />
              </div>
              <div className="text-3xl font-bold mb-2">10,000+</div>
              <div className="text-blue-100">Happy Customers</div>
            </div>
            <div>
              <div className="flex justify-center mb-4">
                <Shirt className="h-8 w-8" />
              </div>
              <div className="text-3xl font-bold mb-2">50,000+</div>
              <div className="text-blue-100">T-Shirts Printed</div>
            </div>
            <div>
              <div className="flex justify-center mb-4">
                <Star className="h-8 w-8" />
              </div>
              <div className="text-3xl font-bold mb-2">4.9/5</div>
              <div className="text-blue-100">Customer Rating</div>
            </div>
            <div>
              <div className="flex justify-center mb-4">
                <Truck className="h-8 w-8" />
              </div>
              <div className="text-3xl font-bold mb-2">2-3 Days</div>
              <div className="text-blue-100">Delivery Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-600">
              Don't just take our word for it - hear from our satisfied customers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">"{testimonial.comment}"</p>
                  <p className="font-semibold text-gray-900">- {testimonial.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Create Your Custom T-Shirt?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of satisfied customers and start designing today!
          </p>
          <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" asChild>
            <Link to="/design">Get Started Now</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
