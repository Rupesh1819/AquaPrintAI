"use client";

import { Leaf, Droplet, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavoritesStore } from "@/store/useFavoritesStore";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  id: string;
  name: string;
  category: string;
  manufacturer: string;
  eco_grade: string;
  overall_score: number;
  image_url: string | null;
}

export function ProductCard({ id, name, category, manufacturer, eco_grade, overall_score, image_url }: ProductCardProps) {
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  const favorite = isFavorite(id);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (favorite) removeFavorite(id);
    else addFavorite(id);
  };

  let gradeColor = "text-red-500 bg-red-500/10";
  if (eco_grade === "A" || eco_grade === "B") gradeColor = "text-green-500 bg-green-500/10";
  else if (eco_grade === "C") gradeColor = "text-yellow-500 bg-yellow-500/10";
  else if (eco_grade === "D") gradeColor = "text-orange-500 bg-orange-500/10";

  return (
    <Link href={`/products/${id}`} className="group relative block w-full glass-card overflow-hidden hover-card-effect border border-border/40 hover:border-primary/50 transition-all rounded-3xl cursor-pointer">
      {/* Top right favorite button */}
      <Button
        variant="ghost"
        size="icon"
        className={cn("absolute top-3 right-3 z-10 rounded-full bg-background/50 backdrop-blur-md border border-border/50", favorite ? "text-red-500" : "text-on-surface-variant hover:text-red-500")}
        onClick={toggleFavorite}
      >
        <Heart className={cn("w-5 h-5", favorite && "fill-current")} />
      </Button>

      <div className="relative w-full aspect-square bg-surface/50 overflow-hidden">
        {image_url ? (
          <Image 
            src={image_url} 
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface/80">
            <Droplet className="w-12 h-12 text-on-surface-variant/30" />
          </div>
        )}
        
        {/* Eco Badge */}
        <div className={cn("absolute bottom-3 left-3 px-3 py-1 rounded-full font-bold text-sm backdrop-blur-md flex items-center gap-1", gradeColor)}>
          <Leaf className="w-4 h-4" /> Grade {eco_grade}
        </div>
      </div>

      <div className="p-5">
        <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-1">{category}</p>
        <h3 className="font-bold text-lg leading-tight truncate group-hover:text-primary transition-colors">{name}</h3>
        <p className="text-sm text-on-surface-variant mt-1 truncate">{manufacturer}</p>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-full bg-surface h-2 rounded-full overflow-hidden min-w-[100px]">
              <div 
                className="h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-blue-400 to-primary" 
                style={{ width: `${overall_score}%` }} 
              />
            </div>
          </div>
          <span className="text-sm font-semibold">{overall_score}/100</span>
        </div>
      </div>
    </Link>
  );
}
