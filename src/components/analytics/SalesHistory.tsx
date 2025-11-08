// src/components/analytics/SalesHistory.tsx
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClients";

type SaleRow = {
  id: number | string;
  saree_id: string | number;
  saree_name?: string | null;
  type?: string | null;
  customer_name?: string | null;
  quantity: number;
  selling_price: number;
  cost_price?: number | null;
  margin?: number | null;
  image_url?: string | null;
  created_at?: string | null;
};

type Props = {
  refreshTrigger?: number;
  limit?: number;
};

export const SalesHistory: React.FC<Props> = ({ refreshTrigger = 0, limit = 50 }) => {
  const [sales, setSales] = useState<SaleRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // edit modal state
  const [editingSale, setEditingSale] = useState<SaleRow | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    const fetchSales = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from("sales")
          .select(
            [
              "id",
              "saree_id",
              "customer_name",
              "quantity",
              "selling_price",
              "cost_price",
              "margin",
              "image_url",
              "created_at",
              "type",
            ].join(",")
          )
          .order("created_at", { ascending: false })
          .limit(limit);

        if (error) throw error;

        let rows = data || [];

        // batch fetch saree names if missing
        const needNames = rows.some((r: any) => !r.saree_name);
        if (needNames) {
          const sareeIds = Array.from(new Set(rows.map((r: any) => Number(r.saree_id)).filter(Boolean)));
          if (sareeIds.length > 0) {
            const { data: sareesData, error: sError } = await supabase
              .from("sarees")
              .select("id, name, type")
              .in("id", sareeIds);
            if (!sError && sareesData) {
              const byId: Record<string, any> = {};
              (sareesData || []).forEach((s: any) => {
                byId[String(s.id)] = s;
              });
              rows = rows.map((r: any) => ({
                ...r,
                saree_name: r.saree_name ?? (byId[String(r.saree_id)] ? byId[String(r.saree_id)].name : null),
                type: r.type ?? (byId[String(r.saree_id)] ? byId[String(r.saree_id)].type : null),
              }));
            }
          }
        }

        const normalized: SaleRow[] = (rows || []).map((r: any) => ({
          id: r.id,
          saree_id: r.saree_id,
          saree_name: r.saree_name ?? null,
          type: r.type ?? null,
          customer_name: r.customer_name ?? null,
          quantity: r.quantity ?? 0,
          selling_price: r.selling_price ?? 0,
          cost_price: r.cost_price ?? null,
          margin: r.margin ?? null,
          image_url: r.image_url ?? null,
          created_at: r.created_at ?? null,
        }));

        setSales(normalized);
      } catch (err: any) {
        console.error("Failed to fetch sales:", err);
        setError(err?.message ?? "Failed to fetch sales");
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, [refreshTrigger, limit]);

  const refreshList = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("sales")
        .select(
          [
            "id",
            "saree_id",
            "customer_name",
            "quantity",
            "selling_price",
            "cost_price",
            "margin",
            "image_url",
            "created_at",
            "type",
          ].join(",")
        )
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      let rows = data || [];

      const needNames = rows.some((r: any) => !r.saree_name);
      if (needNames) {
        const sareeIds = Array.from(new Set(rows.map((r: any) => Number(r.saree_id)).filter(Boolean)));
        if (sareeIds.length > 0) {
          const { data: sareesData } = await supabase.from("sarees").select("id, name, type").in("id", sareeIds);
          const byId: Record<string, any> = {};
          (sareesData || []).forEach((s: any) => (byId[String(s.id)] = s));
          rows = rows.map((r: any) => ({
            ...r,
            saree_name: r.saree_name ?? (byId[String(r.saree_id)] ? byId[String(r.saree_id)].name : null),
            type: r.type ?? (byId[String(r.saree_id)] ? byId[String(r.saree_id)].type : null),
          }));
        }
      }

      const normalized: SaleRow[] = (rows || []).map((r: any) => ({
        id: r.id,
        saree_id: r.saree_id,
        saree_name: r.saree_name ?? null,
        type: r.type ?? null,
        customer_name: r.customer_name ?? null,
        quantity: r.quantity ?? 0,
        selling_price: r.selling_price ?? 0,
        cost_price: r.cost_price ?? null,
        margin: r.margin ?? null,
        image_url: r.image_url ?? null,
        created_at: r.created_at ?? null,
      }));
      setSales(normalized);
    } catch (err: any) {
      console.error("Failed to refresh sales:", err);
      setError(err?.message ?? "Failed to refresh sales");
    } finally {
      setLoading(false);
    }
  };

  const deleteSale = async (id: string | number) => {
    const confirmed = window.confirm("Delete this sale record? This cannot be undone.");
    if (!confirmed) return;
    try {
      const maybeNum = Number(id);
      const eqArg = Number.isNaN(maybeNum) ? id : maybeNum;
      const { error } = await supabase.from("sales").delete().eq("id", eqArg);
      if (error) throw error;
      // remove locally
      setSales((prev) => prev.filter((s) => String(s.id) !== String(id)));
    } catch (err: any) {
      console.error("Failed to delete sale:", err);
      alert("Failed to delete sale: " + (err?.message || err));
    }
  };

  const openEditModal = (row: SaleRow) => {
    // create copy
    setEditingSale({ ...row });
  };

  const closeEditModal = () => {
    setEditingSale(null);
  };

  const saveEdit = async () => {
    if (!editingSale) return;
    setEditLoading(true);
    try {
      const maybeNum = Number(editingSale.id);
      const eqArg = Number.isNaN(maybeNum) ? editingSale.id : maybeNum;

      // compute margin if cost_price exists; else leave margin as is
      let updateObj: any = {
        customer_name: editingSale.customer_name,
        quantity: Number(editingSale.quantity),
        selling_price: Number(editingSale.selling_price),
        image_url: editingSale.image_url ?? null,
      };

      // if cost_price present, recalc margin; otherwise preserve or compute later
      if (typeof editingSale.cost_price === "number") {
        updateObj.margin = Number(editingSale.selling_price) - Number(editingSale.cost_price);
      }

      const { error } = await supabase.from("sales").update(updateObj).eq("id", eqArg);
      if (error) throw error;

      // refresh local list
      await refreshList();
      closeEditModal();
    } catch (err: any) {
      console.error("Failed to update sale:", err);
      alert("Failed to update sale: " + (err?.message || err));
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 border border-pink-50 shadow-sm">
      <h3 className="text-lg font-semibold mb-3">Sales History</h3>

      {loading && <div className="text-sm text-gray-500">Loading sales...</div>}
      {error && <div className="text-sm text-red-500">Error: {error}</div>}

      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm divide-y divide-gray-100">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-3 py-2 text-left">Image</th>
                <th className="px-3 py-2 text-left">Customer</th>
                <th className="px-3 py-2 text-left">Saree</th>
                <th className="px-3 py-2 text-left">Type</th>
                <th className="px-3 py-2 text-right">Qty</th>
                <th className="px-3 py-2 text-right">Sell Price</th>
                <th className="px-3 py-2 text-right">Margin</th>
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {sales.map((s) => (
                <tr key={String(s.id)}>
                  <td className="px-3 py-2 align-middle">
                    {s.image_url ? (
                      <img
                        src={s.image_url}
                        alt="sold"
                        className="w-16 h-12 object-cover rounded"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>

                  <td className="px-3 py-2 align-middle">{s.customer_name ?? "—"}</td>
                  <td className="px-3 py-2 align-middle font-medium">{s.saree_name ?? String(s.saree_id)}</td>
                  <td className="px-3 py-2 align-middle">{s.type ?? "—"}</td>

                  <td className="px-3 py-2 text-right">{s.quantity}</td>
                  <td className="px-3 py-2 text-right">₹{(s.selling_price || 0).toLocaleString()}</td>
                  <td className="px-3 py-2 text-right">
                    {typeof s.margin === "number" ? `₹${s.margin.toLocaleString()}` : "—"}
                  </td>

                  <td className="px-3 py-2">{s.created_at ? new Date(s.created_at).toLocaleString() : "—"}</td>

                  <td className="px-3 py-2 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEditModal(s)}
                        className="px-2 py-1 rounded bg-yellow-100 border border-yellow-200 text-yellow-800 text-sm"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => deleteSale(s.id)}
                        className="px-2 py-1 rounded bg-red-100 border border-red-200 text-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {sales.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-6 text-center text-gray-500">
                    No sales recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editingSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl p-6 shadow-lg border">
            <h4 className="text-lg font-semibold mb-4">Edit Sale</h4>

            <div className="grid grid-cols-1 gap-3">
              <label className="text-sm">
                Customer Name
                <input
                  value={editingSale.customer_name ?? ""}
                  onChange={(e) => setEditingSale({ ...editingSale, customer_name: e.target.value })}
                  className="w-full mt-1 rounded border px-3 py-2"
                />
              </label>

              <label className="text-sm">
                Quantity
                <input
                  type="number"
                  value={editingSale.quantity}
                  onChange={(e) => setEditingSale({ ...editingSale, quantity: Number(e.target.value) })}
                  className="w-full mt-1 rounded border px-3 py-2"
                />
              </label>

              <label className="text-sm">
                Selling Price (₹)
                <input
                  type="number"
                  value={editingSale.selling_price}
                  onChange={(e) => setEditingSale({ ...editingSale, selling_price: Number(e.target.value) })}
                  className="w-full mt-1 rounded border px-3 py-2"
                />
              </label>

              <label className="text-sm">
                Image URL (optional)
                <input
                  value={editingSale.image_url ?? ""}
                  onChange={(e) => setEditingSale({ ...editingSale, image_url: e.target.value || null })}
                  placeholder="https://..."
                  className="w-full mt-1 rounded border px-3 py-2"
                />
              </label>
            </div>

            <div className="mt-4 flex items-center justify-end gap-3">
              <button onClick={closeEditModal} className="px-4 py-2 rounded border bg-white">
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="px-4 py-2 rounded bg-green-500 text-white"
                disabled={editLoading}
              >
                {editLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesHistory;
