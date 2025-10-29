import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClients";
import { Card } from "@/components/ui/card";
import { format, subDays } from "date-fns";

interface Saree {
  id: string;
  name: string;
  type: string;
  price: number;
  quantity: number;
}

interface Sale {
  saree_id: string;
  quantity: number;
  created_at: string;
}

export const RestockSuggestions = ({ sarees }: { sarees: Saree[] }) => {
  const [fastSellingIds, setFastSellingIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchFastSelling = async () => {
      const last30Days = subDays(new Date(), 30).toISOString();

      const { data, error } = await supabase
        .from("sales")
        .select("saree_id, quantity, created_at")
        .gte("created_at", last30Days);

      if (error) {
        console.error(error);
        return;
      }

      // Aggregate sales in last 30 days
      const salesMap: Record<string, number> = {};
      data?.forEach((sale: Sale) => {
        salesMap[sale.saree_id] = (salesMap[sale.saree_id] || 0) + sale.quantity;
      });

      // Mark sarees as fast-selling if sold > 10 in last 30 days
      const fast = Object.keys(salesMap).filter((id) => salesMap[id] > 10);
      setFastSellingIds(fast);
    };

    fetchFastSelling();
  }, []);

  const LOW_STOCK_THRESHOLD = 5;

  // Sarees that need restock
  const restockList = sarees.filter(
    (s) => s.quantity < LOW_STOCK_THRESHOLD || fastSellingIds.includes(s.id)
  );

  if (restockList.length === 0) {
    return (
      <Card className="p-6 shadow-elegant border-primary/10 bg-gradient-to-br from-white to-emerald-50">
        <h2 className="text-2xl font-bold mb-2 text-emerald-600">✅ All Good!</h2>
        <p className="text-muted-foreground">No sarees need urgent restocking right now.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 shadow-elegant border-primary/10 bg-gradient-to-br from-white to-red-50">
      <h2 className="text-2xl font-bold mb-4 text-red-600">⚠️ Restock Suggestions</h2>
      <div className="grid gap-4">
        {restockList.map((s) => (
          <div
            key={s.id}
            className="p-4 border rounded shadow-sm bg-white/80 flex items-center justify-between"
          >
            <div>
              <h3 className="font-semibold text-primary">{s.name}</h3>
              <p className="text-sm text-muted-foreground">{s.type}</p>
              <p className="text-sm">Stock: {s.quantity}</p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                s.quantity < LOW_STOCK_THRESHOLD
                  ? "bg-red-100 text-red-600"
                  : "bg-yellow-100 text-yellow-600"
              }`}
            >
              {s.quantity < LOW_STOCK_THRESHOLD ? "Low Stock" : "Fast Selling"}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};