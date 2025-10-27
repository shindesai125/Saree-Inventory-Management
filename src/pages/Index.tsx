import { useState } from "react";
import { AddSareeForm, Saree } from "@/components/AddSareeForm";
import { InventoryTable } from "@/components/InventoryTable";
import { LowStockAlert } from "@/components/LowStockAlert";
import { SellSareeSection } from "@/components/SellSareeSection";
import { AnalyticsCharts } from "@/components/AnalyticsCharts";
import { Sparkles, Instagram } from "lucide-react";

const Index = () => {
  const [sarees, setSarees] = useState<Saree[]>([
    {
      id: "1",
      name: "Royal Kanjivaram Silk",
      type: "Silk",
      price: 12500,
      quantity: 3,
      imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400",
      tags: ["Traditional", "Wedding", "Bridal", "South Indian"],
    },
    {
      id: "2",
      name: "Cotton Comfort Saree",
      type: "Cotton",
      price: 2500,
      quantity: 15,
      imageUrl: "https://images.unsplash.com/photo-1583391733981-5ade7eea8c9c?w=400",
      tags: ["Casual", "Comfortable", "Summer", "Daily Wear"],
    },
    {
      id: "3",
      name: "Designer Georgette Elegance",
      type: "Georgette",
      price: 8500,
      quantity: 7,
      imageUrl: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400",
      tags: ["Party Wear", "Lightweight", "Elegant", "Designer"],
    },
  ]);

  const handleAddSaree = (newSaree: Saree) => {
    setSarees([...sarees, newSaree]);
  };

  const handleSellSaree = (sareeId: string, quantity: number) => {
    setSarees(
      sarees.map((saree) =>
        saree.id === sareeId
          ? { ...saree, quantity: saree.quantity - quantity }
          : saree
      )
    );
  };

  return (
    <div className="min-h-screen gradient-elegant">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border shadow-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Saree Inventory Manager
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Low Stock Alert */}
        {sarees.some((s) => s.quantity < 5) && (
          <div className="animate-fade-in">
            <LowStockAlert sarees={sarees} />
          </div>
        )}

        {/* Add Saree and Sell Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="animate-slide-in">
            <AddSareeForm onAddSaree={handleAddSaree} />
          </div>
          <div className="animate-slide-in" style={{ animationDelay: "0.1s" }}>
            <SellSareeSection sarees={sarees} onSell={handleSellSaree} />
          </div>
        </div>

        {/* Inventory Table */}
        <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <InventoryTable sarees={sarees} />
        </div>

        {/* Analytics */}
        {sarees.length > 0 && (
          <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <AnalyticsCharts sarees={sarees} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Powered by AI • Developed with ❤️ by{" "}
              <span className="font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Sai Shinde
              </span>
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center hover-scale hover-glow transition-smooth"
              >
                <Instagram className="h-5 w-5 text-white" />
              </a>
              <a
                href="https://wa.me/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center hover-scale hover-glow transition-smooth"
              >
                <svg
                  className="h-5 w-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
