export default function PrivacyPolicy() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="prose prose-lg max-w-none">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
                    <p className="text-blue-800">
                        <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
                    </p>
                </div>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Introduction</h2>
                    <p className="text-gray-600 mb-4">
                        At Custom T-Shirts ("we," "our," or "us"), we respect your privacy and are committed to protecting your personal information.
                        This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website
                        or make a purchase from us.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Information We Collect</h2>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Personal Information</h3>
                            <p className="text-gray-600 mb-2">We may collect the following personal information:</p>
                            <ul className="list-disc pl-6 text-gray-600 space-y-1">
                                <li>Name and contact information (email, phone, address)</li>
                                <li>Billing and shipping addresses</li>
                                <li>Payment information (processed securely by our payment providers)</li>
                                <li>Account credentials (username, password)</li>
                                <li>Design preferences and custom artwork</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Automatically Collected Information</h3>
                            <ul className="list-disc pl-6 text-gray-600 space-y-1">
                                <li>IP address and browser information</li>
                                <li>Device information and operating system</li>
                                <li>Website usage data and analytics</li>
                                <li>Cookies and similar tracking technologies</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">How We Use Your Information</h2>
                    <p className="text-gray-600 mb-4">We use your information to:</p>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-2">Order Processing</h4>
                            <ul className="list-disc pl-6 text-gray-600 space-y-1">
                                <li>Process and fulfill orders</li>
                                <li>Send order confirmations</li>
                                <li>Provide shipping updates</li>
                                <li>Handle returns and exchanges</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-800 mb-2">Customer Service</h4>
                            <ul className="list-disc pl-6 text-gray-600 space-y-1">
                                <li>Respond to inquiries</li>
                                <li>Provide technical support</li>
                                <li>Send important updates</li>
                                <li>Improve our services</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Information Sharing</h2>
                    <p className="text-gray-600 mb-4">
                        We do not sell, trade, or rent your personal information to third parties. We may share your information only in these circumstances:
                    </p>

                    <div className="space-y-4">
                        <div className="border-l-4 border-blue-400 pl-4">
                            <h4 className="font-semibold text-gray-800">Service Providers</h4>
                            <p className="text-gray-600">Payment processors, shipping companies, and other trusted partners who help us operate our business.</p>
                        </div>

                        <div className="border-l-4 border-green-400 pl-4">
                            <h4 className="font-semibold text-gray-800">Legal Requirements</h4>
                            <p className="text-gray-600">When required by law, court order, or to protect our rights and safety.</p>
                        </div>

                        <div className="border-l-4 border-yellow-400 pl-4">
                            <h4 className="font-semibold text-gray-800">Business Transfers</h4>
                            <p className="text-gray-600">In connection with a merger, acquisition, or sale of business assets.</p>
                        </div>
                    </div>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Cookies and Tracking</h2>
                    <p className="text-gray-600 mb-4">
                        We use cookies and similar technologies to enhance your browsing experience:
                    </p>

                    <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-800 mb-2">Types of Cookies We Use:</h4>
                        <ul className="list-disc pl-6 text-gray-600 space-y-1">
                            <li><strong>Essential Cookies:</strong> Required for website functionality</li>
                            <li><strong>Analytics Cookies:</strong> Help us understand how you use our site</li>
                            <li><strong>Marketing Cookies:</strong> Used to show relevant advertisements</li>
                            <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                        </ul>
                    </div>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Data Security</h2>
                    <p className="text-gray-600 mb-4">
                        We implement appropriate security measures to protect your personal information:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 space-y-2">
                        <li>SSL encryption for data transmission</li>
                        <li>Secure payment processing</li>
                        <li>Regular security audits and updates</li>
                        <li>Limited access to personal information</li>
                        <li>Employee training on data protection</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Rights</h2>
                    <p className="text-gray-600 mb-4">You have the right to:</p>

                    <div className="grid md:grid-cols-2 gap-4">
                        <ul className="list-disc pl-6 text-gray-600 space-y-2">
                            <li>Access your personal information</li>
                            <li>Correct inaccurate data</li>
                            <li>Delete your account and data</li>
                            <li>Opt-out of marketing communications</li>
                        </ul>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2">
                            <li>Data portability</li>
                            <li>Restrict processing</li>
                            <li>Object to certain uses</li>
                            <li>File a complaint with authorities</li>
                        </ul>
                    </div>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Data Retention</h2>
                    <p className="text-gray-600 mb-4">
                        We retain your personal information only as long as necessary for the purposes outlined in this policy:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 space-y-2">
                        <li>Account information: Until you delete your account</li>
                        <li>Order history: 7 years for tax and legal purposes</li>
                        <li>Marketing data: Until you unsubscribe</li>
                        <li>Website analytics: 26 months</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Children's Privacy</h2>
                    <p className="text-gray-600">
                        Our website is not intended for children under 13 years of age. We do not knowingly collect personal information
                        from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Contact Us</h2>
                    <p className="text-gray-600 mb-4">
                        If you have questions about this Privacy Policy or our data practices, please contact us:
                    </p>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-700">
                            <strong>Email:</strong> privacy@customtshirts.com<br />
                            <strong>Phone:</strong> (123) 456-7890<br />
                            <strong>Address:</strong> 123 T-Shirt Lane, Fashion District, ST 12345<br />
                            <strong>Data Protection Officer:</strong> dpo@customtshirts.com
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
