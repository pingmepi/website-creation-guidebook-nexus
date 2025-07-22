import React from 'react';

const ShippingPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="prose prose-lg max-w-none">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shipping Policy</h1>
        
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
          <p className="text-blue-800">
            <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
          </p>
        </div>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Processing Time</h2>
          <p className="text-gray-600 mb-4">
            All custom t-shirt orders are processed within 3-5 business days after payment confirmation. 
            During peak seasons (holidays, special promotions), processing may take up to 7 business days.
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Custom designs require additional 1-2 days for design approval</li>
            <li>Bulk orders (10+ items) may require 5-7 business days</li>
            <li>Rush orders available for additional fee (contact us for details)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Shipping Methods & Timeframes</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Domestic Shipping (India)</h3>
              <ul className="text-gray-600 space-y-2">
                <li><strong>Standard (5-7 business days):</strong> ₹99</li>
                <li><strong>Express (2-3 business days):</strong> ₹199</li>
                <li><strong>Same Day (within city):</strong> ₹299</li>
              </ul>
              <p className="text-sm text-green-600 mt-2">Free standard shipping on orders over ₹999!</p>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">International Shipping</h3>
              <ul className="text-gray-600 space-y-2">
                <li><strong>Asia (7-14 business days):</strong> ₹1,299</li>
                <li><strong>Europe (10-21 business days):</strong> ₹1,699</li>
                <li><strong>Rest of World (14-28 business days):</strong> ₹1,999</li>
              </ul>
              <p className="text-sm text-orange-600 mt-2">Additional customs fees may apply</p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Order Tracking</h2>
          <p className="text-gray-600 mb-4">
            Once your order ships, you'll receive a tracking number via email. You can track your package using:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Your account dashboard</li>
            <li>The tracking link in your shipping confirmation email</li>
            <li>Directly on the carrier's website</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Shipping Restrictions</h2>
          <p className="text-gray-600 mb-4">
            We currently ship to most countries worldwide. However, we cannot ship to:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>P.O. Boxes (for international orders)</li>
            <li>Military APO/FPO addresses</li>
            <li>Countries with current shipping restrictions</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Damaged or Lost Packages</h2>
          <p className="text-gray-600 mb-4">
            If your package arrives damaged or goes missing during transit:
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Contact us within 48 hours of delivery (for damaged items)</li>
            <li>Report lost packages within 30 days of ship date</li>
            <li>We'll work with the carrier to resolve the issue</li>
            <li>Replacement or refund will be provided as appropriate</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Contact Information</h2>
          <p className="text-gray-600">
            For shipping questions or concerns, please contact us:
          </p>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-700">
              <strong>Email:</strong> shipping@customtshirts.com<br />
              <strong>Phone:</strong> (123) 456-7890<br />
              <strong>Hours:</strong> Monday-Friday, 9 AM - 6 PM EST
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ShippingPolicy;
