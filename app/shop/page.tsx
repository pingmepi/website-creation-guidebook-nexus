import TshirtCard from "@/components/TshirtCard";
import { tshirtImages } from "@/assets";
import { trackEvent } from "@/lib/trackEvent";

export default function Shop() {
    trackEvent("view_item_list", { item_count: 9 });
    const tshirtProducts = [
        { id: "bbf231f6-4f6b-487e-bcc0-5db8d91fc10c", name: "Classic White Tee", price: "₹2,070", image: tshirtImages.mockup1 },
        { id: "2a026f73-1c40-4f34-8cab-6f1281fafcab", name: "Urban Black Design", price: "₹2,490", image: tshirtImages.mockup2 },
        { id: "af4da6c0-df94-4758-ae66-014ff6b8b3ef", name: "Summer Collection", price: "₹2,240", image: tshirtImages.mockup3 },
        { id: "bbf231f6-4f6b-487e-bcc0-5db8d91fc10c", name: "Vintage Edition", price: "₹2,740", image: tshirtImages.mockup4 },
        { id: "2a026f73-1c40-4f34-8cab-6f1281fafcab", name: "Modern Minimalist", price: "₹2,320", image: tshirtImages.mockup5 },
        { id: "af4da6c0-df94-4758-ae66-014ff6b8b3ef", name: "Artist Series", price: "₹2,900", image: tshirtImages.mockup6 },
        // Duplicate some for more content
        { id: "bbf231f6-4f6b-487e-bcc0-5db8d91fc10c", name: "Classic Blue Tee", price: "₹2,070", image: tshirtImages.mockup7 },
        { id: "2a026f73-1c40-4f34-8cab-6f1281fafcab", name: "Urban Gray Design", price: "₹2,490", image: tshirtImages.mockup8 },
        { id: "af4da6c0-df94-4758-ae66-014ff6b8b3ef", name: "Winter Collection", price: "₹2,240", image: tshirtImages.mockup9 }
    ];

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Shop All T-Shirts</h1>
                <p className="text-gray-600">Browse our collection of premium quality t-shirts</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {tshirtProducts.map((tshirt, index) => (
                    <TshirtCard
                        key={`${tshirt.id}-${index}`}
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
