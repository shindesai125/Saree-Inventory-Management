import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";

export interface Saree {
  id: string;
  name: string;
  type: string;
  price: number;
  quantity: number;
  imageUrl: string;
  tags: string[];
}

interface AddSareeFormProps {
  onAddSaree: (saree: Saree) => void;
}

const generateAITags = (name: string, type: string): string[] => {
  const tags: string[] = [];
  
  // Type-based tags
  const typeMap: { [key: string]: string[] } = {
    Silk: ["Traditional", "Wedding", "Premium", "Handloom"],
    Cotton: ["Casual", "Comfortable", "Summer", "Daily Wear"],
    Georgette: ["Party Wear", "Lightweight", "Elegant", "Designer"],
    Chiffon: ["Evening Wear", "Festive", "Soft", "Draping"],
    Kanjivaram: ["Bridal", "South Indian", "Pure Silk", "Heritage"],
  };

  if (typeMap[type]) {
    tags.push(...typeMap[type].slice(0, 2));
  }

  // Name-based tags
  if (name.toLowerCase().includes("bridal")) tags.push("Wedding");
  if (name.toLowerCase().includes("party")) tags.push("Party Wear");
  if (name.toLowerCase().includes("printed")) tags.push("Printed");
  if (name.toLowerCase().includes("embroidered")) tags.push("Embroidered");

  return [...new Set(tags)].slice(0, 4);
};

export const AddSareeForm = ({ onAddSaree }: AddSareeFormProps) => {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [autoGenerateTags, setAutoGenerateTags] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const tags = autoGenerateTags ? generateAITags(name, type) : [];
    
    const newSaree: Saree = {
      id: Date.now().toString(),
      name,
      type,
      price: parseFloat(price),
      quantity: parseInt(quantity),
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400",
      tags,
    };

    onAddSaree(newSaree);
    
    // Reset form
    setName("");
    setType("");
    setPrice("");
    setQuantity("");
    setImageUrl("");
  };

  return (
    <Card className="p-6 shadow-card hover-scale">
      <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        Add New Saree
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Saree Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g., Royal Silk Saree"
            className="transition-smooth focus:shadow-elegant"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Input
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
            placeholder="e.g., Silk, Cotton, Georgette"
            className="transition-smooth focus:shadow-elegant"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Price (₹)</Label>
            <Input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              placeholder="5000"
              className="transition-smooth focus:shadow-elegant"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              placeholder="10"
              className="transition-smooth focus:shadow-elegant"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="imageUrl">Image URL (optional)</Label>
          <Input
            id="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="transition-smooth focus:shadow-elegant"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="autoTags"
            checked={autoGenerateTags}
            onCheckedChange={(checked) => setAutoGenerateTags(checked as boolean)}
          />
          <Label htmlFor="autoTags" className="text-sm cursor-pointer">
            Auto-generate tags with AI ✨
          </Label>
        </div>

        <Button
          type="submit"
          className="w-full gradient-primary hover-glow transition-smooth"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Saree
        </Button>
      </form>
    </Card>
  );
};
