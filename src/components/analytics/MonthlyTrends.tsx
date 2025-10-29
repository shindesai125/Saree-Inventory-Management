import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClients";
import { Card } from "@/components/ui/card";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { format } from "date-fns";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Sale {
  created_at: string;
  margin: number;
  quantity: number;
}

export const MonthlyTrends = () => {
  const [monthlyData, setMonthlyData] = useState<{ month: string; profit: number }[]>([]);

  useEffect(() => {
    const fetchSales = async () => {
      const { data, error } = await supabase.from("sales").select("created_at, margin, quantity");
      if (error) {
        console.error(error);
        return;
      }

      // Group by month
      const grouped: Record<string, number> = {};
      data?.forEach((sale) => {
        const month = format(new Date(sale.created_at), "MMM yyyy");
        const profit = sale.margin * sale.quantity;
        grouped[month] = (grouped[month] || 0) + profit;
      });

      const formatted = Object.entries(grouped).map(([month, profit]) => ({ month, profit }));
      setMonthlyData(formatted);
    };

    fetchSales();
  }, []);

  const chartData = {
    labels: monthlyData.map((d) => d.month),
    datasets: [
      {
        label: "Profit (₹)",
        data: monthlyData.map((d) => d.profit),
        backgroundColor: "rgba(99, 102, 241, 0.7)", // Indigo
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "Monthly Profit Trends" },
    },
  };

  return (
    <Card className="p-6 shadow-elegant border-primary/10 bg-gradient-to-br from-white to-secondary/5">
      <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-gradient">
        Monthly Trends 📊
      </h2>
      <Bar data={chartData} options={options} />
    </Card>
  );
};