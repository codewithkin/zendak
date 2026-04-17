"use client";

import { ArrowDown01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";

import { apiClient } from "@/lib/api";
import { cn } from "@zendak/ui/lib/utils";
import { Icon } from "@zendak/ui/components/icon";

interface SearchResult<T> {
  items: T[];
  hasMore: boolean;
  total: number;
}

interface SearchSelectProps<T> {
  value: string;
  onChange: (value: string) => void;
  endpoint: string;
  placeholder?: string;
  getLabel: (item: T) => string;
  getValue: (item: T) => string;
  required?: boolean;
  extraParams?: Record<string, string>;
}

export function SearchSelect<T>({
  value,
  onChange,
  endpoint,
  placeholder = "Select...",
  getLabel,
  getValue,
  required,
  extraParams,
}: SearchSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("");
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const [mounted, setMounted] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentSearchRef = useRef("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchItems = useCallback(
    async (searchQuery: string, pageNum: number, reset: boolean) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          q: searchQuery,
          page: String(pageNum),
          limit: "10",
          ...(extraParams ?? {}),
        });
        const result = await apiClient.get<SearchResult<T>>(
          `${endpoint}?${params.toString()}`,
        );
        setItems((prev) => (reset ? result.items : [...prev, ...result.items]));
        setHasMore(result.hasMore);
        setPage(pageNum);
      } catch {
        // silent — auth errors handled globally
      } finally {
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [endpoint, JSON.stringify(extraParams)],
  );

  const handleOpen = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });
    setOpen(true);
    setSearch("");
    setItems([]);
    setPage(1);
    setHasMore(false);
    currentSearchRef.current = "";
    fetchItems("", 1, true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // Outside click
  useEffect(() => {
    if (!open) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (
        triggerRef.current?.contains(e.target as Node) ||
        dropdownRef.current?.contains(e.target as Node)
      ) {
        return;
      }
      handleClose();
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [open]);

  // Search with debounce
  const handleSearchChange = (q: string) => {
    setSearch(q);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      currentSearchRef.current = q;
      setItems([]);
      setPage(1);
      fetchItems(q, 1, true);
    }, 300);
  };

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    if (!open || !hasMore || isLoading) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          fetchItems(currentSearchRef.current, page + 1, false);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [open, hasMore, isLoading, page, fetchItems]);

  const handleSelect = (item: T) => {
    onChange(getValue(item));
    setSelectedLabel(getLabel(item));
    handleClose();
  };

  const dropdown = open ? (
    <div
      ref={dropdownRef}
      style={{
        position: "fixed",
        top: dropdownPos.top,
        left: dropdownPos.left,
        width: dropdownPos.width,
        zIndex: 9999,
      }}
      className="rounded-lg border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
    >
      <div className="flex items-center gap-2 border-b border-neutral-200 p-2 dark:border-neutral-700">
        <Icon icon={Search01Icon} size={14} className="shrink-0 text-muted-foreground" />
        <input
          autoFocus
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search..."
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
      <div className="max-h-56 overflow-y-auto">
        {items.map((item, i) => {
          const itemVal = getValue(item);
          return (
            <button
              key={`${itemVal}-${i}`}
              type="button"
              onMouseDown={() => handleSelect(item)}
              className={cn(
                "w-full cursor-pointer px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800",
                itemVal === value && "bg-neutral-100 font-medium dark:bg-neutral-800",
              )}
            >
              {getLabel(item)}
            </button>
          );
        })}
        {isLoading && (
          <div className="px-3 py-2 text-sm text-muted-foreground">Loading...</div>
        )}
        {!isLoading && items.length === 0 && (
          <div className="px-3 py-2 text-sm text-muted-foreground">No results</div>
        )}
        <div ref={sentinelRef} className="h-1" />
      </div>
    </div>
  ) : null;

  return (
    <div className="relative">
      {required && (
        <input
          tabIndex={-1}
          required
          value={value}
          onChange={() => {}}
          aria-hidden="true"
          style={{ position: "absolute", opacity: 0, width: 0, height: 0, pointerEvents: "none" }}
        />
      )}
      <button
        ref={triggerRef}
        type="button"
        onClick={open ? handleClose : handleOpen}
        className="flex h-9 w-full items-center justify-between rounded-md border border-neutral-200 bg-white px-3 py-2 text-left text-sm shadow-xs outline-none hover:border-neutral-300 focus-visible:ring-2 focus-visible:ring-ring dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-neutral-600"
      >
        <span className={value ? "text-foreground" : "text-muted-foreground"}>
          {value ? (selectedLabel || value) : placeholder}
        </span>
        <Icon icon={ArrowDown01Icon} size={14} className="text-muted-foreground" />
      </button>
      {mounted && ReactDOM.createPortal(dropdown, document.body)}
    </div>
  );
}
