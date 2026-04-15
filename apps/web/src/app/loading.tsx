export default function Loading() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6">
      <div className="flex items-end gap-1.5">
        <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
        <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:150ms]" />
        <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:300ms]" />
      </div>
      <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
        Loading
      </span>
    </div>
  );
}
