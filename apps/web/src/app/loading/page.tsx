export default function Loading() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-8">
      {/* Branded Spinner */}
      <div className="flex flex-col items-center gap-4">
        {/* Animated Zendak Logo Placeholder */}
        <div className="flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">Z</span>
          </div>
          <span className="text-sm font-semibold tracking-tight text-foreground">Zendak</span>
        </div>

        {/* Animated dot loader with Zendak colors */}
        <div className="flex items-end gap-1.5 pt-2">
          <div className="h-2 w-2 animate-bounce rounded-full bg-primary" />
          <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:150ms]" />
          <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:300ms]" />
        </div>

        {/* Loading text */}
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
          Authenticating
        </p>
      </div>
    </div>
  );
}
