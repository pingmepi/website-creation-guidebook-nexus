
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <section className="max-w-4xl mx-auto mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">About Custom T-Shirts</h1>
          
          <div className="prose prose-lg max-w-none">
            <p>
              Welcome to Custom T-Shirts, where creativity meets comfort. We're passionate about helping
              people express themselves through uniquely designed, high-quality t-shirts that stand out
              from the crowd.
            </p>
            
            <h2>Our Story</h2>
            <p>
              Founded in 2020, Custom T-Shirts began with a simple idea: make it easy for anyone to
              create personalized t-shirts without needing design expertise. Our team of designers and
              developers built an innovative platform that guides users through creating designs that
              truly reflect their personality and style.
            </p>
            
            <h2>Our Commitment to Quality</h2>
            <p>
              We believe that great design deserves great materials. That's why we use only premium
              cotton for our t-shirts, ensuring they're soft, comfortable, and built to last. Our
              printing techniques preserve vibrant colors and sharp details, wash after wash.
            </p>
            
            <h2>Sustainability</h2>
            <p>
              We're committed to reducing our environmental impact. Our production processes minimize
              water usage and waste, and we're constantly seeking more sustainable materials and
              practices. When you choose Custom T-Shirts, you're making a choice that's better for
              the planet.
            </p>
            
            <h2>Our Team</h2>
            <p>
              Behind Custom T-Shirts is a diverse team of designers, developers, and customer service
              professionals united by a passion for creativity and quality. We're dedicated to providing
              you with an exceptional experience from design to delivery.
            </p>
            
            <div className="my-8 flex justify-center">
              <Button className="bg-blue-600 hover:bg-blue-700" asChild>
                <Link to="/design">Start Designing</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
