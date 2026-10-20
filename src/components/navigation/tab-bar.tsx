"use client";

import Link from "next/link";
import { useEffect, useRef, type KeyboardEvent } from "react";

import { cn } from "@/lib/utils/cn";

export type TabItem = {
  id: string;
  label: string;
  href?: string;
};

export function TabBar({
  label,
  tabs,
  activeId,
  onSelect,
}: {
  label: string;
  tabs: TabItem[];
  activeId: string;
  onSelect?: (id: string) => void;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const linked = tabs.some((tab) => tab.href);

  function place(id: string) {
    const list = listRef.current;
    const indicator = indicatorRef.current;
    const tab = list?.querySelector<HTMLElement>(`[data-tab-id="${id}"]`);
    if (!list || !indicator || !tab) return;
    indicator.style.width = `${tab.offsetWidth}px`;
    indicator.style.transform = `translateX(${tab.offsetLeft - list.scrollLeft}px)`;
  }

  const tabKey = tabs.map((tab) => tab.id).join("|");
  useEffect(() => {
    place(activeId);
    const onResize = () => place(activeId);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeId, tabKey]);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (linked || !onSelect) return;
    const index = tabs.findIndex((tab) => tab.id === activeId);
    if (index < 0) return;
    const next =
      event.key === "ArrowRight"
        ? tabs[(index + 1) % tabs.length]
        : event.key === "ArrowLeft"
          ? tabs[(index - 1 + tabs.length) % tabs.length]
          : event.key === "Home"
            ? tabs[0]
            : event.key === "End"
              ? tabs[tabs.length - 1]
              : null;
    if (!next) return;
    event.preventDefault();
    onSelect(next.id);
    listRef.current?.querySelector<HTMLElement>(`[data-tab-id="${next.id}"]`)?.focus();
  }

  return (
    <div
      ref={listRef}
      role={linked ? "navigation" : "tablist"}
      aria-label={label}
      className="border-line relative flex gap-1 overflow-x-auto border-b"
      onKeyDown={onKeyDown}
      onScroll={() => place(activeId)}
    >
      {tabs.map((tab) => {
        const active = tab.id === activeId;
        const className = cn(
          "focus-visible:ring-accent relative z-10 shrink-0 cursor-pointer px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none",
          active ? "text-accent font-medium" : "text-muted hover:text-ink",
        );
        if (tab.href) {
          return (
            <Link
              key={tab.id}
              href={tab.href}
              data-tab-id={tab.id}
              aria-current={active ? "page" : undefined}
              className={className}
            >
              {tab.label}
            </Link>
          );
        }
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            data-tab-id={tab.id}
            aria-selected={active}
            aria-controls={`panel-${tab.id}`}
            tabIndex={active ? 0 : -1}
            className={className}
            onClick={() => onSelect?.(tab.id)}
          >
            {tab.label}
          </button>
        );
      })}
      <span
        ref={indicatorRef}
        aria-hidden
        className="bg-accent pointer-events-none absolute bottom-0 left-0 h-0.5 transition-[transform,width] duration-200 ease-out motion-reduce:transition-none"
      />
    </div>
  );
}
