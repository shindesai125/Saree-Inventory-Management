// src/pages/Index.tsx
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClients";
import AddSareeForm, { Saree } from "@/components/AddSareeForm";
import InventoryGrid from "@/components/InventoryGrid";
import { LowStockAlert } from "@/components/LowStockAlert";
import { SellSareeSection } from "@/components/SellSareeSection";
import { RestockSuggestions } from "@/components/analytics/RestockSuggestions";
import { AnalyticsCharts } from "@/components/AnalyticsCharts";
import { ProfitAnalytics } from "@/components/analytics/ProfitAnalytics";
import { InvestmentSalesSummary } from "@/components/analytics/InvestmentSalesSummary";
import { Sparkles } from "lucide-react";

const Index: React.FC = () => {
  const [sarees, setSarees] = useState<Saree[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [refreshSales, setRefreshSales] = useState(0);
  const [refreshInvestment, setRefreshInvestment] = useState(0);
  const [session, setSession] = useState<any>(null);
  const [editingSaree, setEditingSaree] = useState<Saree | null>(null);

  // Auth check
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        window.location.href = "/login";
      } else {
        setSession(data.session);
      }
    });
  }, []);

  useEffect(() => {
    if (!session) return;
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
          imageUrl: s.image_url || "",
          tags: s.tags ? (typeof s.tags === "string" ? s.tags.split(",") : s.tags) : [],
          description: s.description ?? null,
        }));
        setSarees(formatted);
      }
      setLoading(false);
    };
    fetchSarees();
  }, [session]);

  const handleAddSaree = (newSaree: Saree) => {
    setSarees((prev) => [...prev, newSaree]);
    setRefreshInvestment((prev) => prev + 1); // trigger investment summary refresh
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

    await supabase.from("sarees").update({ quantity: newQty }).eq("id", parseInt(sareeId, 10));
    await supabase.from("sales").insert([
      {
        saree_id: sareeId,
        customer_name: customerName,
        quantity,
        selling_price: sellingPrice,
        cost_price: saree.price,
        margin,
        type: saree.type,
        image_url: saree.images?.[0] || saree.imageUrl || null,
      },
    ]);

    setSarees((prev) => prev.map((s) => (s.id === sareeId ? { ...s, quantity: newQty } : s)));
    setRefreshSales((prev) => prev + 1);
  };

  const handleEditRequest = (s: Saree) => {
    setEditingSaree(s);
  };

  const handleUpdateSaree = (updated: Saree) => {
    setSarees((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setEditingSaree(null);
  };

  const handleDeleteSaree = async (id: string) => {
    const confirmed = window.confirm("Delete this saree? This action cannot be undone.");
    if (!confirmed) return;
    try {
      const maybeNum = Number(id);
      const eqArg = Number.isNaN(maybeNum) ? id : maybeNum;
      const { error } = await supabase.from("sarees").delete().eq("id", eqArg);
      if (error) throw error;
      setSarees((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      console.error("Error deleting saree:", err);
      alert("Failed to delete saree: " + (err.message || err));
    }
  };

  if (!session) return <p className="text-center mt-10">Checking authentication...</p>;

  return (
    <div className="min-h-screen gradient-mesh">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-primary/10 shadow-elegant">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex flex-col items-center gap-2 animate-fade-in-up">
            <h2 className="text-xl md:text-2xl font-semibold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent tracking-wide">
              “Ruhmrita” by Rutuja and Amruta
            </h2>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-glow floating">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Saree Inventory Manager
              </h1>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/login";
            }}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {loading && <p className="text-center">Loading inventory...</p>}
        {errorMsg && <p className="text-center text-red-500">Error: {errorMsg}</p>}

        {!loading && !errorMsg && (
          <>
            {sarees.some((s) => s.quantity < 5) && <LowStockAlert sarees={sarees} />}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AddSareeForm onAddSaree={handleAddSaree} />
              <SellSareeSection sarees={sarees} onSell={handleSellSaree} />
            </div>

            <InventoryGrid sarees={sarees} onEdit={handleEditRequest} onDelete={handleDeleteSaree} />

            {/* NEW SUMMARY SECTION */}
            <InvestmentSalesSummary
              refreshInvestment={refreshInvestment}
              refreshSales={refreshSales}
            />

            <RestockSuggestions sarees={sarees} />
            {sarees.length > 0 && <AnalyticsCharts sarees={sarees} />}
            <ProfitAnalytics refreshTrigger={refreshSales} />

            {editingSaree && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                <div className="w-full max-w-2xl">
                  <AddSareeForm
                    initial={editingSaree}
                    onUpdate={handleUpdateSaree}
                    onClose={() => setEditingSaree(null)}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
