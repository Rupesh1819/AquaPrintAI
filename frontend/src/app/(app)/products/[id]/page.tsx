"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Share, Heart, Droplet, Leaf, Info, Factory, Globe, Box, Target, Package, Sparkles } from "lucide-react";
import dynamic from "next/dynamic";

const WaterFootprintChart = dynamic(() => import("@/components/product/WaterFootprintChart").then(mod => mod.WaterFootprintChart), {
  ssr: false,
  loading: () => <div className="h-64 w-full animate-pulse bg-surface-variant rounded-xl" />
});

const SustainabilityGauge = dynamic(() => import("@/components/product/SustainabilityGauge").then(mod => mod.SustainabilityGauge), {
  ssr: false,
  loading: () => <div className="h-64 w-full animate-pulse bg-surface-variant rounded-xl" />
});
import { useFavoritesStore } from "@/store/useFavoritesStore";
import { ProductCard } from "@/components/product/ProductCard";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { API_BASE_URL } from "@/lib/api";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  const favorite = id ? isFavorite(id as string) : false;

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/products/${id}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in pb-20">
        <Skeleton className="h-[400px] w-full rounded-3xl" />
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Skeleton className="h-[300px] rounded-3xl" />
          <Skeleton className="h-[300px] rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <Button onClick={() => router.back()} variant="outline">Go Back</Button>
      </div>
    );
  }

  const primaryImage = product.images.find((i: any) => i.is_primary)?.url || product.images[0]?.url;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header Navigation */}
      <div className="flex items-center justify-between sticky top-0 z-20 bg-background/80 backdrop-blur-md pt-2 pb-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full bg-surface/50">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="rounded-full bg-surface/50">
            <Share className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn("rounded-full bg-surface/50", favorite && "text-red-500")}
            onClick={() => favorite ? removeFavorite(id as string) : addFavorite(id as string)}
          >
            <Heart className={cn("w-4 h-4", favorite && "fill-current")} />
          </Button>
        </div>
      </div>

      {/* Main Product Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Image Gallery */}
        <div className="glass-card rounded-3xl p-4 sm:p-8 flex items-center justify-center bg-surface/30 relative overflow-hidden group">
          <div className="aspect-square relative w-full max-w-md mx-auto">
            {primaryImage ? (
              <Image src={primaryImage} alt={product.name} fill className="object-contain" priority />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Box className="w-24 h-24 text-on-surface-variant/30" />
              </div>
            )}
          </div>
          
          {/* Ask AI Button Hovering on Image */}
          <Button className="absolute bottom-6 right-6 gap-2 rounded-full shadow-lg bg-primary text-on-primary shadow-primary/20 hover:scale-105 transition-transform" onClick={() => router.push('/assistant')}>
            <Sparkles className="w-4 h-4" /> Ask AI
          </Button>
        </div>

        {/* Details & Specs */}
        <div className="flex flex-col justify-center space-y-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4 uppercase tracking-wider">
              {product.category || "General"}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-2 leading-tight">
              {product.name}
            </h1>
            <p className="text-xl text-on-surface-variant flex items-center gap-2">
              <Factory className="w-5 h-5" /> {product.manufacturer || "Unknown Manufacturer"}
            </p>
          </div>
          
          {product.description && (
            <p className="text-on-surface-variant leading-relaxed">
              {product.description}
            </p>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card p-4 rounded-2xl border border-border/40">
              <p className="text-sm text-on-surface-variant mb-1 flex items-center gap-1"><Package className="w-4 h-4"/> Unit Size</p>
              <p className="font-semibold">{product.unit || "N/A"}</p>
            </div>
            <div className="glass-card p-4 rounded-2xl border border-border/40">
              <p className="text-sm text-on-surface-variant mb-1 flex items-center gap-1"><Target className="w-4 h-4"/> Status</p>
              <p className="font-semibold text-primary">{product.is_verified ? "Verified" : "Unverified"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Visualizations Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        <WaterFootprintChart footprints={product.footprints} />
        <SustainabilityGauge score={product.score.overall_score} grade={product.score.eco_grade} />
      </div>

      {/* Conservation Tips */}
      {product.tips && product.tips.length > 0 && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 mt-12 bg-gradient-to-br from-surface to-primary/5 border border-primary/10">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" /> Conservation Tips
          </h3>
          <ul className="space-y-4">
            {product.tips.map((tip: string, i: number) => (
              <li key={i} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-primary font-bold text-sm">{i+1}</span>
                </div>
                <p className="text-on-surface pt-1">{tip}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Alternatives */}
      {product.alternatives && product.alternatives.length > 0 && (
        <div className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Better Alternatives</h2>
            <Button variant="ghost" className="text-primary">View All</Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {product.alternatives.map((alt: any) => (
              <ProductCard 
                key={alt.id}
                id={alt.id}
                name={alt.name}
                category={product.category}
                manufacturer="Alternative"
                eco_grade="A" // Assuming alternatives are better, placeholder
                overall_score={90} // Placeholder
                image_url={alt.image_url}
              />
            ))}
          </div>
        </div>
      )}
      
    </div>
  );
}
