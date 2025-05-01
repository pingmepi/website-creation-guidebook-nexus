
import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ShoppingBag, Trash } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";

interface Address {
  id: string;
  name: string;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

const Profile = () => {
  const { user, isLoading } = useUser();
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    marketingEmails: true
  });
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<Address | null>(null);
  const [addressFormData, setAddressFormData] = useState({
    name: "",
    street_address: "",
    city: "",
    state: "",
    postal_code: "",
    country: "United States",
    is_default: false
  });

  useEffect(() => {
    if (user) {
      // Fetch profile data
      const fetchProfileData = async () => {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("full_name, avatar_url, marketing_emails")
            .eq("id", user.id)
            .single();
            
          if (error) throw error;
          
          setFormData({
            fullName: data.full_name || "",
            email: user.email,
            marketingEmails: data.marketing_emails ?? true
          });
        } catch (error) {
          console.error("Error fetching profile data:", error);
        }
      };
      
      // Fetch addresses
      const fetchAddresses = async () => {
        try {
          const { data, error } = await supabase
            .from("addresses")
            .select("*")
            .eq("user_id", user.id)
            .order("is_default", { ascending: false });
            
          if (error) throw error;
          
          setAddresses(data || []);
        } catch (error) {
          console.error("Error fetching addresses:", error);
        }
      };
      
      fetchProfileData();
      fetchAddresses();
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMarketingEmailsChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, marketingEmails: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      setIsUpdating(true);
      
      // Update profile in the profiles table
      const { error } = await supabase
        .from("profiles")
        .update({ 
          full_name: formData.fullName,
          marketing_emails: formData.marketingEmails
        })
        .eq("id", user.id);
      
      if (error) throw error;
      
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setIsUpdating(true);
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      
      if (error) throw error;
      
      toast.success("Password updated successfully");
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      console.error("Error updating password:", error);
      toast.error(error.message || "Failed to update password");
    } finally {
      setIsUpdating(false);
    }
  };

  // Address functions
  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setAddressFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const resetAddressForm = () => {
    setAddressFormData({
      name: "",
      street_address: "",
      city: "",
      state: "",
      postal_code: "",
      country: "United States",
      is_default: false
    });
    setCurrentAddress(null);
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      setIsUpdating(true);
      
      // If setting as default, update all other addresses to not be default
      if (addressFormData.is_default) {
        await supabase
          .from("addresses")
          .update({ is_default: false })
          .eq("user_id", user.id);
      }

      if (currentAddress) {
        // Update existing address
        const { error } = await supabase
          .from("addresses")
          .update({
            name: addressFormData.name,
            street_address: addressFormData.street_address,
            city: addressFormData.city,
            state: addressFormData.state,
            postal_code: addressFormData.postal_code,
            country: addressFormData.country,
            is_default: addressFormData.is_default,
            updated_at: new Date().toISOString()
          })
          .eq("id", currentAddress.id);
          
        if (error) throw error;
        
        toast.success("Address updated successfully");
      } else {
        // Create new address
        const { error } = await supabase
          .from("addresses")
          .insert({
            user_id: user.id,
            name: addressFormData.name,
            street_address: addressFormData.street_address,
            city: addressFormData.city,
            state: addressFormData.state,
            postal_code: addressFormData.postal_code,
            country: addressFormData.country,
            is_default: addressFormData.is_default
          });
          
        if (error) throw error;
        
        toast.success("Address added successfully");
      }
      
      // Refresh addresses
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false });
        
      if (error) throw error;
      
      setAddresses(data || []);
      setShowAddressDialog(false);
      resetAddressForm();
      
    } catch (error) {
      console.error("Error saving address:", error);
      toast.error("Failed to save address");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditAddress = (address: Address) => {
    setCurrentAddress(address);
    setAddressFormData({
      name: address.name,
      street_address: address.street_address,
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      country: address.country,
      is_default: address.is_default
    });
    setShowAddressDialog(true);
  };

  const handleDeleteAddress = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from("addresses")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      // Refresh addresses
      setAddresses(addresses.filter(addr => addr.id !== id));
      toast.success("Address deleted successfully");
    } catch (error) {
      console.error("Error deleting address:", error);
      toast.error("Failed to delete address");
    }
  };

  const handleAddAddress = () => {
    resetAddressForm();
    setShowAddressDialog(true);
  };

  if (isLoading) {
    return <DashboardLayout title="Profile">Loading...</DashboardLayout>;
  }

  return (
    <DashboardLayout title="Profile">
      <Tabs defaultValue="details">
        <TabsList className="mb-4">
          <TabsTrigger value="details">Profile Details</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details here.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Your email"
                    disabled
                  />
                  <p className="text-xs text-gray-500">
                    Email cannot be changed. Contact support if you need to update it.
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="marketingEmails">Marketing Emails</Label>
                    <p className="text-xs text-gray-500">
                      Receive emails about new products, features, and more.
                    </p>
                  </div>
                  <Switch
                    id="marketingEmails"
                    checked={formData.marketingEmails}
                    onCheckedChange={handleMarketingEmailsChange}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? "Updating..." : "Update Profile"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="addresses">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Your Addresses</CardTitle>
                <CardDescription>
                  Manage your shipping and billing addresses.
                </CardDescription>
              </div>
              <Button onClick={handleAddAddress}>Add New Address</Button>
            </CardHeader>
            <CardContent>
              {addresses.length === 0 ? (
                <div className="text-center py-6">
                  <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">No addresses</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    You haven't added any addresses yet.
                  </p>
                  <div className="mt-6">
                    <Button onClick={handleAddAddress}>
                      Add your first address
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4">
                  {addresses.map((address) => (
                    <div 
                      key={address.id} 
                      className={`border p-4 rounded-md relative ${address.is_default ? 'bg-blue-50 border-blue-200' : ''}`}
                    >
                      {address.is_default && (
                        <span className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">
                          Default
                        </span>
                      )}
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{address.name}</h3>
                          <p className="text-sm text-gray-600">{address.street_address}</p>
                          <p className="text-sm text-gray-600">
                            {address.city}, {address.state} {address.postal_code}
                          </p>
                          <p className="text-sm text-gray-600">{address.country}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditAddress(address)}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => handleDeleteAddress(address.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{currentAddress ? "Edit Address" : "Add New Address"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddressSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Address Name (e.g., Home, Work)</Label>
                    <Input
                      id="name"
                      name="name"
                      value={addressFormData.name}
                      onChange={handleAddressInputChange}
                      placeholder="Home"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="street_address">Street Address</Label>
                    <Input
                      id="street_address"
                      name="street_address"
                      value={addressFormData.street_address}
                      onChange={handleAddressInputChange}
                      placeholder="123 Main St"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        value={addressFormData.city}
                        onChange={handleAddressInputChange}
                        placeholder="New York"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        name="state"
                        value={addressFormData.state}
                        onChange={handleAddressInputChange}
                        placeholder="NY"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="postal_code">Postal Code</Label>
                      <Input
                        id="postal_code"
                        name="postal_code"
                        value={addressFormData.postal_code}
                        onChange={handleAddressInputChange}
                        placeholder="10001"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        name="country"
                        value={addressFormData.country}
                        onChange={handleAddressInputChange}
                        placeholder="United States"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_default"
                      name="is_default"
                      checked={addressFormData.is_default}
                      onChange={handleAddressInputChange}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="is_default" className="font-normal">Set as default address</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowAddressDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? "Saving..." : (currentAddress ? "Update" : "Add")}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handlePasswordChange}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    placeholder="New password"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? "Updating..." : "Change Password"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Profile;
