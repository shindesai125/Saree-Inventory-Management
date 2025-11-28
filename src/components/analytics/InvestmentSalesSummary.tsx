// src/components/analytics/InvestmentSalesSummary.tsx
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClients";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  refreshInvestment: number;
  refreshSales: number;
};

export const InvestmentSalesSummary: React.FC<Props> = ({ refreshInvestment, refreshSales }) => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [totalInvestment, setTotalInvestment] = useState<number>(0);
  const [totalSales, setTotalSales] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildRange = () => {
    if (!toDate) return { from: fromDate || null, to: null };
    const d = new Date(toDate);
    d.setDate(d.getDate() + 1); // include whole "to" day
    return { from: fromDate || null, to: d.toISOString() };
  };

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      setError(null);

      try {
        const { from, to } = buildRange();

        // ---- INVESTMENT (purchases) ----
        let purchasesQuery = supabase.from("purchases").select("total_cost, created_at");
        if (from) purchasesQuery = purchasesQuery.gte("created_at", from);
        if (to) purchasesQuery = purchasesQuery.lt("created_at", to);

        const { data: purchasesData, error: purchasesError } = await purchasesQuery;
        if (purchasesError) throw purchasesError;

        const investSum = (purchasesData || []).reduce(
          (acc: number, row: any) => acc + (row.total_cost || 0),
          0
        );

        // ---- SALES ----
        let salesQuery = supabase.from("sales").select("quantity, selling_price, created_at");
        if (from) salesQuery = salesQuery.gte("created_at", from);
        if (to) salesQuery = salesQuery.lt("created_at", to);

        const { data: salesData, error: salesError } = await salesQuery;
        if (salesError) throw salesError;

        const salesSum = (salesData || []).reduce(
          (acc: number, row: any) => acc + (row.quantity || 0) * (row.selling_price || 0),
          0
        );

        setTotalInvestment(investSum);
        setTotalSales(salesSum);
      } catch (err: any) {
        console.error("InvestmentSalesSummary error:", err);
        setError(err?.message || String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [fromDate, toDate, refreshInvestment, refreshSales]);

  return (
    <Card className="p-6 shadow-elegant border-primary/20 bg-white/80">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <h3 className="text-xl font-bold text-pink-600">Investment & Sales Summary</h3>
        <div className="flex gap-3 items-end">
          <div>
            <Label htmlFor="fromDate" className="text-xs text-gray-600">
              From
            </Label>
            <Input
              id="fromDate"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="h-9"
            />
          </div>
          <div>
            <Label htmlFor="toDate" className="text-xs text-gray-600">
              To
            </Label>
            <Input
              id="toDate"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="h-9"
            />
          </div>
        </div>
      </div>

      {loading && <p className="text-sm text-gray-500 mb-2">Calculating totals...</p>}
      {error && <p className="text-sm text-red-500 mb-2">Error: {error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        <div className="rounded-xl border border-pink-100 bg-pink-50/60 p-4">
          <h4 className="text-sm font-medium text-gray-600 mb-1">Total Investment</h4>
          <p className="text-2xl font-bold text-pink-600">
            ₹{totalInvestment.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Sum of all purchases{fromDate || toDate ? " in selected date range" : " (all-time)"}.
          </p>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
          <h4 className="text-sm font-medium text-gray-600 mb-1">Total Sales</h4>
          <p className="text-2xl font-bold text-emerald-600">
            ₹{totalSales.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Sum of quantity × selling price{fromDate || toDate ? " in selected date range" : " (all-time)"}.
          </p>
        </div>
      </div>
    </Card>
  );
};
