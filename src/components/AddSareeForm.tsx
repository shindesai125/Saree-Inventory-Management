// src/components/AddSareeForm.tsx
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClients";

export type Saree = {
  id: string;
  name: string;
  type: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  images?: string[]; // URLs from saree_images
  tags?: string[];
  description?: string | null;
};

type Props = {
  onAddSaree?: (s: Saree) => void;
  onUpdate?: (s: Saree) => void;
  initial?: Saree | null;
  onClose?: () => void;
};

export default function AddSareeForm({ onAddSaree, onUpdate, initial = null, onClose }: Props) {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [quantity, setQuantity] = useState<number | "">("");
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Load initial saree into form when editing
  useEffect(() => {
    if (initial) {
      setName(initial.name || "");
      setType(initial.type || "");
      setPrice(initial.price ?? "");
      setQuantity(initial.quantity ?? "");
      setTags((initial.tags || []).join(", "));
      setExistingImages(initial.images ?? (initial.imageUrl ? [initial.imageUrl] : []));
      setDescription(initial.description ?? null);
      setNewFiles([]);
      setPreviewUrls([]);
    } else {
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  // File previews
  useEffect(() => {
    if (!newFiles || newFiles.length === 0) {
      setPreviewUrls([]);
      return;
    }
    const urls = newFiles.map((f) => URL.createObjectURL(f));
    setPreviewUrls(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [newFiles]);

  const resetForm = () => {
    setName("");
    setType("");
    setPrice("");
    setQuantity("");
    setNewFiles([]);
    setPreviewUrls([]);
    setExistingImages([]);
    setTags("");
    setDescription(null);
  };

  // Upload a single File to Supabase storage and return its public URL or null
  const uploadFile = async (file: File) => {
    try {
      const ext = file.name.split(".").pop();
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const path = filename;

      let { error: uploadError } = await supabase.storage.from("saree-images").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });

      if (uploadError) {
        // try upsert=true as fallback
        const { error: uploadError2 } = await supabase.storage.from("saree-images").upload(path, file, {
          cacheControl: "3600",
          upsert: true,
        });
        if (uploadError2) {
          console.error("[AddSareeForm] upload failed:", uploadError2);
          return null;
        }
      }

      const { data: urlData, error: urlError } = supabase.storage.from("saree-images").getPublicUrl(path);
      if (urlError) {
        console.warn("[AddSareeForm] getPublicUrl error:", urlError);
      }
      return urlData?.publicUrl ?? null;
    } catch (err) {
      console.error("[AddSareeForm] uploadFile unexpected error:", err);
      return null;
    }
  };

  // Insert saree_images rows for a given saree id
  const insertSareeImages = async (sareeId: number, urls: string[]) => {
    if (!urls || urls.length === 0) return;
    try {
      const rows = urls.map((u) => ({ saree_id: sareeId, image_url: u }));
      const { error } = await supabase.from("saree_images").insert(rows);
      if (error) throw error;
    } catch (err) {
      console.error("insertSareeImages error:", err);
    }
  };

  // Delete existing image reference from saree_images
  const deleteExistingImage = async (sareeId: string, imageUrl: string) => {
    try {
      const { error } = await supabase
        .from("saree_images")
        .delete()
        .eq("image_url", imageUrl)
        .eq("saree_id", Number(sareeId));
      if (error) throw error;
      setExistingImages((prev) => prev.filter((u) => u !== imageUrl));
    } catch (err: any) {
      console.error("deleteExistingImage error:", err);
      alert("Failed to delete image: " + (err?.message || err));
    }
  };

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewFiles(files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!name || !type || price === "" || quantity === "") {
      alert("Please fill name, type, price and quantity");
      setLoading(false);
      return;
    }

    const priceNum = Number(price);
    const quantityNum = Number(quantity);

    const tagArray = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      // upload new files
      const uploadedUrls: string[] = [];
      if (newFiles.length > 0) {
        for (const f of newFiles) {
          const url = await uploadFile(f);
          if (url) uploadedUrls.push(url);
          else console.warn("One file failed to upload, continuing...");
        }
      }

      if (initial) {
        // UPDATE existing saree (investment history stays unchanged)
        const idVal = initial.id;
        const maybeNum = Number(idVal);
        const eqArg = Number.isNaN(maybeNum) ? idVal : maybeNum;

        const { error: updateError } = await supabase
          .from("sarees")
          .update({
            name,
            type,
            price: priceNum,
            quantity: quantityNum,
            image_url: existingImages[0] ?? uploadedUrls[0] ?? null,
            tags: tagArray.join(","),
            description: description ?? null,
          })
          .eq("id", eqArg);

        if (updateError) throw updateError;

        if (uploadedUrls.length > 0) {
          await insertSareeImages(Number(initial.id), uploadedUrls);
        }

        const { data: imagesRows } = await supabase
          .from("saree_images")
          .select("image_url")
          .eq("saree_id", Number(initial.id));
        const images = (imagesRows || []).map((r: any) => r.image_url);
        const finalImages = images.length > 0 ? images : [...existingImages, ...uploadedUrls];

        const updatedSaree: Saree = {
          id: String(initial.id),
          name,
          type,
          price: priceNum,
          quantity: quantityNum,
          imageUrl: finalImages[0] ?? "",
          images: finalImages,
          tags: tagArray,
          description: description ?? null,
        };

        onUpdate?.(updatedSaree);
        onClose?.();
      } else {
        // INSERT new saree
        const { data, error: insertError } = await supabase
          .from("sarees")
          .insert([
            {
              name,
              type,
              price: priceNum,
              quantity: quantityNum,
              image_url: uploadedUrls[0] ?? null,
              tags: tagArray.join(","),
              description: description ?? null,
            },
          ])
          .select()
          .single();

        if (insertError) throw insertError;

        // Log purchase (investment)
        try {
          await supabase.from("purchases").insert([
            {
              saree_id: data.id,
              name,
              type,
              quantity: quantityNum,
              price: priceNum,
              total_cost: priceNum * quantityNum,
            },
          ]);
        } catch (err) {
          console.error("Failed to log purchase:", err);
          // not fatal for saving saree, so continue
        }

        if (uploadedUrls.length > 0) {
          await insertSareeImages(Number(data.id), uploadedUrls);
        }

        const { data: imagesRows } = await supabase
          .from("saree_images")
          .select("image_url")
          .eq("saree_id", Number(data.id));
        const images = (imagesRows || []).map((r: any) => r.image_url);

        const created: Saree = {
          id: String(data.id),
          name: data.name,
          type: data.type,
          price: data.price,
          quantity: data.quantity,
          imageUrl: data.image_url || images[0] || "",
          images,
          tags: data.tags ? data.tags.split(",") : [],
          description: data.description ?? null,
        };

        onAddSaree?.(created);
        resetForm();
      }
    } catch (err: any) {
      console.error("AddSareeForm handleSubmit error:", err);
      alert("Error saving saree: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-md border border-pink-50">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-pink-300 to-pink-400 rounded-lg flex items-center justify-center text-white">
          💎
        </div>
        <h3 className="text-2xl font-bold text-pink-600">{initial ? "Edit Saree" : "Add New Saree"}</h3>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Saree Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Royal Silk Saree"
          className="w-full rounded-xl border border-pink-100 px-4 py-3 placeholder:text-pink-300 bg-pink-50 focus:outline-none focus:ring-2 focus:ring-pink-200"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
        <input
          value={type}
          onChange={(e) => setType(e.target.value)}
          placeholder="e.g., Silk, Cotton, Georgette"
          className="w-full rounded-xl border border-pink-100 px-4 py-3 placeholder:text-pink-300 bg-pink-50 focus:outline-none focus:ring-2 focus:ring-pink-200"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
            className="w-full rounded-xl border border-pink-100 px-4 py-3 placeholder:text-pink-300 bg-pink-50 focus:outline-none focus:ring-2 focus:ring-pink-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value === "" ? "" : Number(e.target.value))}
            className="w-full rounded-xl border border-pink-100 px-4 py-3 placeholder:text-pink-300 bg-pink-50 focus:outline-none focus:ring-2 focus:ring-pink-200"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Upload Images (optional)</label>
        <input type="file" accept="image/*" multiple onChange={handleFilesChange} className="mb-2" />
        <div className="flex gap-2 flex-wrap">
          {/* previews of newly selected files */}
          {previewUrls.map((u, i) => (
            <div key={i} className="w-20 h-20 rounded-md overflow-hidden border">
              <img src={u} alt={`preview-${i}`} className="w-full h-full object-cover" />
            </div>
          ))}

          {/* existing images */}
          {existingImages.map((u) => (
            <div key={u} className="w-20 h-20 rounded-md overflow-hidden border relative">
              <img src={u} alt="existing" className="w-full h-full object-cover" />
              {initial && (
                <button
                  type="button"
                  onClick={() => {
                    if (!initial?.id) return;
                    if (!confirm("Remove this image from saree? This deletes only DB reference (not storage object)."))
                      return;
                    deleteExistingImage(initial.id, u);
                  }}
                  className="absolute top-1 right-1 bg-white/80 text-xs px-1 rounded"
                >
                  x
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Description (optional)</label>
        <textarea
          value={description ?? ""}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short description that appears on product listing"
          className="w-full rounded-xl border border-pink-100 px-4 py-3 placeholder:text-pink-300 bg-pink-50 focus:outline-none focus:ring-2 focus:ring-pink-200"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma separated)</label>
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="e.g., traditional, wedding, silk"
          className="w-full rounded-xl border border-pink-100 px-4 py-3 placeholder:text-pink-300 bg-pink-50 focus:outline-none focus:ring-2 focus:ring-pink-200"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 text-center py-4 rounded-full bg-gradient-to-r from-pink-500 to-pink-400 text-white text-lg font-semibold shadow-md hover:opacity-95"
        >
          {initial ? (loading ? "Saving..." : "Save Changes ✨") : loading ? "Adding..." : "+  Add Saree ✨"}
        </button>

        {initial && (
          <button
            type="button"
            onClick={() => onClose?.()}
            className="px-4 py-3 rounded-lg bg-white border border-pink-100 text-sm"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
