// src/pages/Index.tsx
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClients";
import AddSareeForm, { Saree } from "@/components/AddSareeForm";
import InventoryGrid from "@/components/InventoryGrid";
import InventoryTable from "@/components/InventoryTable";
import { LowStockAlert } from "@/components/LowStockAlert";
import { SellSareeSection } from "@/components/SellSareeSection";
import { RestockSuggestions } from "@/components/analytics/RestockSuggestions";
import { AnalyticsCharts } from "@/components/AnalyticsCharts";
import { ProfitAnalytics } from "@/components/analytics/ProfitAnalytics";
import { Sparkles } from "lucide-react";

/**
 * Extend the imported Saree type with images (array of public URLs).
 * We keep the base Saree type from AddSareeForm for fields like id/name/price etc.
 */
type SareeWithImages = Saree & { images?: string[] };

const Index: React.FC = () => {
  const [sarees, setSarees] = useState<SareeWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [refreshSales, setRefreshSales] = useState(0);
  const [session, setSession] = useState<any>(null);
  const [editingSaree, setEditingSaree] = useState<SareeWithImages | null>(null);

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

  // Fetch sarees and their images
  useEffect(() => {
    if (!session) return;
    const fetchSarees = async () => {
      setLoading(true);
      try {
        const { data: sareeRows, error: sareeError } = await supabase.from("sarees").select("*");
        if (sareeError) {
          setErrorMsg(sareeError.message);
          setLoading(false);
          return;
        }

        // Map base sarees
        const sareesData: SareeWithImages[] = (sareeRows || []).map((s: any) => ({
          id: String(s.id),
          name: s.name,
          type: s.type,
          price: s.price,
          quantity: s.quantity,
          imageUrl: s.image_url || "",
          tags: s.tags ? (typeof s.tags === "string" ? s.tags.split(",") : s.tags) : [],
          images: [], // will fill from saree_images
        }));

        // If there are sarees, fetch their images in one query
        const sareeIds = sareesData.map((s) => Number(s.id));
        if (sareeIds.length > 0) {
          const { data: imagesRows, error: imagesError } = await supabase
            .from("saree_images")
            .select("saree_id, image_url")
            .in("saree_id", sareeIds);

          if (imagesError) {
            console.warn("Failed to fetch saree images:", imagesError);
            // fallback: put single imageUrl into images
            sareesData.forEach((s) => {
              s.images = s.imageUrl ? [s.imageUrl] : [];
            });
          } else {
            // Group images by saree_id
            const byId: Record<string, string[]> = {};
            (imagesRows || []).forEach((r: any) => {
              const sid = String(r.saree_id);
              byId[sid] = byId[sid] || [];
              byId[sid].push(r.image_url);
            });
            // Attach images; if none found use main imageUrl if available
            sareesData.forEach((s) => {
              s.images = byId[s.id] && byId[s.id].length > 0 ? byId[s.id] : s.imageUrl ? [s.imageUrl] : [];
            });
          }
        }

        setSarees(sareesData);
      } catch (err: any) {
        console.error("Error fetching sarees:", err);
        setErrorMsg(err.message || "Failed to fetch sarees");
      } finally {
        setLoading(false);
      }
    };
    fetchSarees();
  }, [session]);

  // Called after AddSareeForm inserted a new saree (created row returned)
  const handleAddSaree = (newSaree: SareeWithImages) => {
    // ensure images array exists
    const withImages: SareeWithImages = { ...newSaree, images: newSaree.images ?? (newSaree.imageUrl ? [newSaree.imageUrl] : []) };
    setSarees((prev) => [...prev, withImages]);
  };

  // Sell handler now accepts selectedImageUrl and records it in sales.image_url
  const handleSellSaree = async (
    sareeId: string,
    quantity: number,
    customerName: string,
    sellingPrice: number,
    selectedImageUrl?: string | null
  ) => {
    const saree = sarees.find((s) => s.id === sareeId);
    if (!saree) return;

    const newQty = saree.quantity - quantity;
    const margin = sellingPrice - saree.price;

    try {
      // Update quantity
      const maybeNum = Number(sareeId);
      const eqArg = Number.isNaN(maybeNum) ? sareeId : maybeNum;
      const { error: updateError } = await supabase.from("sarees").update({ quantity: newQty }).eq("id", eqArg);
      if (updateError) throw updateError;

      // Insert sale, including image_url
      const { error: insertError } = await supabase.from("sales").insert([
        {
          saree_id: sareeId,
          customer_name: customerName,
          quantity,
          selling_price: sellingPrice,
          cost_price: saree.price,
          margin,
          type: saree.type,
          image_url: selectedImageUrl ?? null,
        },
      ]);
      if (insertError) throw insertError;

      // Update local UI
      setSarees((prev) => prev.map((s) => (s.id === sareeId ? { ...s, quantity: newQty } : s)));
      setRefreshSales((prev) => prev + 1);
    } catch (err: any) {
      console.error("Error during selling saree:", err);
      alert("Failed to record sale: " + (err.message || err));
    }
  };

  const handleEditRequest = (s: SareeWithImages) => {
    setEditingSaree(s);
  };

  const handleUpdateSaree = (updated: Saree) => {
    // Ensure id is string and preserve images if updated doesn't include images
    const updatedId = String(updated.id);
    setSarees((prev) =>
      prev.map((p) => {
        if (p.id !== updatedId) return p;
        // preserve images from previous state unless updated has them
        const images = (updated as any).images ?? p.images ?? (p.imageUrl ? [p.imageUrl] : []);
        const tags = updated.tags ?? p.tags ?? [];
        return {
          ...p,
          id: updatedId,
          name: updated.name,
          type: updated.type,
          price: updated.price,
          quantity: updated.quantity,
          imageUrl: (updated as any).imageUrl ?? p.imageUrl,
          tags,
          images,
        };
      })
    );
    setEditingSaree(null);
  };

  const handleDeleteSaree = async (id: string) => {
    const confirmed = window.confirm("Delete this saree? This action cannot be undone.");
    if (!confirmed) return;
    try {
      // try numeric id first if possible
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

            {/* Inventory grid with edit + delete */}
            <InventoryGrid sarees={sarees} onEdit={handleEditRequest} onDelete={handleDeleteSaree} />

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
