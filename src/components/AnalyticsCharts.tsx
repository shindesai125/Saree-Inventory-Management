import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Saree } from "./AddSareeForm";

interface AnalyticsChartsProps {
  sarees: Saree[];
}

const COLORS = [
  "hsl(335, 85%, 60%)", // Primary - Vibrant Rose Pink
  "hsl(320, 75%, 70%)", // Secondary - Soft Pink
  "hsl(350, 80%, 65%)", // Accent - Coral Pink
  "hsl(340, 80%, 65%)", // Pink variant
  "hsl(330, 70%, 75%)", // Light Pink variant
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
    fill: saree.quantity < 5 ? "hsl(0, 85%, 60%)" : "hsl(335, 85%, 60%)",
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6 shadow-elegant hover-lift border-primary/20 bg-gradient-to-br from-white to-primary/5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl animate-pulse-glow">📈</span>
          <h3 className="text-xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-gradient">
            Sarees by Type
          </h3>
        </div>
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

      <Card className="p-6 shadow-elegant hover-lift border-primary/20 bg-gradient-to-br from-white to-secondary/5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl animate-pulse-glow">📊</span>
          <h3 className="text-xl font-bold bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent animate-gradient">
            Stock Levels
          </h3>
        </div>
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
