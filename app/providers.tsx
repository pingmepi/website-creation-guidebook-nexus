'use client';

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserProvider } from "@/contexts/UserContext";
import { CartProvider } from "@/contexts/CartContext";
import { ReactNode, useState } from "react";

export function Providers({ children }: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <UserProvider>
                    <CartProvider>
                        {children}
                        <Toaster />
                    </CartProvider>
                </UserProvider>
            </TooltipProvider>
        </QueryClientProvider>
    );
}
