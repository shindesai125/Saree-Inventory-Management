import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClients";
import { Card } from "@/components/ui/card";

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

export const SalesHistory = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Filter states
  const [customerFilter, setCustomerFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const fetchSales = async () => {
      setLoading(true);
      let query = supabase.from("sales").select("*");

      if (customerFilter) query = query.ilike("customer_name", `%${customerFilter}%`);
      if (typeFilter) query = query.eq("type", typeFilter);
      if (startDate) query = query.gte("created_at", startDate);
      if (endDate) query = query.lte("created_at", endDate);

      const { data, error } = await query.order("created_at", { ascending: false });
      if (!error && data) setSales(data);
      setLoading(false);
    };
    fetchSales();
  }, [customerFilter, typeFilter, startDate, endDate]);

  if (loading) return <p className="text-center">Loading sales history...</p>;

  return (
    <Card className="p-6 shadow-elegant border-primary/10 bg-gradient-to-br from-white to-accent/5">
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-accent via-primary to-secondary bg-clip-text text-transparent animate-gradient">
        Sales History 📜
      </h2>

      {/* ✅ Filter Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <input
          type="text"
          placeholder="Customer name"
          value={customerFilter}
          onChange={(e) => setCustomerFilter(e.target.value)}
          className="px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">All types</option>
          <option value="Silk">Silk</option>
          <option value="Cotton">Cotton</option>
          <option value="Georgette">Georgette</option>
          <option value="Kanjivaram">Kanjivaram</option>
        </select>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* ✅ Sales Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left border">
          <thead className="bg-primary/10 text-primary">
            <tr>
              <th className="px-4 py-2">Customer</th>
              <th className="px-4 py-2">Saree Type</th>
              <th className="px-4 py-2">Quantity</th>
              <th className="px-4 py-2">Selling Price</th>
              <th className="px-4 py-2">Margin</th>
              <th className="px-4 py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale, index) => (
              <tr key={index} className="border-t">
                <td className="px-4 py-2">{sale.customer_name}</td>
                <td className="px-4 py-2">{sale.type}</td>
                <td className="px-4 py-2">{sale.quantity}</td>
                <td className="px-4 py-2">₹{sale.selling_price}</td>
                <td className="px-4 py-2">₹{(sale.margin * sale.quantity).toFixed(2)}</td>
                <td className="px-4 py-2">{new Date(sale.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};