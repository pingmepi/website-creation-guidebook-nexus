import TshirtCard from "@/components/TshirtCard";
import { tshirtImages } from "@/assets";

export default function Shop() {
    const tshirtProducts = [
        { id: 1, name: "Classic White Tee", price: "₹2,070", image: tshirtImages.mockup1 },
        { id: 2, name: "Urban Black Design", price: "₹2,490", image: tshirtImages.mockup2 },
        { id: 3, name: "Summer Collection", price: "₹2,240", image: tshirtImages.mockup3 },
        { id: 4, name: "Vintage Edition", price: "₹2,740", image: tshirtImages.mockup4 },
        { id: 5, name: "Modern Minimalist", price: "₹2,320", image: tshirtImages.mockup5 },
        { id: 6, name: "Artist Series", price: "₹2,900", image: tshirtImages.mockup6 },
        // Duplicate some for more content
        { id: 7, name: "Classic Blue Tee", price: "₹2,070", image: tshirtImages.mockup7 },
        { id: 8, name: "Urban Gray Design", price: "₹2,490", image: tshirtImages.mockup8 },
        { id: 9, name: "Winter Collection", price: "₹2,240", image: tshirtImages.mockup9 }
    ];

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Shop All T-Shirts</h1>
                <p className="text-gray-600">Browse our collection of premium quality t-shirts</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {tshirtProducts.map((tshirt) => (
                    <TshirtCard
                        key={tshirt.id}
                        id={tshirt.id}
                        name={tshirt.name}
                        price={tshirt.price}
                        image={typeof tshirt.image === 'string' ? tshirt.image : (tshirt.image as any).src}
                    />
                ))}
            </div>
        </div>
    );
}
