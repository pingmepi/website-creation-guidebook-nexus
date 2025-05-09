
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="py-8 bg-gray-800 text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Custom T-Shirts</h3>
            <p className="text-gray-300">
              Premium quality custom t-shirts with unique designs. Express yourself with style.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-300 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/shop" className="text-gray-300 hover:text-white transition-colors">Shop</Link></li>
              <li><Link to="/design" className="text-gray-300 hover:text-white transition-colors">Design Your Own</Link></li>
              <li><Link to="/about" className="text-gray-300 hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Contact Us</h3>
            <address className="text-gray-300 not-italic">
              123 T-Shirt Lane<br />
              Fashion District, ST 12345<br />
              <a href="mailto:info@customtshirts.com" className="hover:text-white transition-colors">info@customtshirts.com</a><br />
              <a href="tel:+11234567890" className="hover:text-white transition-colors">(123) 456-7890</a>
            </address>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
          <p>© {new Date().getFullYear()} Custom T-Shirts. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
