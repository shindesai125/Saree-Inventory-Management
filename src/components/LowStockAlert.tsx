import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { Saree } from "./AddSareeForm";

interface LowStockAlertProps {
  sarees: Saree[];
}

export const LowStockAlert = ({ sarees }: LowStockAlertProps) => {
  const lowStockSarees = sarees.filter((saree) => saree.quantity < 5);

  if (lowStockSarees.length === 0) {
    return null;
  }

  return (
    <Card className="p-6 border-destructive/50 bg-destructive/5 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="h-5 w-5 text-destructive" />
        <h2 className="text-xl font-semibold text-destructive">Low Stock Alert</h2>
        <Badge variant="destructive" className="ml-auto">
          {lowStockSarees.length}
        </Badge>
      </div>

      <div className="space-y-3">
        {lowStockSarees.map((saree) => (
          <div
            key={saree.id}
            className="flex items-center justify-between p-3 bg-card rounded-lg border border-destructive/20"
          >
            <div className="flex items-center gap-3">
              <img
                src={saree.imageUrl}
                alt={saree.name}
                className="w-12 h-12 object-cover rounded-md"
              />
              <div>
                <p className="font-medium">{saree.name}</p>
                <p className="text-sm text-muted-foreground">{saree.type}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-destructive">Only {saree.quantity} left!</p>
              <p className="text-sm text-muted-foreground">₹{saree.price.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
