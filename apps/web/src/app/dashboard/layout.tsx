export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen flex-col">
      <header className="flex h-14 items-center justify-between border-b bg-background px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
            <span className="text-xs font-bold text-primary-foreground">Z</span>
          </div>
          <span className="text-sm font-semibold">Zendak</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden w-56 border-r bg-muted/30 p-4 md:block">
          <nav className="space-y-1">
            <p className="px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Navigation
            </p>
          </nav>
        </aside>

        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
