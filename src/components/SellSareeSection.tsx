import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShoppingBag } from "lucide-react";
import { Saree } from "./AddSareeForm";
import { toast } from "sonner";

interface SellSareeSectionProps {
  sarees: Saree[];
  onSell: (
    sareeId: string,
    quantity: number,
    customerName: string,
    sellingPrice: number
  ) => void;
}

export const SellSareeSection = ({ sarees, onSell }: SellSareeSectionProps) => {
  const [selectedSareeId, setSelectedSareeId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [customerName, setCustomerName] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");

  const handleSell = () => {
    if (!selectedSareeId) {
      toast.error("Please select a saree");
      return;
    }

    const saree = sarees.find((s) => s.id === selectedSareeId);
    const sellQuantity = parseInt(quantity);
    const price = parseFloat(sellingPrice);

    if (!saree) return;

    if (sellQuantity > saree.quantity) {
      toast.error(`Only ${saree.quantity} items available!`);
      return;
    }

    if (sellQuantity < 1) {
      toast.error("Quantity must be at least 1");
      return;
    }

    if (!customerName.trim()) {
      toast.error("Please enter customer name");
      return;
    }

    if (isNaN(price) || price <= 0) {
      toast.error("Please enter a valid selling price");
      return;
    }

    onSell(selectedSareeId, sellQuantity, customerName.trim(), price);

    toast.success(`Sold ${sellQuantity} ${saree.name}(s) to ${customerName}!`, {
      description: `Remaining stock: ${saree.quantity - sellQuantity}`,
    });

    setQuantity("1");
    setSelectedSareeId("");
    setCustomerName("");
    setSellingPrice("");
  };

  return (
    <Card className="p-6 shadow-elegant hover-lift border-primary/20 bg-gradient-to-br from-white to-accent/5">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-3xl animate-pulse-glow">💰</span>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent animate-gradient">
          Sell Saree
        </h2>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="saree-select">Select Saree</Label>
          <Select value={selectedSareeId} onValueChange={setSelectedSareeId}>
            <SelectTrigger id="saree-select">
              <SelectValue placeholder="Choose a saree" />
            </SelectTrigger>
            <SelectContent>
              {sarees.map((saree) => (
                <SelectItem key={saree.id} value={saree.id}>
                  {saree.name} - ₹{saree.price.toLocaleString()} (Stock: {saree.quantity})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity to Sell</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="transition-smooth focus:shadow-elegant"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerName">Customer Name</Label>
          <Input
            id="customerName"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="e.g., Priya Sharma"
            className="transition-smooth focus:shadow-elegant"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sellingPrice">Selling Price (₹)</Label>
          <Input
            id="sellingPrice"
            type="number"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
            placeholder="e.g., 6000"
            className="transition-smooth focus:shadow-elegant"
          />
        </div>

        <Button
          onClick={handleSell}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg py-6 hover-scale hover-glow transition-bounce animate-gradient shimmer shadow-elegant"
        >
          <ShoppingBag className="mr-2 h-5 w-5" />
          Sell Saree 🎉
        </Button>
      </div>
    </Card>
  );
};