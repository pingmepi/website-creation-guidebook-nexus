'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
    const router = useRouter();

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Supabase JS handles the hash parsing automatically when detectSessionInUrl: true
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) throw error;

                if (session) {
                    toast.success("Logged in with Google");
                    router.replace("/dashboard");
                } else {
                    toast.error("Login failed. Please try again.");
                    router.replace("/");
                }
            } catch (err) {
                console.error("OAuth callback error:", err);
                toast.error("Login failed. Please try again.");
                router.replace("/");
            }
        };

        handleCallback();
    }, [router]);

    return (
        <div className="min-h-[50vh] flex items-center justify-center">
            <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Signing you in…</span>
            </div>
        </div>
    );
}
