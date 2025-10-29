import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabaseClients"; 
import { Saree } from './AddSareeForm';

interface Props {
  sarees: Saree[];
}

const InventoryTable = ({ sarees }: Props) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {sarees.map((saree) => (
        <div key={saree.id} className="border rounded p-4 shadow">
          <img src={saree.imageUrl} alt={saree.name} className="w-full h-40 object-cover mb-2" />
          <h3 className="text-lg font-semibold">{saree.name}</h3>
          <p>Type: {saree.type}</p>
          <p>Price: ₹{saree.price}</p>
          <p>Stock: {saree.quantity}</p>
          <p className="text-sm text-gray-500">Tags: {saree.tags?.join(', ')}</p>
        </div>
      ))}
    </div>
  );
};

export default InventoryTable;