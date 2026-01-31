export default function ReturnRefundPolicy() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="prose prose-lg max-w-none">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Return & Refund Policy</h1>

                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
                    <p className="text-blue-800">
                        <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
                    </p>
                </div>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Return Eligibility</h2>
                    <p className="text-gray-600 mb-4">
                        We want you to be completely satisfied with your purchase. Here's what you need to know about returns:
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                            <h3 className="text-lg font-semibold text-green-800 mb-2">✓ Returnable Items</h3>
                            <ul className="text-green-700 space-y-2">
                                <li>Defective or damaged products</li>
                                <li>Wrong size received</li>
                                <li>Printing errors on our part</li>
                                <li>Items that don't match description</li>
                            </ul>
                        </div>

                        <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                            <h3 className="text-lg font-semibold text-red-800 mb-2">✗ Non-Returnable Items</h3>
                            <ul className="text-red-700 space-y-2">
                                <li>Custom designed t-shirts (unless defective)</li>
                                <li>Items worn or washed</li>
                                <li>Items without original tags</li>
                                <li>Items returned after 30 days</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Return Process</h2>
                    <p className="text-gray-600 mb-4">
                        To initiate a return, please follow these steps:
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                            <div>
                                <h4 className="font-semibold text-gray-800">Contact Us</h4>
                                <p className="text-gray-600">Email returns@customtshirts.com within 30 days of delivery with your order number and reason for return.</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                            <div>
                                <h4 className="font-semibold text-gray-800">Get Authorization</h4>
                                <p className="text-gray-600">We'll review your request and provide a Return Authorization (RA) number if approved.</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                            <div>
                                <h4 className="font-semibold text-gray-800">Ship Items Back</h4>
                                <p className="text-gray-600">Package items securely with the RA number and ship to our returns center using the provided label.</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
                            <div>
                                <h4 className="font-semibold text-gray-800">Processing</h4>
                                <p className="text-gray-600">Once received, we'll inspect the items and process your refund within 5-7 business days.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Refund Information</h2>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <h4 className="font-semibold text-yellow-800 mb-2">Refund Timeline</h4>
                        <p className="text-yellow-700">
                            Refunds are processed within 5-7 business days after we receive your returned items.
                            It may take an additional 3-5 business days for the refund to appear in your account.
                        </p>
                    </div>

                    <h4 className="font-semibold text-gray-800 mb-2">Refund Methods:</h4>
                    <ul className="list-disc pl-6 text-gray-600 space-y-2">
                        <li>Original payment method (credit card, PayPal, etc.)</li>
                        <li>Store credit (if preferred)</li>
                        <li>Exchange for different size/color (subject to availability)</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Exchanges</h2>
                    <p className="text-gray-600 mb-4">
                        We offer exchanges for:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 space-y-2">
                        <li>Different sizes (same design and color)</li>
                        <li>Different colors (same design and size)</li>
                        <li>Defective items</li>
                    </ul>
                    <p className="text-gray-600 mt-4">
                        <strong>Note:</strong> Custom designed items cannot be exchanged unless there was an error on our part.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Return Shipping</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-2">We Pay Return Shipping For:</h4>
                            <ul className="list-disc pl-6 text-gray-600 space-y-1">
                                <li>Defective products</li>
                                <li>Wrong items sent</li>
                                <li>Our printing errors</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-2">Customer Pays Return Shipping For:</h4>
                            <ul className="list-disc pl-6 text-gray-600 space-y-1">
                                <li>Size exchanges</li>
                                <li>Color preferences</li>
                                <li>Change of mind</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Contact Us</h2>
                    <p className="text-gray-600 mb-4">
                        Have questions about returns or refunds? We're here to help:
                    </p>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-700">
                            <strong>Returns Email:</strong> returns@customtshirts.com<br />
                            <strong>Customer Service:</strong> (123) 456-7890<br />
                            <strong>Hours:</strong> Monday-Friday, 9 AM - 6 PM EST<br />
                            <strong>Return Address:</strong> Will be provided with RA number
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
