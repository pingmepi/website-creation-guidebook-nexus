'use client';

import { useEffect, useState, useCallback } from "react";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { Palette, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Design {
    id: string;
    name: string;
    description: string | null;
    preview_url: string | null;
    created_at: string;
    t_shirt_color: string;
}

export default function SavedDesigns() {
    const { user } = useUser();
    const [designs, setDesigns] = useState<Design[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchDesigns = useCallback(async () => {
        if (!user) return;

        try {
            setLoading(true);

            const { data, error } = await supabase
                .from("designs")
                .select("id, name, description, preview_url, created_at, t_shirt_color")
                .eq("user_id", user.id as any)
                .order("created_at", { ascending: false });

            if (error) throw error;

            setDesigns((data as any) || []);
        } catch (error) {
            console.error("Error fetching designs:", error);
            toast.error("Failed to load your designs");
        } finally {
            setLoading(false);
        }
    }, [user]);

    const handleDeleteDesign = async (id: string) => {
        if (!confirm("Are you sure you want to delete this design?")) return;

        try {
            const { error } = await supabase
                .from("designs")
                .delete()
                .eq("id", id as any);

            if (error) throw error;

            setDesigns((designs) => designs.filter((design) => design.id !== id));
            toast.success("Design deleted successfully");
        } catch (error) {
            console.error("Error deleting design:", error);
            toast.error("Failed to delete design");
        }
    };

    useEffect(() => {
        fetchDesigns();
    }, [user, fetchDesigns]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Saved Designs</h2>
                <Button asChild>
                    <Link href="/design">
                        <Palette className="mr-2 h-4 w-4" />
                        Create New Design
                    </Link>
                </Button>
            </div>

            {loading ? (
                <div className="text-center py-8">
                    <p>Loading your designs...</p>
                </div>
            ) : designs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {designs.map((design) => (
                        <Card key={design.id} className="overflow-hidden">
                            <div
                                className="h-48 w-full bg-gray-100 flex items-center justify-center"
                                style={design.preview_url ? { backgroundImage: `url(${design.preview_url})`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' } : {}}
                            >
                                {!design.preview_url && (
                                    <div className="text-gray-400 text-sm">No preview available</div>
                                )}
                            </div>

                            <CardContent className="p-4">
                                <h3 className="font-medium">{design.name}</h3>
                                {design.description && (
                                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{design.description}</p>
                                )}
                                <div className="mt-2 flex items-center">
                                    <div
                                        className="w-4 h-4 rounded-full mr-2"
                                        style={{ backgroundColor: design.t_shirt_color }}
                                    />
                                    <span className="text-xs text-gray-500">
                                        Created {new Date(design.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </CardContent>

                            <CardFooter className="p-4 pt-0 flex justify-between">
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/design?id=${design.id}`}>
                                        <Edit className="mr-1 h-3 w-3" />
                                        Edit
                                    </Link>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => handleDeleteDesign(design.id)}
                                >
                                    <Trash2 className="mr-1 h-3 w-3" />
                                    Delete
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 border rounded-md bg-gray-50">
                    <Palette className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium">No designs yet</h3>
                    <p className="mt-1 text-gray-500">Create your first custom t-shirt design</p>
                    <Button className="mt-6" asChild>
                        <Link href="/design">Start Designing</Link>
                    </Button>
                </div>
            )}
        </div>
    );
}
