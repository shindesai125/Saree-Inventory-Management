import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter } from "lucide-react";
import { Saree } from "./AddSareeForm";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface InventoryTableProps {
  sarees: Saree[];
}

export const InventoryTable = ({ sarees }: InventoryTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [stockFilter, setStockFilter] = useState("all");

  const filteredSarees = sarees.filter((saree) => {
    const matchesSearch = saree.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || saree.type === typeFilter;
    const matchesPrice = saree.price >= priceRange[0] && saree.price <= priceRange[1];
    const matchesStock =
      stockFilter === "all" ||
      (stockFilter === "low" && saree.quantity < 5) ||
      (stockFilter === "in-stock" && saree.quantity >= 5);

    return matchesSearch && matchesType && matchesPrice && matchesStock;
  });

  const uniqueTypes = [...new Set(sarees.map((s) => s.type))];

  return (
    <Card className="p-6 shadow-card">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Inventory Dashboard
        </h2>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sarees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 transition-smooth focus:shadow-elegant"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Type
              </Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {uniqueTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}</Label>
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                max={50000}
                step={500}
                className="py-4"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Stock Status</Label>
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Stock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock</SelectItem>
                  <SelectItem value="in-stock">In Stock (&ge; 5)</SelectItem>
                  <SelectItem value="low">Low Stock (&lt; 5)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-semibold">Image</th>
              <th className="text-left py-3 px-4 font-semibold">Name</th>
              <th className="text-left py-3 px-4 font-semibold">Type</th>
              <th className="text-left py-3 px-4 font-semibold">Price</th>
              <th className="text-left py-3 px-4 font-semibold">Quantity</th>
              <th className="text-left py-3 px-4 font-semibold">Tags</th>
            </tr>
          </thead>
          <tbody>
            {filteredSarees.map((saree, index) => (
              <tr
                key={saree.id}
                className="border-b border-border hover:bg-muted/30 transition-smooth animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <td className="py-3 px-4">
                  <img
                    src={saree.imageUrl}
                    alt={saree.name}
                    className="w-16 h-16 object-cover rounded-lg shadow-sm"
                  />
                </td>
                <td className="py-3 px-4 font-medium">{saree.name}</td>
                <td className="py-3 px-4">
                  <Badge variant="secondary" className="bg-secondary/20">
                    {saree.type}
                  </Badge>
                </td>
                <td className="py-3 px-4">₹{saree.price.toLocaleString()}</td>
                <td className="py-3 px-4">
                  <span
                    className={`font-semibold ${
                      saree.quantity < 5 ? "text-destructive" : "text-primary"
                    }`}
                  >
                    {saree.quantity}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-1">
                    {saree.tags.map((tag, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredSarees.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No sarees found matching your filters.
          </div>
        )}
      </div>
    </Card>
  );
};
