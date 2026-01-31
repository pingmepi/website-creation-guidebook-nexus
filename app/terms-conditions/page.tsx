export default function TermsConditions() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="prose prose-lg max-w-none">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms & Conditions</h1>

                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
                    <p className="text-blue-800">
                        <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
                    </p>
                </div>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Agreement to Terms</h2>
                    <p className="text-gray-600 mb-4">
                        By accessing and using Custom T-Shirts website ("Service"), you agree to be bound by these Terms and Conditions ("Terms").
                        If you disagree with any part of these terms, you may not access the Service.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Use of Service</h2>

                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Permitted Uses</h3>
                            <ul className="list-disc pl-6 text-gray-600 space-y-1">
                                <li>Browse and purchase t-shirts for personal use</li>
                                <li>Create custom designs using our design tools</li>
                                <li>Access your account and order history</li>
                                <li>Contact customer support</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Prohibited Uses</h3>
                            <ul className="list-disc pl-6 text-gray-600 space-y-1">
                                <li>Violating any applicable laws or regulations</li>
                                <li>Uploading copyrighted or trademarked content without permission</li>
                                <li>Creating offensive, harmful, or inappropriate designs</li>
                                <li>Attempting to hack or disrupt our systems</li>
                                <li>Reselling our products without authorization</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Account Responsibilities</h2>
                    <p className="text-gray-600 mb-4">When you create an account with us, you agree to:</p>
                    <ul className="list-disc pl-6 text-gray-600 space-y-2">
                        <li>Provide accurate and complete information</li>
                        <li>Keep your login credentials secure</li>
                        <li>Notify us immediately of any unauthorized access</li>
                        <li>Be responsible for all activities under your account</li>
                        <li>Update your information when necessary</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Intellectual Property Rights</h2>

                    <div className="space-y-6">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Your Content</h3>
                            <p className="text-yellow-700 mb-2">
                                When you upload designs or content to our platform, you represent that:
                            </p>
                            <ul className="list-disc pl-6 text-yellow-700 space-y-1">
                                <li>You own or have permission to use the content</li>
                                <li>The content doesn't infringe on third-party rights</li>
                                <li>You grant us a license to use the content for order fulfillment</li>
                            </ul>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-blue-800 mb-2">Our Content</h3>
                            <p className="text-blue-700">
                                All website content, including text, graphics, logos, and software, is owned by Custom T-Shirts
                                and protected by copyright and trademark laws. You may not reproduce, distribute, or create
                                derivative works without our written permission.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Orders and Payment</h2>

                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Order Acceptance</h3>
                            <p className="text-gray-600">
                                All orders are subject to acceptance and availability. We reserve the right to refuse or cancel
                                any order for any reason, including pricing errors, product unavailability, or suspected fraud.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Pricing and Payment</h3>
                            <ul className="list-disc pl-6 text-gray-600 space-y-1">
                                <li>All prices are in INR (Indian Rupees) and subject to change without notice</li>
                                <li>Payment is required at the time of order</li>
                                <li>We accept UPI, credit/debit cards, net banking, and digital wallets</li>
                                <li>Additional taxes and shipping fees may apply</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Product Quality and Satisfaction</h2>
                    <p className="text-gray-600 mb-4">
                        We strive to provide high-quality products and accurate representations. However:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 space-y-2">
                        <li>Colors may vary slightly due to monitor settings and printing processes</li>
                        <li>Custom designs are final once approved and cannot be changed</li>
                        <li>We are not responsible for design quality issues if you provide low-resolution artwork</li>
                        <li>Size charts are provided as guides; fit may vary by individual</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Limitation of Liability</h2>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-700 mb-2">
                            <strong>IMPORTANT:</strong> To the fullest extent permitted by law, Custom T-Shirts shall not be liable for:
                        </p>
                        <ul className="list-disc pl-6 text-red-700 space-y-1">
                            <li>Indirect, incidental, or consequential damages</li>
                            <li>Loss of profits, data, or business opportunities</li>
                            <li>Damages exceeding the amount paid for the product</li>
                            <li>Issues arising from third-party services or shipping delays</li>
                        </ul>
                    </div>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Indemnification</h2>
                    <p className="text-gray-600">
                        You agree to indemnify and hold harmless Custom T-Shirts from any claims, damages, or expenses
                        arising from your use of the Service, violation of these Terms, or infringement of third-party rights.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Termination</h2>
                    <p className="text-gray-600 mb-4">
                        We may terminate or suspend your account and access to the Service at our discretion, without notice, for:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 space-y-1">
                        <li>Violation of these Terms</li>
                        <li>Fraudulent or illegal activity</li>
                        <li>Abuse of our systems or staff</li>
                        <li>Extended periods of inactivity</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Governing Law</h2>
                    <p className="text-gray-600">
                        These Terms are governed by the laws of [Your State/Country]. Any disputes will be resolved
                        in the courts of [Your Jurisdiction]. If any provision of these Terms is found to be
                        unenforceable, the remaining provisions will remain in effect.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Changes to Terms</h2>
                    <p className="text-gray-600">
                        We reserve the right to modify these Terms at any time. Changes will be posted on this page
                        with an updated "Last Updated" date. Your continued use of the Service after changes constitutes
                        acceptance of the new Terms.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Contact Information</h2>
                    <p className="text-gray-600 mb-4">
                        If you have questions about these Terms & Conditions, please contact us:
                    </p>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-700">
                            <strong>Email:</strong> legal@customtshirts.com<br />
                            <strong>Phone:</strong> (123) 456-7890<br />
                            <strong>Address:</strong> 123 T-Shirt Lane, Fashion District, ST 12345<br />
                            <strong>Business Hours:</strong> Monday-Friday, 9 AM - 6 PM EST
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
