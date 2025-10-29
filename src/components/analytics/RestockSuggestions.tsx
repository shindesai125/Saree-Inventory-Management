import { Card } from "@/components/ui/card";

interface Saree {
  id: string;
  name: string;
  type: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  tags?: string[];
  salesCount?: number; // optional if you track sales frequency
}

export const RestockSuggestions = ({ sarees }: { sarees: Saree[] }) => {
  // Thresholds
  const LOW_STOCK_THRESHOLD = 5;
  const FAST_SELLING_THRESHOLD = 10; // e.g. sold more than 10 recently

  // Filter sarees that need restocking
  const restockList = sarees.filter(
    (s) => s.quantity < LOW_STOCK_THRESHOLD || (s.salesCount ?? 0) > FAST_SELLING_THRESHOLD
  );

  if (restockList.length === 0) {
    return (
      <Card className="p-6 shadow-elegant border-primary/10 bg-gradient-to-br from-white to-emerald-50">
        <h2 className="text-2xl font-bold mb-4 text-emerald-600">✅ All Good!</h2>
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