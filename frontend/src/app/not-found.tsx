import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex h-[80vh] flex-col items-center justify-center space-y-6 text-center px-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface-variant text-on-surface-variant">
        <SearchX className="h-10 w-10" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-on-surface">
          Page Not Found
        </h2>
        <p className="text-on-surface-variant max-w-md mx-auto">
          The page you are looking for doesn't exist or has been moved.
        </p>
      </div>
      <Link href="/" className={buttonVariants({ variant: "default", className: "bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container" })}>
        Return Home
      </Link>
    </div>
  );
}
