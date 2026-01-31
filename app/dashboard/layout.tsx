'use client';

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/contexts/UserContext";
import {
    Settings,
    Layers,
    ShoppingBag,
    Home,
    User as UserIcon
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useUser();
    const pathname = usePathname();
    const router = useRouter();

    // Check if user is logged in
    useEffect(() => {
        if (!isLoading && !user) {
            router.replace("/");
        }
    }, [isLoading, user, router]);

    if (isLoading || !user) {
        return null; // Or a loading spinner
    }

    const navItems = [
        { path: "/dashboard", label: "Dashboard", icon: <Home size={18} /> },
        { path: "/dashboard/profile", label: "Profile", icon: <UserIcon size={18} /> },
        { path: "/dashboard/designs", label: "My Designs", icon: <Layers size={18} /> },
        { path: "/dashboard/orders", label: "Order History", icon: <ShoppingBag size={18} /> },
        { path: "/dashboard/settings", label: "Settings", icon: <Settings size={18} /> }
    ];

    const getTitle = () => {
        if (pathname === "/dashboard") return "Dashboard";
        if (pathname.includes("/profile")) return "Profile";
        if (pathname.includes("/designs")) return "My Designs";
        if (pathname.includes("/orders")) return "Order History";
        if (pathname.includes("/settings")) return "Settings";
        return "Dashboard";
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">{getTitle()}</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Sidebar Navigation */}
                <div className="md:col-span-1">
                    <Card className="p-4">
                        {user && (
                            <div className="text-center mb-4 p-4 border-b">
                                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2 text-blue-600 font-bold">
                                    {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                                </div>
                                <p className="font-medium">{user.name || user.email.split('@')[0]}</p>
                                <p className="text-gray-500 text-sm truncate">{user.email}</p>
                            </div>
                        )}

                        <nav className="space-y-1">
                            {navItems.map((item) => (
                                <Link key={item.path} href={item.path} passHref>
                                    <Button
                                        variant={pathname === item.path ? "default" : "ghost"}
                                        className="w-full justify-start"
                                    >
                                        {item.icon}
                                        <span className="ml-2">{item.label}</span>
                                    </Button>
                                </Link>
                            ))}
                        </nav>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="md:col-span-3">
                    <Card className="p-6">
                        {children}
                    </Card>
                </div>
            </div>
        </div>
    );
}
