"use client";

import { useEffect, useState } from "react";
import { useAdminStore } from "@/store/useAdminStore";
import { Loader2, Search, Trash2, Upload, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function AdminProductsPage() {
  const { products, setProducts, removeProduct } = useAdminStore();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const res = await fetch(`http://127.0.0.1:8000/api/v1/admin/products?search=${search}`, {
          headers: { "Authorization": `Bearer ${session.access_token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProducts(data.items, data.total);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [search, setProducts]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await fetch(`http://127.0.0.1:8000/api/v1/admin/products/${id}`, { 
        method: "DELETE",
        headers: { "Authorization": `Bearer ${session.access_token}` }
      });
      removeProduct(id);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Product Database</h1>
          <p className="text-on-surface-variant">Manage dataset, bulk import, and water footprints.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Upload className="w-4 h-4" /> Import CSV
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </div>
      </div>
      
      <div className="relative w-full sm:w-96">
        <Search className="w-5 h-5 absolute left-3 top-3 text-on-surface-variant" />
        <Input 
          className="pl-10 rounded-xl bg-surface border-border/40" 
          placeholder="Search by name or barcode..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface/50 text-on-surface-variant text-sm font-semibold border-b border-border/40">
              <tr>
                <th className="p-4">Product Name</th>
                <th className="p-4">Barcode</th>
                <th className="p-4">Category</th>
                <th className="p-4">Water Footprint</th>
                <th className="p-4">Eco Score</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-on-surface-variant">No products found.</td>
                </tr>
              ) : (
                products.map(p => (
                  <tr key={p.id} className="border-b border-border/20 last:border-0 hover:bg-surface/50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold">{p.name}</p>
                      <p className="text-[10px] text-on-surface-variant uppercase">{p.manufacturer}</p>
                    </td>
                    <td className="p-4 font-mono text-xs">{p.barcode}</td>
                    <td className="p-4 text-sm">{p.category}</td>
                    <td className="p-4 text-sm font-bold text-blue-500">{p.water_footprint_liters} L</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                        p.sustainability_score >= 80 ? 'bg-green-500/10 text-green-500' :
                        p.sustainability_score >= 50 ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {p.sustainability_score}/100
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleDelete(p.id)}
                        className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
