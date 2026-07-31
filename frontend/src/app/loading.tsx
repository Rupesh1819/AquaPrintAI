export default function Loading() {
  return (
    <div className="flex h-[80vh] flex-col items-center justify-center space-y-4">
      <div className="relative flex h-16 w-16 items-center justify-center">
        {/* Animated Water Drop Loader */}
        <div className="absolute inset-0 rounded-full border-4 border-primary/30 animate-ping"></div>
        <svg
          className="h-10 w-10 text-primary animate-pulse"
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" />
        </svg>
      </div>
      <p className="text-sm font-medium text-on-surface-variant animate-pulse font-jetbrains tracking-widest uppercase">
        Loading...
      </p>
    </div>
  );
}
