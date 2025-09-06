import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/toast";
import { tshirtImages } from "../../assets";
import PaymentGateway from "@/components/payment/PaymentGateway";

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product?: {
    name: string;
    price: string;
    image: string;
  };
}

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

const Checkout = () => {
  const { user, isAuthenticated } = useUser();
  const { cartItems, customDesigns, clearCart } = useCart();
  const navigate = useNavigate();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [saveAddress, setSaveAddress] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  
  const [shippingAddress, setShippingAddress] = useState({
    name: "",
    street_address: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India"
  });

  const mockProducts = [
    { id: "1", name: "Classic White Tee", price: "₹2,070", image: tshirtImages.mockup1 },
    { id: "2", name: "Urban Black Design", price: "₹2,490", image: tshirtImages.mockup2 },
    { id: "3", name: "Summer Collection", price: "₹2,240", image: tshirtImages.mockup3 },
    { id: "4", name: "Vintage Edition", price: "₹2,740", image: tshirtImages.mockup4 },
    { id: "5", name: "Modern Minimalist", price: "₹2,320", image: tshirtImages.mockup5 },
    { id: "6", name: "Artist Series", price: "₹2,900", image: tshirtImages.mockup6 },
    { id: "7", name: "Classic Blue Tee", price: "₹2,070", image: tshirtImages.mockup1 },
    { id: "8", name: "Urban Gray Design", price: "₹2,490", image: tshirtImages.mockup2 },
    { id: "9", name: "Winter Collection", price: "₹2,240", image: tshirtImages.mockup3 }
  ];

  const itemsWithProducts = cartItems.map(item => {
    const product = mockProducts.find(p => p.id === item.product_id);
    return { ...item, product };
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    if (cartItems.length === 0 && (!customDesigns || customDesigns.length === 0)) {
      navigate('/cart');
      return;
    }

    fetchSavedAddresses();
  }, [isAuthenticated, cartItems.length, customDesigns?.length, customDesigns, navigate]);

  const fetchSavedAddresses = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("addresses")
        .select("id, name, street_address, city, state, postal_code, country, is_default")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false });

      if (error) throw error;

      setSavedAddresses(data || []);
      
      // Set default address if available
      const defaultAddress = data?.find(addr => addr.is_default);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  }, [user]);

  const calculateSubtotal = () => {
    const regularItemsTotal = itemsWithProducts.reduce((total, item) => {
      const price = parseFloat(item.product?.price?.replace('₹', '').replace(',', '') || '0');
      return total + (price * item.quantity);
    }, 0);

    const customDesignsTotal = (customDesigns || []).reduce((total, design) => {
      return total + design.base_price;
    }, 0);

    return (regularItemsTotal + customDesignsTotal).toFixed(2);
  };

  const handleAddressChange = (addressId: string) => {
    setSelectedAddressId(addressId);
    setUseNewAddress(false);
  };

  const handleUseNewAddress = () => {
    setUseNewAddress(true);
    setSelectedAddressId("");
  };

  const saveNewAddress = async () => {
    if (!user || !saveAddress) return null;

    try {
      const { data, error } = await supabase
        .from("addresses")
        .insert({
          user_id: user.id,
          ...shippingAddress,
          is_default: savedAddresses.length === 0
        })
        .select('id')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error saving address:", error);
      throw error;
    }
  };

  const placeOrder = async () => {
    if (!user) return;

    setIsPlacingOrder(true);

    try {
      let finalShippingAddress;
      let savedAddressId = null;

      if (useNewAddress) {
        // Validate new address
        if (!shippingAddress.name || !shippingAddress.street_address || 
            !shippingAddress.city || !shippingAddress.state || !shippingAddress.postal_code) {
          toast.error("Please fill in all shipping address fields");
          setIsPlacingOrder(false);
          return;
        }

        finalShippingAddress = shippingAddress;
        
        if (saveAddress) {
          const newAddress = await saveNewAddress();
          savedAddressId = newAddress?.id;
        }
      } else {
        // Use selected saved address
        const selectedAddress = savedAddresses.find(addr => addr.id === selectedAddressId);
        if (!selectedAddress) {
          toast.error("Please select a shipping address");
          setIsPlacingOrder(false);
          return;
        }

        finalShippingAddress = {
          name: selectedAddress.name,
          street_address: selectedAddress.street_address,
          city: selectedAddress.city,
          state: selectedAddress.state,
          postal_code: selectedAddress.postal_code,
          country: selectedAddress.country
        };
        savedAddressId = selectedAddress.id;
      }

      const totalAmount = parseFloat(calculateSubtotal());

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total_amount: totalAmount,
          shipping_address: finalShippingAddress,
          shipping_address_id: savedAddressId,
          status: 'pending',
          order_number: ''
        })
        .select('id')
        .single();

      if (orderError) throw orderError;

      // Create order items for regular products
      const orderItemsData = itemsWithProducts.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: parseFloat(item.product?.price?.replace('₹', '').replace(',', '') || '0'),
        total_price: parseFloat(item.product?.price?.replace('₹', '').replace(',', '') || '0') * item.quantity
      }));

      // Create order items for custom designs
      const customDesignOrderItems = customDesigns.map(design => ({
        order_id: order.id,
        product_id: 'custom-design',
        custom_design_id: design.id,
        quantity: 1,
        unit_price: design.base_price,
        total_price: design.base_price
      }));

      const allOrderItems = [...orderItemsData, ...customDesignOrderItems];

      if (allOrderItems.length > 0) {
        const { error: itemsError } = await supabase
          .from("order_items")
          .insert(allOrderItems);

        if (itemsError) throw itemsError;
      }

      setOrderId(order.id);
      setShowPayment(true);

    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Failed to place order. Please try again.");
      setIsPlacingOrder(false);
    }
  };

  const handlePaymentSuccess = async () => {
    await clearCart();
    toast.success("Payment successful! Order placed.");
    navigate(`/dashboard/orders`);
  };

  if (!isAuthenticated || (cartItems.length === 0 && (!customDesigns || customDesigns.length === 0))) {
    return null;
  }

  if (showPayment && orderId) {
    return (
      <PaymentGateway 
        orderId={orderId}
        amount={parseFloat(calculateSubtotal())}
        onSuccess={handlePaymentSuccess}
        onCancel={() => setShowPayment(false)}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Shipping Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {savedAddresses.length > 0 && (
                  <div>
                    <Label className="text-base font-medium mb-3 block">Saved Addresses</Label>
                    <RadioGroup value={selectedAddressId} onValueChange={handleAddressChange}>
                      {savedAddresses.map((address) => (
                        <div key={address.id} className="flex items-start space-x-2">
                          <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                          <label htmlFor={address.id} className="text-sm cursor-pointer">
                            <div className="font-medium">{address.name}</div>
                            <div>{address.street_address}</div>
                            <div>{address.city}, {address.state} {address.postal_code}</div>
                            <div>{address.country}</div>
                            {address.is_default && (
                              <span className="text-xs text-blue-600 font-medium">Default</span>
                            )}
                          </label>
                        </div>
                      ))}
                    </RadioGroup>

                    <div className="mt-4">
                      <Button
                        variant="outline"
                        onClick={handleUseNewAddress}
                        className="w-full"
                      >
                        Use New Address
                      </Button>
                    </div>
                  </div>
                )}

                {(useNewAddress || savedAddresses.length === 0) && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={shippingAddress.name}
                        onChange={(e) => setShippingAddress({...shippingAddress, name: e.target.value})}
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="street">Street Address</Label>
                      <Input
                        id="street"
                        value={shippingAddress.street_address}
                        onChange={(e) => setShippingAddress({...shippingAddress, street_address: e.target.value})}
                        placeholder="Enter your street address"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={shippingAddress.city}
                          onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={shippingAddress.state}
                          onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                          placeholder="State"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="postal_code">Postal Code</Label>
                      <Input
                        id="postal_code"
                        value={shippingAddress.postal_code}
                        onChange={(e) => setShippingAddress({...shippingAddress, postal_code: e.target.value})}
                        placeholder="Postal Code"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="save-address" 
                        checked={saveAddress}
                        onCheckedChange={(checked) => setSaveAddress(checked as boolean)}
                      />
                      <Label htmlFor="save-address" className="text-sm">
                        Save this address for future orders
                      </Label>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600">
                  UPI, Cards, Net Banking, and Wallet payments available.
                  Payment will be processed securely through PhonePe.
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {itemsWithProducts.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                        <img
                          src={item.product?.image}
                          alt={item.product?.name}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium">{item.product?.name}</h3>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-sm font-medium">
                        ₹{(parseFloat(item.product?.price?.replace('₹', '').replace(',', '') || '0') * item.quantity).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}

                  {(customDesigns || []).map((design) => (
                    <div key={design.id} className="flex items-center space-x-3">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                        <img
                          src={design.design_image}
                          alt={design.design_name}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium">{design.design_name}</h3>
                        <p className="text-sm text-gray-500">Custom Design</p>
                      </div>
                      <div className="text-sm font-medium">
                        ₹{design.base_price.toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>₹{parseFloat(calculateSubtotal()).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>Calculated at shipping</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>₹{parseFloat(calculateSubtotal()).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={placeOrder}
                  disabled={isPlacingOrder}
                >
                  {isPlacingOrder ? "Placing Order..." : "Proceed to Payment"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
