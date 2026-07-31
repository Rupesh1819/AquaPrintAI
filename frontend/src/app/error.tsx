"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service like Sentry
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-[80vh] flex-col items-center justify-center space-y-6 text-center px-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-error-container text-on-error-container">
        <AlertCircle className="h-10 w-10" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-on-surface">
          Something went wrong!
        </h2>
        <p className="text-on-surface-variant max-w-md mx-auto">
          We apologize for the inconvenience. An unexpected error has occurred.
        </p>
      </div>
      <Button 
        onClick={() => reset()}
        className="bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container"
      >
        Try again
      </Button>
    </div>
  );
}
