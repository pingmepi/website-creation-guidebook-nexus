
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-white border-t mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Merekapade</h3>
            <p className="text-gray-600 text-sm">
              Create unique, AI-powered custom t-shirts with Merekapade. Premium quality, personalized designs, and fast delivery.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-gray-600 hover:text-black">Home</Link>
              </li>
              <li>
                <Link href="/shop" className="text-gray-600 hover:text-black">Shop</Link>
              </li>
              <li>
                <Link href="/design" className="text-gray-600 hover:text-black">Design</Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 hover:text-black">About Us</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dashboard/orders" className="text-gray-600 hover:text-black">Track Order</Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="text-gray-600 hover:text-black">Shipping Policy</Link>
              </li>
              <li>
                <Link href="/return-refund-policy" className="text-gray-600 hover:text-black">Returns & Refunds</Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-gray-600 hover:text-black">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms-conditions" className="text-gray-600 hover:text-black">Terms & Conditions</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li className="text-gray-600">Email: support@merekapade.com</li>
              <li className="text-gray-600">Phone: +1 (555) 123-4567</li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-8 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Merekapade. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
