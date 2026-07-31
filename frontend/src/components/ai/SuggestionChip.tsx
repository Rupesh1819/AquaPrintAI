"use client";

import { Button } from "@/components/ui/button";

interface SuggestionChipProps {
  label: string;
  onClick: () => void;
}

export function SuggestionChip({ label, onClick }: SuggestionChipProps) {
  return (
    <Button 
      variant="outline" 
      className="rounded-full bg-surface/50 border-primary/20 hover:bg-primary/10 hover:text-primary transition-colors text-xs sm:text-sm h-8"
      onClick={onClick}
    >
      {label}
    </Button>
  );
}
