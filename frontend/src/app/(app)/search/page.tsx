"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, Loader2, Clock } from "lucide-react";
import { useSearchStore } from "@/store/useSearchStore";
import { ProductCard } from "@/components/product/ProductCard";

export default function SearchPage() {
  const { query, setQuery, addRecentSearch, recentSearches, clearRecentSearches } = useSearchStore();
  const [inputValue, setInputValue] = useState(query);
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showRecent, setShowRecent] = useState(false);
  
  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== query) {
        setQuery(inputValue);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [inputValue, query, setQuery]);

  // Fetch results when query changes
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setShowRecent(true);
      return;
    }
    
    setShowRecent(false);
    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/v1/products/search?q=${encodeURIComponent(query)}&page=1&size=20`);
        const data = await res.json();
        if (data.items) {
          setResults(data.items);
          addRecentSearch(query);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchResults();
  }, [query, addRecentSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(inputValue);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header & Search Bar */}
      <div className="flex flex-col gap-4 sticky top-0 z-20 bg-background/80 backdrop-blur-md pt-2 pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight">Discover</h1>
        
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 relative">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
            <Input 
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setShowRecent(e.target.value.length === 0);
              }}
              onFocus={() => setShowRecent(inputValue.length === 0)}
              placeholder="Search by name, category, or barcode..."
              className="pl-12 py-6 rounded-2xl bg-surface/50 border-primary/20 focus-visible:ring-primary/50 text-base"
            />
          </div>
          <Button type="button" variant="outline" size="icon" className="h-[52px] w-[52px] rounded-2xl bg-surface/50 border-primary/20 shrink-0">
            <SlidersHorizontal className="w-5 h-5" />
          </Button>
        </form>
      </div>

      {/* Recent Searches */}
      {showRecent && recentSearches.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-on-surface-variant">Recent Searches</h3>
            <Button variant="ghost" size="sm" onClick={clearRecentSearches} className="text-xs text-primary h-auto py-1">Clear</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((term, i) => (
              <Button 
                key={i} 
                variant="outline" 
                className="rounded-full bg-surface/30 border-border/50 text-on-surface gap-2"
                onClick={() => {
                  setInputValue(term);
                  setQuery(term);
                }}
              >
                <Clock className="w-3 h-3 text-on-surface-variant" /> {term}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {!showRecent && (
        <div className="space-y-4">
          <h3 className="font-semibold text-on-surface-variant flex items-center gap-2">
            {isLoading && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
            {isLoading ? "Searching..." : `Found ${results.length} results for "${query}"`}
          </h3>
          
          {results.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {results.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          ) : !isLoading && (
            <div className="py-20 text-center flex flex-col items-center justify-center glass-card rounded-3xl">
              <Search className="w-12 h-12 text-on-surface-variant mb-4 opacity-50" />
              <h2 className="text-xl font-bold mb-2">No products found</h2>
              <p className="text-on-surface-variant max-w-md">We couldn't find any exact matches for "{query}". Try checking your spelling or using more general terms.</p>
            </div>
          )}
        </div>
      )}
      
    </div>
  );
}
