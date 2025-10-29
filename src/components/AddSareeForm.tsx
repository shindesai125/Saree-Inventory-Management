// ...imports remain unchanged
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import { supabase } from "@/lib/supabaseClients";

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
  const typeMap: { [key: string]: string[] } = {
    Silk: ["Traditional", "Wedding", "Premium", "Handloom"],
    Cotton: ["Casual", "Comfortable", "Summer", "Daily Wear"],
    Georgette: ["Party Wear", "Lightweight", "Elegant", "Designer"],
    Chiffon: ["Evening Wear", "Festive", "Soft", "Draping"],
    Kanjivaram: ["Bridal", "South Indian", "Pure Silk", "Heritage"],
  };

  if (typeMap[type]) tags.push(...typeMap[type].slice(0, 2));
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
  const [file, setFile] = useState<File | null>(null);
  const [autoGenerateTags, setAutoGenerateTags] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let imageUrl = "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400";

    if (file) {
      const fileName = `${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("saree-images")
        .upload(fileName, file);

      if (uploadError) {
        console.error("Image upload error:", uploadError.message);
        alert("Failed to upload image");
        setLoading(false);
        return;
      }

      const { data } = supabase.storage
        .from("saree-images")
        .getPublicUrl(fileName);

      imageUrl = data.publicUrl;
    }

    const tags = autoGenerateTags ? generateAITags(name, type) : [];

    const newSaree: Saree = {
      id: Date.now().toString(),
      name,
      type,
      price: parseFloat(price),
      quantity: parseInt(quantity),
      imageUrl,
      tags,
    };

    onAddSaree(newSaree);

    setName("");
    setType("");
    setPrice("");
    setQuantity("");
    setFile(null);
    setLoading(false);
  };

  return (
    <Card className="p-6 shadow-elegant hover-lift border-primary/20 bg-gradient-to-br from-white to-primary/5">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-3xl animate-pulse-glow">💎</span>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-gradient">
          Add New Saree
        </h2>
      </div>
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
          <Label htmlFor="file">Upload Image (optional)</Label>
          <Input
            id="file"
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="transition-smooth focus:shadow-elegant"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="autoTags"
            checked={autoGenerateTags}
            onCheckedChange={(checked) =>
              setAutoGenerateTags(checked as boolean)
            }
          />
          <Label htmlFor="autoTags" className="text-sm cursor-pointer">
            Auto-generate tags with AI ✨
          </Label>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full gradient-primary text-white font-bold text-lg py-6 hover-scale hover-glow transition-bounce animate-gradient shimmer shadow-elegant"
        >
          <Plus className="mr-2 h-5 w-5" />
          {loading ? "Adding..." : "Add Saree ✨"}
        </Button>
      </form>
    </Card>
  );
};