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
    <Card className="p-6 border-2 border-destructive/50 bg-gradient-to-br from-destructive/5 to-destructive/10 shadow-elegant hover-lift">
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle className="h-6 w-6 text-destructive animate-pulse-glow" />
        <h2 className="text-2xl font-bold text-destructive flex items-center gap-2">
          Low Stock Alert <span className="text-2xl">⚠️</span>
        </h2>
        <Badge variant="destructive" className="ml-auto text-base px-3 py-1 animate-bounce-in">
          {lowStockSarees.length}
        </Badge>
      </div>

      <div className="space-y-3">
        {lowStockSarees.map((saree, index) => (
          <div
            key={saree.id}
            className="flex items-center justify-between p-3 bg-card rounded-lg border border-destructive/30 hover-lift transition-bounce animate-slide-in shadow-soft"
            style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'backwards' }}
          >
            <div className="flex items-center gap-3">
              <img
                src={saree.imageUrl}
                alt={saree.name}
                className="w-12 h-12 object-cover rounded-md hover-scale shadow-elegant border-2 border-destructive/20"
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
