import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClients";
import { Card } from "@/components/ui/card";
import { SalesHistory } from "@/components/analytics/SalesHistory";
import { MonthlyTrends } from "@/components/analytics/MonthlyTrends"; // ✅ Import Monthly Trends

interface Sale {
  saree_id: string;
  customer_name: string;
  quantity: number;
  selling_price: number;
  cost_price: number;
  margin: number;
  type: string;
  created_at: string;
}

interface ProfitAnalyticsProps {
  refreshTrigger: number;
}

export const ProfitAnalytics = ({ refreshTrigger }: ProfitAnalyticsProps) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSales = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("sales").select("*");
      if (!error && data) setSales(data);
      setLoading(false);
    };
    fetchSales();
  }, [refreshTrigger]);

  const profitByType = sales.reduce((acc, sale) => {
    const profit = sale.margin * sale.quantity;
    acc[sale.type] = (acc[sale.type] || 0) + profit;
    return acc;
  }, {} as Record<string, number>);

  const totalProfit = sales.reduce(
    (sum, sale) => sum + sale.margin * sale.quantity,
    0
  );

  if (loading) return <p className="text-center">Loading profit data...</p>;

  return (
    <>
      {/* ✅ Profit Analytics */}
      <Card className="p-6 shadow-elegant border-primary/10 bg-gradient-to-br from-white to-secondary/5">
        <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-secondary via-primary to-accent bg-clip-text text-transparent animate-gradient">
          Profit Analytics 💹
        </h2>

        <div className="grid gap-4">
          {Object.entries(profitByType).map(([type, profit]) => (
            <div key={type} className="p-4 border rounded shadow-sm bg-white/80">
              <h3 className="font-semibold text-primary">{type}</h3>
              <p className="text-muted-foreground">Profit: ₹{profit.toFixed(2)}</p>
            </div>
          ))}

          <div className="p-4 border rounded shadow bg-primary/10">
            <h3 className="font-bold text-lg">Total Profit</h3>
            <p className="text-accent font-semibold text-xl">₹{totalProfit.toFixed(2)}</p>
          </div>
        </div>
      </Card>

      {/* ✅ Monthly Trends Section */}
      <div
        className="animate-fade-in-up mt-8"
        style={{ animationDelay: "0.6s", animationFillMode: "backwards" }}
      >
        <MonthlyTrends />
      </div>

      {/* ✅ Sales History Section */}
      <div
        className="animate-fade-in-up mt-8"
        style={{ animationDelay: "0.7s", animationFillMode: "backwards" }}
      >
        <SalesHistory />
      </div>
    </>
  );
};