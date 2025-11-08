// src/components/SellSareeSection.tsx
import React, { useEffect, useMemo, useState } from "react";
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

const NO_IMAGE_VALUE = "__NO_IMAGE__"; // sentinel (must NOT be empty string)

/**
 * Props: sarees have images?: string[]
 * onSell signature includes selectedImageUrl (string | null)
 */
interface SellSareeSectionProps {
  sarees: (Saree & { images?: string[] })[];
  onSell: (
    sareeId: string,
    quantity: number,
    customerName: string,
    sellingPrice: number,
    selectedImageUrl?: string | null
  ) => void;
}

export const SellSareeSection: React.FC<SellSareeSectionProps> = ({ sarees, onSell }) => {
  const [selectedSareeId, setSelectedSareeId] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("1");
  const [customerName, setCustomerName] = useState<string>("");
  const [sellingPrice, setSellingPrice] = useState<string>("");
  // we store selectedImageValue as string (either real URL or sentinel NO_IMAGE_VALUE)
  const [selectedImageValue, setSelectedImageValue] = useState<string | null>(null);
  const [carouselIndexMap, setCarouselIndexMap] = useState<Record<string, number>>({});

  const currentSaree = useMemo(() => sarees.find((s) => s.id === selectedSareeId), [sarees, selectedSareeId]);
  const currentImages = currentSaree?.images ?? (currentSaree?.imageUrl ? [currentSaree.imageUrl] : []);

  // when saree changes, default select first image (or NO_IMAGE_VALUE if none)
  useEffect(() => {
    if (!selectedSareeId) {
      setSelectedImageValue(null);
      return;
    }
    const imgs = currentImages;
    if (imgs && imgs.length > 0) {
      setSelectedImageValue(imgs[0]);
    } else {
      setSelectedImageValue(NO_IMAGE_VALUE);
    }

    setCarouselIndexMap((prev) => {
      if (prev[selectedSareeId] !== undefined) return prev;
      return { ...prev, [selectedSareeId]: 0 };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSareeId, currentImages.join?.(",")]);

  // sync selectedImageValue with carousel index
  useEffect(() => {
    if (!selectedSareeId) return;
    const idx = carouselIndexMap[selectedSareeId] ?? 0;
    const imgs = currentImages;
    if (imgs && imgs.length > 0) {
      setSelectedImageValue(imgs[idx]);
    } else {
      setSelectedImageValue(NO_IMAGE_VALUE);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carouselIndexMap, selectedSareeId, currentImages.join?.(",")]);

  const handlePrev = () => {
    if (!selectedSareeId) return;
    setCarouselIndexMap((prev) => {
      const idx = prev[selectedSareeId] ?? 0;
      const imgs = currentImages;
      if (!imgs || imgs.length <= 1) return prev;
      const next = (idx - 1 + imgs.length) % imgs.length;
      return { ...prev, [selectedSareeId]: next };
    });
  };

  const handleNext = () => {
    if (!selectedSareeId) return;
    setCarouselIndexMap((prev) => {
      const idx = prev[selectedSareeId] ?? 0;
      const imgs = currentImages;
      if (!imgs || imgs.length <= 1) return prev;
      const next = (idx + 1) % imgs.length;
      return { ...prev, [selectedSareeId]: next };
    });
  };

  const handleSellClick = () => {
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

    // convert sentinel to real null
    const selectedImageUrl = selectedImageValue === NO_IMAGE_VALUE || selectedImageValue === null ? null : selectedImageValue;

    onSell(selectedSareeId, sellQuantity, customerName.trim(), price, selectedImageUrl);

    toast.success(`Sold ${sellQuantity} ${saree.name}(s) to ${customerName}!`, {
      description: `Remaining stock: ${saree.quantity - sellQuantity}`,
    });

    setQuantity("1");
    setSelectedSareeId("");
    setCustomerName("");
    setSellingPrice("");
    setSelectedImageValue(null);
  };

  const renderCarousel = () => {
    if (!selectedSareeId) return <div className="text-sm text-gray-400">Select a saree to preview images</div>;
    if (!currentImages || currentImages.length === 0) return <div className="text-sm text-gray-400">No images uploaded for this saree</div>;
    const idx = carouselIndexMap[selectedSareeId] ?? 0;
    const url = currentImages[idx];
    return (
      <div className="w-full flex items-center gap-3">
        <button type="button" onClick={handlePrev} className="px-2 py-1 rounded border bg-white/80 hover:bg-white">◀</button>
        <div className="w-28 h-28 rounded overflow-hidden border bg-white">
          <img src={url} alt="saree preview" className="w-full h-full object-cover" />
        </div>
        <button type="button" onClick={handleNext} className="px-2 py-1 rounded border bg-white/80 hover:bg-white">▶</button>
        <div className="ml-3">
          <div className="text-xs text-gray-500">Image {idx + 1} / {currentImages.length}</div>
        </div>
      </div>
    );
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
          <Label>Selected Images</Label>
          <div>{renderCarousel()}</div>

          <div className="mt-2">
            <Label>Choose image/color to record with this sale</Label>

            <Select
              value={selectedImageValue ?? ""}
              onValueChange={(v) => setSelectedImageValue(v === "" ? null : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose image (optional)" />
              </SelectTrigger>
              <SelectContent>
                {/* sentinel value used — NOT an empty string */}
                <SelectItem key="no-image" value={NO_IMAGE_VALUE}>
                  No image
                </SelectItem>

                {currentImages.map((img) => (
                  <SelectItem key={img} value={img}>
                    {img.split("/").slice(-1)[0]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity to Sell</Label>
          <Input id="quantity" type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="transition-smooth focus:shadow-elegant" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerName">Customer Name</Label>
          <Input id="customerName" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="e.g., Priya Sharma" className="transition-smooth focus:shadow-elegant" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sellingPrice">Selling Price (₹)</Label>
          <Input id="sellingPrice" type="number" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} placeholder="e.g., 6000" className="transition-smooth focus:shadow-elegant" />
        </div>

        <Button onClick={handleSellClick} className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg py-6 hover-scale hover-glow transition-bounce animate-gradient shimmer shadow-elegant">
          <ShoppingBag className="mr-2 h-5 w-5" />
          Sell Saree 🎉
        </Button>
      </div>
    </Card>
  );
};

export default SellSareeSection;
