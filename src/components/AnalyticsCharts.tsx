import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Saree } from "./AddSareeForm";

interface AnalyticsChartsProps {
  sarees: Saree[];
}

const COLORS = [
  "hsl(340, 65%, 55%)", // Primary
  "hsl(270, 60%, 65%)", // Secondary
  "hsl(45, 90%, 55%)",  // Accent
  "hsl(320, 70%, 60%)", // Pink variant
  "hsl(280, 65%, 70%)", // Purple variant
];

export const AnalyticsCharts = ({ sarees }: AnalyticsChartsProps) => {
  // Data for pie chart (by type)
  const typeData = sarees.reduce((acc, saree) => {
    const existing = acc.find((item) => item.name === saree.type);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: saree.type, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  // Data for bar chart (stock levels)
  const stockData = sarees.map((saree) => ({
    name: saree.name.length > 15 ? saree.name.substring(0, 15) + "..." : saree.name,
    stock: saree.quantity,
    fill: saree.quantity < 5 ? "hsl(0, 75%, 55%)" : "hsl(340, 65%, 55%)",
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6 shadow-card">
        <h3 className="text-xl font-semibold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Sarees by Type
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={typeData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {typeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6 shadow-card">
        <h3 className="text-xl font-semibold mb-4 bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
          Stock Levels
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stockData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fill: "hsl(var(--foreground))" }} />
            <YAxis tick={{ fill: "hsl(var(--foreground))" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="stock" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};
