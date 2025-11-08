// src/components/InventoryGrid.tsx
import React, { useState } from "react";
import { Saree } from "@/components/AddSareeForm";

type Props = {
  sarees: (Saree & { images?: string[] })[];
  onEdit?: (s: Saree & { images?: string[] }) => void;
  onDelete?: (id: string) => void;
};

export default function InventoryGrid({ sarees, onEdit, onDelete }: Props) {
  if (!sarees || sarees.length === 0) {
    return <div className="mt-6 text-center text-gray-500">No sarees in inventory yet.</div>;
  }

  // Card that manages its own carousel index
  const Card: React.FC<{ s: Saree & { images?: string[] } }> = ({ s }) => {
    const imgs = s.images ?? (s.imageUrl ? [s.imageUrl] : []);
    const [idx, setIdx] = useState(0);
    const prev = () => setIdx((p) => (imgs.length ? (p - 1 + imgs.length) % imgs.length : 0));
    const next = () => setIdx((p) => (imgs.length ? (p + 1) % imgs.length : 0));

    return (
      <div className="bg-white rounded-xl border border-pink-100 shadow-sm overflow-hidden flex flex-col justify-between">
        <div>
          <div className="w-full h-44 bg-pink-50 rounded-t-xl overflow-hidden flex items-center justify-center border-b border-pink-50 relative">
            {imgs && imgs.length > 0 ? (
              <>
                <img src={imgs[idx]} alt={s.name} className="w-full h-full object-cover" />
                {imgs.length > 1 && (
                  <>
                    <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded px-2 py-1">◀</button>
                    <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded px-2 py-1">▶</button>
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-2 text-xs bg-white/60 rounded px-2 py-0.5">
                      {idx + 1}/{imgs.length}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="text-pink-300 text-sm">No image</div>
            )}
          </div>

          <div className="p-4 text-sm">
            <h3 className="font-semibold text-gray-800 mb-1">{s.name}</h3>
            <div className="text-gray-600">Type: <span className="font-medium text-gray-800">{s.type}</span></div>
            <div className="text-gray-600">Price: <span className="font-medium text-gray-800">₹{s.price}</span></div>
            <div className="text-gray-600">Stock: <span className="font-medium text-gray-800">{s.quantity}</span></div>

            <div className="mt-3">
              <span className="block text-xs font-semibold text-gray-500 mb-1">Tags:</span>
              <div className="text-xs text-gray-600">
                {s.tags && s.tags.length > 0 ? s.tags.join(", ") : <span className="text-gray-300">—</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center px-4 pb-4 pt-2">
          {onDelete && (
            <button onClick={() => onDelete(s.id)} className="px-3 py-1.5 bg-red-100 text-sm rounded hover:bg-red-200 border border-red-200 text-red-700 font-medium">
              Delete
            </button>
          )}
          <button onClick={() => onEdit?.(s)} className="px-3 py-1.5 bg-yellow-100 text-sm rounded hover:bg-yellow-200 border border-yellow-200 text-yellow-800 font-medium">
            Edit
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {sarees.map((s) => (
        <Card key={s.id} s={s} />
      ))}
    </div>
  );
}
