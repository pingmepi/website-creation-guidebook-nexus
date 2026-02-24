
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CreditCard, Smartphone, Building, Wallet } from "lucide-react";

interface PaymentMethodSelectorProps {
  selectedMethod: string;
  onMethodChange: (method: string) => void;
}

const PaymentMethodSelector = ({ selectedMethod, onMethodChange }: PaymentMethodSelectorProps) => {
  const paymentMethods = [
    {
      id: "UPI",
      name: "UPI",
      description: "Pay using UPI apps like GPay, Paytm, or other UPI apps",
      icon: <Smartphone className="h-5 w-5" />
    },
    {
      id: "CARD",
      name: "Credit/Debit Card",
      description: "Visa, Mastercard, RuPay cards",
      icon: <CreditCard className="h-5 w-5" />
    },
    {
      id: "NB",
      name: "Net Banking",
      description: "Pay directly from your bank account",
      icon: <Building className="h-5 w-5" />
    },
    {
      id: "WALLET",
      name: "Wallets",
      description: "PayTM, Mobikwik, Freecharge",
      icon: <Wallet className="h-5 w-5" />
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Payment Method</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedMethod} onValueChange={onMethodChange}>
          {paymentMethods.map((method) => (
            <div key={method.id} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-gray-50">
              <RadioGroupItem value={method.id} id={method.id} className="mt-1" />
              <div className="flex-1">
                <Label htmlFor={method.id} className="flex items-center gap-2 cursor-pointer">
                  {method.icon}
                  <span className="font-medium">{method.name}</span>
                </Label>
                <p className="text-sm text-gray-600 mt-1">{method.description}</p>
              </div>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default PaymentMethodSelector;
