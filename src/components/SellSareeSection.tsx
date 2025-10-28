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
  onSell: (sareeId: string, quantity: number) => void;
}

export const SellSareeSection = ({ sarees, onSell }: SellSareeSectionProps) => {
  const [selectedSareeId, setSelectedSareeId] = useState("");
  const [quantity, setQuantity] = useState("1");

  const handleSell = () => {
    if (!selectedSareeId) {
      toast.error("Please select a saree");
      return;
    }

    const saree = sarees.find((s) => s.id === selectedSareeId);
    const sellQuantity = parseInt(quantity);

    if (!saree) return;

    if (sellQuantity > saree.quantity) {
      toast.error(`Only ${saree.quantity} items available!`);
      return;
    }

    if (sellQuantity < 1) {
      toast.error("Quantity must be at least 1");
      return;
    }

    onSell(selectedSareeId, sellQuantity);
    toast.success(`Successfully sold ${sellQuantity} ${saree.name}(s)!`, {
      description: `Remaining stock: ${saree.quantity - sellQuantity}`,
    });

    setQuantity("1");
    setSelectedSareeId("");
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
