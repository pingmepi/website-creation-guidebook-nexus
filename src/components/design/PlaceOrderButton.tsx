import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CreditCard, Loader2 } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";
import { supabase } from "@/integrations/supabase/client";
import { Answer } from "./QuestionFlow";
import { sanitizeAddress, sanitizeText } from "@/utils/sanitize";
import { trackEvent } from "@/lib/trackEvent";
import { ORDER_STATUS } from "@/lib/orderStatus";

interface PlaceOrderButtonProps {
  designImage?: string;
  tshirtColor: string;
  selectedSize?: string;
  designName: string;
  answers: Answer[];
  onSaveDesign?: () => void;
}

interface ManualOrderForm {
  name: string;
  email: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  notes: string;
}

const DEFAULT_PRICE_INR = 2499;

type ErrorLike = {
  message?: string;
  details?: string;
  hint?: string;
  code?: string;
  status?: number;
  name?: string;
  error?: unknown;
};

type ParsedError = {
  message: string;
  details?: string;
  code?: string;
  raw: string;
};

const safeSerializeError = (error: unknown): string => {
  if (typeof error === "string") return error;

  if (error instanceof Error) {
    try {
      const serializable = Object.fromEntries(
        Object.getOwnPropertyNames(error).map((key) => [key, (error as any)[key]]),
      );
      return JSON.stringify(serializable);
    } catch {
      return error.message || "unknown_error";
    }
  }

  if (error && typeof error === "object") {
    try {
      return JSON.stringify(error);
    } catch {
      return "[unserializable_error_object]";
    }
  }

  return "unknown_error";
};

const parseError = (error: unknown): ParsedError => {
  if (error instanceof Error) {
    return {
      message: error.message || "unknown_error",
      details: undefined as string | undefined,
      code: undefined as string | undefined,
      raw: safeSerializeError(error),
    };
  }

  if (error && typeof error === "object") {
    const maybeError = error as ErrorLike;
    if (maybeError.error) {
      const nestedError = parseError(maybeError.error);
      return {
        ...nestedError,
        raw: safeSerializeError(error),
      };
    }

    const message =
      maybeError.message ||
      maybeError.details ||
      maybeError.hint ||
      (maybeError.code ? `error_code_${maybeError.code}` : "") ||
      "unknown_error";

    return {
      message,
      details: maybeError.details || maybeError.hint,
      code: maybeError.code,
      raw: safeSerializeError(error),
    };
  }

  if (typeof error === "string") {
    return {
      message: error || "unknown_error",
      details: undefined as string | undefined,
      code: undefined as string | undefined,
      raw: safeSerializeError(error),
    };
  }

  return {
    message: "unknown_error",
    details: undefined as string | undefined,
    code: undefined as string | undefined,
    raw: safeSerializeError(error),
  };
};

const PlaceOrderButton = ({
  designImage,
  tshirtColor,
  selectedSize = "M",
  designName,
  answers,
  onSaveDesign,
}: PlaceOrderButtonProps) => {
  const { isAuthenticated, user } = useUser();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [form, setForm] = useState<ManualOrderForm>({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    streetAddress: "",
    city: "",
    state: "",
    postalCode: "",
    notes: "",
  });

  const canSubmit = useMemo(
    () =>
      Boolean(
        designImage &&
        form.name.trim() &&
        form.email.trim() &&
        form.phone.trim() &&
        form.streetAddress.trim() &&
        form.city.trim() &&
        form.state.trim() &&
        form.postalCode.trim(),
      ),
    [designImage, form],
  );

  const setField = (field: keyof ManualOrderForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): string | null => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneDigits = form.phone.replace(/\D/g, "");
    const postalClean = form.postalCode.replace(/\s/g, "");

    if (!emailPattern.test(form.email)) return "Please enter a valid email.";
    if (phoneDigits.length < 10) return "Please enter a valid phone number.";
    if (postalClean.length < 5) return "Please enter a valid postal code.";
    return null;
  };

  const openModal = () => {
    trackEvent("place_order_cta_clicked", {
      design_name: designName,
      size: selectedSize,
      color: tshirtColor,
      has_design_image: Boolean(designImage),
    });

    if (!designImage) {
      toast.error("Please create a design first");
      return;
    }

    if (!isAuthenticated || !user?.id) {
      toast.error("Please login to place an order");
      return;
    }

    setForm((prev) => ({
      ...prev,
      name: prev.name || user.name || "",
      email: prev.email || user.email || "",
    }));
    setIsModalOpen(true);
    trackEvent("order_modal_opened");
  };

  const handleSubmitManualOrder = async () => {
    trackEvent("order_submitted", {
      has_notes: Boolean(form.notes.trim()),
    });

    const validationError = validateForm();
    if (validationError) {
      trackEvent("order_form_validation_failed", {
        field: validationError,
      });
      toast.error(validationError);
      return;
    }

    if (!user?.id || !designImage) {
      trackEvent("order_failed", { error_message: "missing_user_or_design" });
      toast.error("Unable to place order. Please try again.");
      return;
    }

    setIsProcessing(true);

    try {
      if (onSaveDesign) {
        await onSaveDesign();
      }

      const safeName = sanitizeText(form.name);
      const safeEmail = sanitizeText(form.email);
      const safePhone = sanitizeText(form.phone).replace(/[^+\d\s()-]/g, "");
      const safeNotes = sanitizeText(form.notes);

      const safeAddress = sanitizeAddress({
        name: safeName,
        street_address: form.streetAddress,
        city: form.city,
        state: form.state,
        postal_code: form.postalCode,
        country: "India",
      });

      const { data: customDesign, error: customDesignError } = await supabase
        .from("custom_designs")
        .insert({
          user_id: user.id,
          design_image: designImage,
          answers: JSON.stringify(answers) as any,
          base_price: DEFAULT_PRICE_INR,
          design_data: JSON.stringify({
            source: "manual_order_modal",
            tshirt_color: tshirtColor,
            selected_size: selectedSize,
          }) as any,
          design_name: sanitizeText(designName || "Custom Design"),
          theme_name:
            sanitizeText(
              answers.find((a) => a.question?.toLowerCase().includes("theme"))?.answer || "Custom",
            ) || "Custom",
          tshirt_color: sanitizeText(tshirtColor),
        } as any)
        .select("id")
        .single();

      if (customDesignError || !customDesign) {
        throw customDesignError || new Error("Failed to store custom design");
      }

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total_amount: DEFAULT_PRICE_INR,
          shipping_address: {
            ...safeAddress,
            email: safeEmail,
            phone: safePhone,
          } as any,
          status: ORDER_STATUS.PENDING,
          payment_method: "manual_email_collection",
          order_number: "",
          notes: safeNotes || null,
        } as any)
        .select("id")
        .single();

      if (orderError || !order) {
        throw orderError || new Error("Failed to create order");
      }

      const { error: itemError } = await supabase
        .from("order_items")
        .insert({
          order_id: (order as any).id,
          product_id: "custom-design",
          custom_design_id: (customDesign as any).id,
          quantity: 1,
          unit_price: DEFAULT_PRICE_INR,
          total_price: DEFAULT_PRICE_INR,
          design_data: {
            selected_size: sanitizeText(selectedSize),
            tshirt_color: sanitizeText(tshirtColor),
          } as any,
        } as any);

      if (itemError) {
        throw itemError;
      }

      trackEvent("order_created", {
        order_id: (order as any).id,
        price_inr: DEFAULT_PRICE_INR,
      });

      toast.success("Order request submitted. We'll contact you by email for payment.");
      setIsModalOpen(false);
      router.push("/dashboard/orders");
    } catch (error) {
      const parsedError = parseError(error);
      trackEvent("order_failed", {
        error_message: parsedError.message,
        code: parsedError.code || undefined,
      });
      console.error(
        `Error placing manual order: message=${parsedError.message}; details=${parsedError.details || "none"}; code=${parsedError.code || "none"}; raw=${parsedError.raw}`,
      );
      toast.error("Failed to submit order request. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="flex gap-3">
        <Button
          onClick={openModal}
          disabled={!designImage}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
          size="lg"
        >
          <CreditCard className="h-5 w-5" />
          Place Order
        </Button>
      </div>

      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            trackEvent("order_modal_closed", {
              had_input: canSubmit,
            });
          }
          setIsModalOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Place Your Order</DialogTitle>
            <DialogDescription>
              Submit your delivery details. We will email you next steps to complete payment.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="order-name">Full Name</Label>
              <Input
                id="order-name"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="Your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order-email">Email</Label>
              <Input
                id="order-email"
                type="email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order-phone">Phone</Label>
              <Input
                id="order-phone"
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order-postal">Postal Code</Label>
              <Input
                id="order-postal"
                value={form.postalCode}
                onChange={(e) => setField("postalCode", e.target.value)}
                placeholder="560001"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="order-street">Street Address</Label>
            <Input
              id="order-street"
              value={form.streetAddress}
              onChange={(e) => setField("streetAddress", e.target.value)}
              placeholder="House / Street / Area"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="order-city">City</Label>
              <Input
                id="order-city"
                value={form.city}
                onChange={(e) => setField("city", e.target.value)}
                placeholder="City"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order-state">State</Label>
              <Input
                id="order-state"
                value={form.state}
                onChange={(e) => setField("state", e.target.value)}
                placeholder="State"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="order-notes">Notes (Optional)</Label>
            <Textarea
              id="order-notes"
              value={form.notes}
              onChange={(e) => setField("notes", e.target.value)}
              placeholder="Any customization notes or delivery preferences"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitManualOrder} disabled={isProcessing || !canSubmit}>
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Order Request"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PlaceOrderButton;
