import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, Shirt, Zap, Star, ArrowRight, Sparkles, MoveDown } from "lucide-react";
import { tshirtImages } from "@/assets";

export default function Home() {
    const features = [
        {
            icon: <Palette className="h-6 w-6 text-zinc-950" />,
            title: "Create Unique Designs",
            description: "Stop scrolling for assets. Describe your vision, and our AI forges retail-ready graphics instantly."
        },
        {
            icon: <Shirt className="h-6 w-6 text-zinc-950" />,
            title: "Retail-Grade Quality",
            description: "We don't do cheap. Heavyweight 240GSM organic cotton with high-precision DTG printing."
        },
        {
            icon: <Zap className="h-6 w-6 text-zinc-950" />,
            title: "Launch in Minutes",
            description: "No inventory. No equipment. We handle production and ship globally in 48 hours."
        }
    ];

    const testimonials = [
        {
            name: "ALEX REI",
            role: "Digital Artist",
            comment: "The print quality stunned me. It's not 'merch', it's a legitimate fashion piece."
        },
        {
            name: "JORDAN K.",
            role: "Brand Owner",
            comment: "Merekapade allowed me to drop a 50-piece collection without buying a single blank."
        },
        {
            name: "CASEY M.",
            role: "Creative Director",
            comment: "Finally, generative AI that actually understands layout and aesthetic. A game changer."
        }
    ];

    return (
        <div className="min-h-screen bg-atelier-bg text-zinc-950 font-sans selection:bg-vibrant-green selection:text-zinc-950 flex flex-col">
            {/* Hero Section */}
            <section className="relative pt-12 pb-24 lg:pt-24 lg:pb-32 overflow-hidden flex-1 flex flex-col justify-center">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
                        <div className="lg:col-span-7 flex flex-col items-start text-left space-y-8">
                            {/* SEO / Trust Badge */}
                            <div className="inline-flex items-center gap-2 px-3 py-1 border border-zinc-950 rounded-none bg-white font-mono text-xs uppercase tracking-wider shadow-sm">
                                <Sparkles className="h-3 w-3 text-vibrant-orange" />
                                <span className="text-zinc-600">The #1 Platform for Generative Fashion</span>
                            </div>

                            {/* Benefit-Driven Headline */}
                            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-display font-medium leading-[0.9] tracking-tight">
                                LAUNCH YOUR <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-vibrant-orange to-vibrant-green underline decoration-zinc-950 decoration-4 underline-offset-4">AI FASHION</span>
                                <br /> BRAND.
                            </h1>

                            {/* Conversational Subheadline */}
                            <p className="text-lg md:text-2xl text-zinc-600 max-w-xl font-light leading-relaxed">
                                Don't just design t-shirts. Build a legacy.
                                <span className="font-medium text-zinc-950"> You brings the ideas. AI handles the art. We craft the garment.</span>
                            </p>

                            {/* Action Above Fold + Thumb Friendly */}
                            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-4 relative group">
                                {/* Directional Cue */}
                                <div className="absolute -left-12 top-1/2 -translate-y-1/2 hidden lg:block text-vibrant-orange opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <ArrowRight className="h-8 w-8 animate-pulse" />
                                </div>

                                <Button size="lg" className="h-16 px-10 text-xl w-full sm:w-auto shadow-hard hover:translate-y-[2px] hover:shadow-hard-sm transition-all" asChild>
                                    <Link href="/design">START CREATING</Link>
                                </Button>
                                <Button variant="outline" size="lg" className="h-16 px-10 text-xl w-full sm:w-auto border-2 border-zinc-950 hover:bg-zinc-100" asChild>
                                    <Link href="/shop">EXPLORE DROPS</Link>
                                </Button>
                            </div>

                            <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest pt-2">
                                No Credit Card Req • Free to Design
                            </p>
                        </div>

                        <div className="lg:col-span-5 relative mt-12 lg:mt-0">
                            {/* Visual Utility: Abstract blobs */}
                            <div className="absolute -top-20 -right-20 w-80 h-80 bg-vibrant-green rounded-full blur-[120px] opacity-25 animate-pulse"></div>
                            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-vibrant-orange rounded-full blur-[120px] opacity-25 animate-pulse delay-75"></div>

                            {/* Show Utility: Real product shots */}
                            <div className="relative z-10 grid grid-cols-2 gap-4 border-2 border-zinc-950 p-4 bg-white shadow-hard rotate-2 transition-transform hover:rotate-0 duration-500">
                                <div className="aspect-[3/4] overflow-hidden bg-zinc-100 border border-zinc-200">
                                    <img
                                        src={typeof tshirtImages.mockup1 === 'string' ? tshirtImages.mockup1 : (tshirtImages.mockup1 as any).src}
                                        alt="High quality custom t-shirt on model"
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                                    />
                                </div>
                                <div className="aspect-[3/4] overflow-hidden bg-zinc-100 border border-zinc-200 mt-12">
                                    <img
                                        src={typeof tshirtImages.mockup2 === 'string' ? tshirtImages.mockup2 : (tshirtImages.mockup2 as any).src}
                                        alt="Generative AI fashion design"
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                                    />
                                </div>

                                {/* Social Proof Sticker */}
                                <div className="absolute -top-6 -right-6 bg-vibrant-orange text-white w-28 h-28 rounded-full flex flex-col items-center justify-center font-display font-bold text-center leading-none text-sm border-2 border-zinc-950 shadow-hard-sm -rotate-6 hover:rotate-12 transition-transform">
                                    <span className="text-2xl">4.9</span>
                                    <span>STARS</span>
                                    <div className="flex gap-0.5 mt-1">
                                        {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3 h-3 fill-white" />)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator (Mobile) */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 lg:hidden text-zinc-400 animate-bounce">
                    <MoveDown className="h-6 w-6" />
                </div>
            </section>

            {/* Marquee: Social Proof & Keywords */}
            <div className="w-full bg-zinc-950 text-white overflow-hidden py-5 border-y-2 border-zinc-950">
                <div className="whitespace-nowrap flex gap-16 items-center font-mono text-sm uppercase tracking-[0.2em] animate-marquee">
                    <span>• USED BY 10,000+ CREATORS</span>
                    <span>• SUSTAINABLE ORGANIC COTTON</span>
                    <span>• ZERO INVENTORY RISK</span>
                    <span>• WORLDWIDE DROPSHIPPING</span>
                    <span>• USED BY 10,000+ CREATORS</span>
                    <span>• SUSTAINABLE ORGANIC COTTON</span>
                    <span>• ZERO INVENTORY RISK</span>
                    <span>• WORLDWIDE DROPSHIPPING</span>
                </div>
            </div>

            {/* Features: Value Prop Focus */}
            <section className="py-24 bg-white border-b border-zinc-200" id="features">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-4xl md:text-5xl font-display font-medium mb-6">
                            THE STUDIO IS YOURS.
                        </h2>
                        <p className="text-xl text-zinc-500 font-light">
                            We removed the barriers. You just need the vision.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <Card key={index} className="group cursor-pointer h-full flex flex-col">
                                <CardHeader>
                                    <div className="w-14 h-14 bg-zinc-50 border border-zinc-950 flex items-center justify-center mb-6 group-hover:bg-vibrant-green transition-colors duration-200 shadow-hard-sm">
                                        {feature.icon}
                                    </div>
                                    <CardTitle className="text-2xl font-display font-bold uppercase">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <CardDescription className="text-zinc-600 text-lg leading-relaxed">
                                        {feature.description}
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works: Technical/Process Flow */}
            <section className="py-24 bg-zinc-50 border-b border-zinc-200">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
                        <h2 className="text-5xl md:text-6xl font-display font-medium max-w-2xl leading-none">
                            FROM PROMPT<br />TO PRODUCT.
                        </h2>
                        <p className="text-zinc-500 font-mono uppercase tracking-widest text-sm mb-2">
                            Simplifying the Complex
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border-t border-l border-zinc-300">
                        {[
                            { step: "01", title: "Config", desc: "Select from our curated library of premium blanks." },
                            { step: "02", title: "Prompt", desc: "Type your idea. Watch our AI generate the impossible." },
                            { step: "03", title: "Refine", desc: "Upscale, remix, and position your art on the canvas." },
                            { step: "04", title: "Launch", desc: "Order a sample or start selling immediately." }
                        ].map((item, i) => (
                            <div key={i} className="border-r border-b border-zinc-300 p-8 hover:bg-white transition-colors h-full flex flex-col justify-between min-h-[280px] group">
                                <span className="font-mono text-zinc-300 text-6xl opacity-50 font-bold group-hover:text-vibrant-orange transition-colors">{item.step}</span>
                                <div className="mt-8">
                                    <h3 className="text-xl font-display font-bold mb-3 uppercase">{item.title}</h3>
                                    <p className="text-zinc-600 text-sm leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Social Proof: Authentic Voices */}
            <section className="py-24 bg-white relative overflow-hidden">
                <div className="container mx-auto px-6">
                    <h2 className="text-center font-mono text-sm uppercase tracking-widest text-zinc-400 mb-16">
                        Trusted by the New Wave
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {testimonials.map((t, i) => (
                            <div key={i} className="relative p-10 border-2 border-zinc-100 bg-zinc-50 hover:border-zinc-950 hover:shadow-hard transition-all duration-300">
                                <div className="absolute -top-5 -left-2 text-8xl text-zinc-200/50 font-serif leading-none">"</div>
                                <p className="text-xl font-medium text-zinc-800 mb-8 relative z-10 italic font-serif leading-relaxed">
                                    {t.comment}
                                </p>
                                <div className="flex items-center gap-4 border-t border-zinc-200 pt-6">
                                    <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center font-bold text-zinc-500">
                                        {t.name[0]}
                                    </div>
                                    <div>
                                        <p className="font-bold font-mono text-sm uppercase tracking-wide text-zinc-950">{t.name}</p>
                                        <p className="text-xs text-vibrant-orange font-mono uppercase mt-0.5 font-bold">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Massive Footer CTA */}
            <section className="py-32 bg-zinc-950 text-white text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%,transparent_100%)] bg-[length:30px_30px]"></div>

                <div className="container mx-auto px-6 relative z-10">
                    <h2 className="text-6xl md:text-9xl font-display font-medium mb-8 leading-none tracking-tighter">
                        MAKE IT <span className="text-vibrant-green">LOUD</span>.
                    </h2>
                    <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto font-light">
                        The tools are ready. The studio is open.
                    </p>
                    <div className="flex flex-col items-center gap-6">
                        <Button size="lg" className="h-20 px-16 text-2xl bg-vibrant-orange text-white hover:bg-white hover:text-zinc-950 border-4 border-transparent hover:border-vibrant-orange shadow-[0_0_50px_rgba(255,69,0,0.3)] hover:shadow-[0_0_80px_rgba(255,69,0,0.5)] transition-all duration-300" asChild>
                            <Link href="/design">START DESIGNING NOW</Link>
                        </Button>
                        <p className="text-sm text-zinc-500 font-mono uppercase tracking-widest">
                            Join 10,000+ Creators
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
