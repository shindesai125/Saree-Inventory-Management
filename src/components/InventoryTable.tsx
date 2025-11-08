// src/components/InventoryTable.tsx
import React from "react";
import { Saree } from "@/components/AddSareeForm";

type InventoryTableProps = {
  sarees: Saree[];
  onEdit?: (s: Saree) => void;
  onDelete?: (id: string) => void;
};

export default function InventoryTable({ sarees, onEdit, onDelete }: InventoryTableProps) {
  if (!sarees || sarees.length === 0) {
    return (
      <div className="mt-6 text-center text-gray-500">
        No sarees in inventory yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-sm p-4 mt-6">
      <table className="w-full text-sm">
        <thead className="text-left text-xs uppercase text-gray-500">
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Tags</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sarees.map((s) => (
            <tr key={s.id} className="border-t">
              <td className="py-2">{s.name}</td>
              <td className="py-2">{s.type}</td>
              <td className="py-2">{s.quantity}</td>
              <td className="py-2">₹{s.price}</td>
              <td className="py-2">{(s.tags || []).join(", ")}</td>
              <td className="py-2 text-right space-x-2">
                <button
                  onClick={() => onEdit?.(s)}
                  className="px-2 py-1 text-sm bg-yellow-100 rounded hover:bg-yellow-200"
                >
                  Edit
                </button>

                {onDelete && (
                  <button
                    onClick={() => onDelete(s.id)}
                    className="px-2 py-1 text-sm bg-red-100 rounded hover:bg-red-200"
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
