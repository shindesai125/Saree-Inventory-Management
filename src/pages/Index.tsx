import { RestockSuggestions } from "@/components/analytics/RestockSuggestions";
import { MonthlyTrends } from "@/components/analytics/MonthlyTrends";
import { SalesHistory } from "@/components/analytics/SalesHistory";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClients";
import { AddSareeForm, Saree } from "@/components/AddSareeForm";
import InventoryTable from "@/components/InventoryTable";
import { LowStockAlert } from "@/components/LowStockAlert";
import { SellSareeSection } from "@/components/SellSareeSection";
import { AnalyticsCharts } from "@/components/AnalyticsCharts";
import { ProfitAnalytics } from "@/components/analytics/ProfitAnalytics";
import { Sparkles, Instagram } from "lucide-react";

const Index = () => {
  const [sarees, setSarees] = useState<Saree[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [refreshSales, setRefreshSales] = useState(0); // ✅ NEW

  useEffect(() => {
    const fetchSarees = async () => {
      const { data, error } = await supabase.from("sarees").select("*");
      if (error) {
        setErrorMsg(error.message);
      } else {
        const formatted = (data || []).map((s: any) => ({
          id: String(s.id),
          name: s.name,
          type: s.type,
          price: s.price,
          quantity: s.quantity,
          imageUrl: s.image_url,
          tags: s.tags ? s.tags.split(",") : [],
        }));
        setSarees(formatted);
      }
      setLoading(false);
    };

    fetchSarees();
  }, []);

  const handleAddSaree = async (newSaree: Saree) => {
    const { error } = await supabase.from("sarees").insert([
      {
        name: newSaree.name,
        type: newSaree.type,
        price: newSaree.price,
        quantity: newSaree.quantity,
        image_url: newSaree.imageUrl,
        tags: newSaree.tags.join(","),
      },
    ]);

    if (error) {
      console.error("Supabase insert error:", error.message);
      alert("Failed to add saree. Please try again.");
    } else {
      setSarees([...sarees, newSaree]);
      alert("Saree added successfully!");
    }
  };

  const handleSellSaree = async (
    sareeId: string,
    quantity: number,
    customerName: string,
    sellingPrice: number
  ) => {
    const saree = sarees.find((s) => s.id === sareeId);
    if (!saree) return;

    const newQty = saree.quantity - quantity;
    const margin = sellingPrice - saree.price;

    await supabase
      .from("sarees")
      .update({ quantity: newQty })
      .eq("id", parseInt(sareeId));

    await supabase.from("sales").insert([
      {
        saree_id: sareeId,
        customer_name: customerName,
        quantity,
        selling_price: sellingPrice,
        cost_price: saree.price,
        margin,
        type: saree.type,
      },
    ]);

    setSarees(
      sarees.map((s) =>
        s.id === sareeId ? { ...s, quantity: newQty } : s
      )
    );

    setRefreshSales((prev) => prev + 1); // ✅ Trigger refresh
  };

  return (
    <div className="min-h-screen gradient-mesh">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-primary/10 shadow-elegant">
  <div className="container mx-auto px-4 py-6">
    <div className="flex flex-col items-center justify-center gap-2 animate-fade-in-up">
      {/* Brand Name */}
      <h2 className="text-xl md:text-2xl font-semibold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent tracking-wide">
        “Ruhmrita” by Rutuja and Amruta
      </h2>

      {/* App Icon + Title */}
      <div className="flex items-center justify-center gap-3">
        <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-glow floating">
          <Sparkles className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          Saree Inventory Manager
        </h1>
      </div>
    </div>

    <p className="text-center text-muted-foreground mt-2 text-sm animate-fade-in">
      ✨ Your Elegant Boutique Assistant
    </p>
  </div>
</header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {loading && <p className="text-center text-muted-foreground">Loading inventory...</p>}
        {errorMsg && <p className="text-center text-red-500">Error: {errorMsg}</p>}

        {!loading && !errorMsg && (
          <>
            {sarees.some((s) => s.quantity < 5) && (
              <div className="animate-bounce-in" style={{ animationDelay: "0.1s", animationFillMode: "backwards" }}>
                <LowStockAlert sarees={sarees} />
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="animate-fade-in-up" style={{ animationDelay: "0.2s", animationFillMode: "backwards" }}>
                <AddSareeForm onAddSaree={handleAddSaree} />
              </div>
              <div className="animate-slide-in-right" style={{ animationDelay: "0.3s", animationFillMode: "backwards" }}>
                <SellSareeSection sarees={sarees} onSell={handleSellSaree} />
              </div>
            </div>

            <div className="animate-scale-in" style={{ animationDelay: "0.4s", animationFillMode: "backwards" }}>
              <InventoryTable sarees={sarees} />
            </div>
            {/* Restock Suggestions */}
            <div
            className="animate-fade-in-up"
            style={{ animationDelay: "0.45s", animationFillMode: "backwards" }}
            >
            <RestockSuggestions sarees={sarees} />
            </div>

            {sarees.length > 0 && (
              <div className="animate-fade-in-up" style={{ animationDelay: "0.5s", animationFillMode: "backwards" }}>
                <AnalyticsCharts sarees={sarees} />
              </div>
            )}

            <div className="animate-fade-in-up" style={{ animationDelay: "0.6s", animationFillMode: "backwards" }}>
              <ProfitAnalytics refreshTrigger={refreshSales} />
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/95 backdrop-blur-xl border-t border-primary/10 shadow-elegant mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground text-sm font-medium">
              Powered by AI • Developed with ❤️ by{" "}
              <span className="font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Sai Shinde
              </span>
            </p>
            <div className="flex justify-center gap-6">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center hover-scale hover-glow transition-bounce shadow-elegant">
                <Instagram className="h-6 w-6 text-white" />
              </a>
              <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center hover-scale hover-glow transition-bounce shadow-elegant">
                <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c...Z" />
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