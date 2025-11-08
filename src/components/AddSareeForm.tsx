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
  images?: string[]; // added for multiple images
  tags?: string[];
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
  const [previewUrls, setPreviewUrls] = useState<string[]>([]); // previews for newly chosen files
  const [existingImages, setExistingImages] = useState<string[]>([]); // existing images from saree_images table
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initial) {
      setName(initial.name || "");
      setType(initial.type || "");
      setPrice(initial.price ?? "");
      setQuantity(initial.quantity ?? "");
      setTags((initial.tags || []).join(", "));
      setExistingImages(initial.images ?? (initial.imageUrl ? [initial.imageUrl] : []));
      setNewFiles([]);
      setPreviewUrls([]);
    } else {
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  useEffect(() => {
    // generate previews for newly selected files
    if (!newFiles || newFiles.length === 0) {
      setPreviewUrls([]);
      return;
    }
    const urls = newFiles.map((f) => URL.createObjectURL(f));
    setPreviewUrls(urls);
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
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
  };

  // upload single file and return public url
  const uploadFile = async (file: File) => {
    try {
      const ext = file.name.split(".").pop();
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const path = filename;
      const { error: uploadError } = await supabase.storage
        .from("saree-images")
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        // try upsert fallback
        const { error: uploadError2 } = await supabase.storage
          .from("saree-images")
          .upload(path, file, { cacheControl: "3600", upsert: true });
        if (uploadError2) {
          console.error("Upload failed:", uploadError2);
          return null;
        }
      }

      const { data: urlData, error: urlError } = supabase.storage.from("saree-images").getPublicUrl(path);
      if (urlError) {
        console.warn("getPublicUrl error:", urlError);
      }
      return urlData?.publicUrl ?? null;
    } catch (err) {
      console.error("uploadFile unexpected error:", err);
      return null;
    }
  };

  // insert saree_images rows for a given saree id
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

  // delete single saree image row by image_url (and optionally remove from storage)
  const deleteExistingImage = async (sareeId: string, imageUrl: string) => {
    try {
      // delete row in saree_images
      const { error } = await supabase.from("saree_images").delete().eq("image_url", imageUrl).eq("saree_id", Number(sareeId));
      if (error) throw error;

      // optionally delete object from storage — careful: only if you want to remove file
      // to remove: parse the path after bucket domain and call supabase.storage.from("saree-images").remove([path])
      // we won't attempt removing storage object automatically to avoid accidental deletions
      setExistingImages((prev) => prev.filter((u) => u !== imageUrl));
    } catch (err) {
      console.error("deleteExistingImage error:", err);
      alert("Failed to delete image: " + (err as any).message || err);
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

    const tagArray = tags.split(",").map((t) => t.trim()).filter(Boolean);

    try {
      let uploadedUrls: string[] = [];
      // upload all new files first
      if (newFiles.length > 0) {
        for (const f of newFiles) {
          const url = await uploadFile(f);
          if (url) uploadedUrls.push(url);
          else console.warn("One file failed to upload, continuing...");
        }
      }

      if (initial) {
        // update saree row
        const idVal = initial.id;
        const maybeNum = Number(idVal);
        const eqArg = Number.isNaN(maybeNum) ? idVal : maybeNum;

        const { error: updateError } = await supabase
          .from("sarees")
          .update({
            name,
            type,
            price: Number(price),
            quantity: Number(quantity),
            image_url: (existingImages[0] ?? uploadedUrls[0] ?? null),
            tags: tagArray.join(","),
          })
          .eq("id", eqArg);

        if (updateError) throw updateError;

        // insert new uploaded images into saree_images
        if (uploadedUrls.length > 0) {
          await insertSareeImages(Number(initial.id), uploadedUrls);
        }

        // fetch latest images for this saree
        const { data: imagesRows } = await supabase
          .from("saree_images")
          .select("image_url")
          .eq("saree_id", Number(initial.id));

        const images = (imagesRows || []).map((r: any) => r.image_url);
        // fallback if none in saree_images but main image exists
        if (images.length === 0 && (existingImages.length > 0 || uploadedUrls.length > 0)) {
          const fallback = existingImages.length > 0 ? existingImages : uploadedUrls;
          // no DB rows, but return these as best effort
          const updatedSaree = {
            id: String(initial.id),
            name,
            type,
            price: Number(price),
            quantity: Number(quantity),
            imageUrl: fallback[0] ?? "",
            images: fallback,
            tags: tagArray,
          };
          onUpdate?.(updatedSaree);
        } else {
          const updatedSaree = {
            id: String(initial.id),
            name,
            type,
            price: Number(price),
            quantity: Number(quantity),
            imageUrl: images[0] ?? "",
            images,
            tags: tagArray,
          };
          onUpdate?.(updatedSaree);
        }

      } else {
        // Insert new saree
        const { data, error: insertError } = await supabase
          .from("sarees")
          .insert([
            {
              name,
              type,
              price: Number(price),
              quantity: Number(quantity),
              image_url: (uploadedUrls[0] ?? null),
              tags: tagArray.join(","),
            },
          ])
          .select()
          .single();

        if (insertError) throw insertError;

        // insert uploaded images rows
        if (uploadedUrls.length > 0) {
          await insertSareeImages(Number(data.id), uploadedUrls);
        }

        // fetch inserted images to include in returned object
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
          imageUrl: data.image_url || (images[0] ?? ""),
          images,
          tags: data.tags ? data.tags.split(",") : [],
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
        <div className="w-10 h-10 bg-gradient-to-br from-pink-300 to-pink-400 rounded-lg flex items-center justify-center text-white">💎</div>
        <h3 className="text-2xl font-bold text-pink-600">{initial ? "Edit Saree" : "Add New Saree"}</h3>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Saree Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Royal Silk Saree"
          className="w-full rounded-xl border border-pink-100 px-4 py-3 placeholder:text-pink-300 bg-pink-50 focus:outline-none focus:ring-2 focus:ring-pink-200" />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
        <input value={type} onChange={(e) => setType(e.target.value)} placeholder="e.g., Silk, Cotton, Georgette"
          className="w-full rounded-xl border border-pink-100 px-4 py-3 placeholder:text-pink-300 bg-pink-50 focus:outline-none focus:ring-2 focus:ring-pink-200" />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
            className="w-full rounded-xl border border-pink-100 px-4 py-3 placeholder:text-pink-300 bg-pink-50 focus:outline-none focus:ring-2 focus:ring-pink-200" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
          <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value === "" ? "" : Number(e.target.value))}
            className="w-full rounded-xl border border-pink-100 px-4 py-3 placeholder:text-pink-300 bg-pink-50 focus:outline-none focus:ring-2 focus:ring-pink-200" />
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
                    // confirm & delete
                    if (!confirm("Remove this image from saree? This deletes only DB reference (not storage object).")) return;
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

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma separated)</label>
        <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g., traditional, wedding, silk"
          className="w-full rounded-xl border border-pink-100 px-4 py-3 placeholder:text-pink-300 bg-pink-50 focus:outline-none focus:ring-2 focus:ring-pink-200" />
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={loading}
          className="flex-1 text-center py-4 rounded-full bg-gradient-to-r from-pink-500 to-pink-400 text-white text-lg font-semibold shadow-md hover:opacity-95">
          {initial ? (loading ? "Saving..." : "Save Changes ✨") : (loading ? "Adding..." : "+  Add Saree ✨")}
        </button>

        {initial && (
          <button type="button" onClick={() => onClose?.()} className="px-4 py-3 rounded-lg bg-white border border-pink-100 text-sm">Cancel</button>
        )}
      </div>
    </form>
  );
}
