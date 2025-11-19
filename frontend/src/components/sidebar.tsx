"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BookOpen, ChevronLeft, LayoutDashboard, LogIn, Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { getSession, type StoredSession } from "@/lib/auth";

interface SidebarProps {
  session?: StoredSession | null;
}

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/benefits", label: "Manfaat Kas", icon: BookOpen },
];

const EXPANDED_WIDTH = "15.5rem";
const COLLAPSED_WIDTH = "4.75rem";

export function Sidebar({ session }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [storedSession, setStoredSession] = useState<StoredSession | null>(null);
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const resolvedSession = session ?? storedSession;

  const collapsed = isMobile ? false : desktopCollapsed;
  const drawerVisible = isMobile && mobileOpen;

  const sidebarWidth = collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;
  const mobileSidebarWidth = collapsed ? "4.5rem" : "min(22rem, calc(100vw - 1.5rem))";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const updateStoredSession = () => setStoredSession(getSession());
    updateStoredSession();
    window.addEventListener("focus", updateStoredSession);
    window.addEventListener("storage", updateStoredSession);
    return () => {
      window.removeEventListener("focus", updateStoredSession);
      window.removeEventListener("storage", updateStoredSession);
    };
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.style.setProperty("--sidebar-width", sidebarWidth);
  }, [sidebarWidth]);

  useEffect(() => {
    if (!drawerVisible) return;
    if (typeof window === "undefined") return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [drawerVisible]);

  const navItems = [
    ...NAV_ITEMS,
    {
      href: "/login",
      label: resolvedSession?.token ? "Panel Admin" : "Login",
      icon: LogIn,
    },
  ];

  const sessionInitial = resolvedSession?.email?.charAt(0)?.toUpperCase() ?? "A";

  return (
    <>
      <button
        className={cn(
          "fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary via-indigo-500 to-cyan-400 text-white shadow-[0_18px_30px_rgba(15,23,42,0.5)] transition md:hidden",
          drawerVisible && "translate-y-4 scale-0 opacity-0",
        )}
        onClick={() => setMobileOpen(true)}
        aria-expanded={drawerVisible}
        aria-label="Open sidebar"
      >
        <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-slate-950/85 shadow-inner shadow-black/40">
          <Menu className="h-6 w-6 stroke-[2.5]" />
          <span className="pointer-events-none absolute inset-0 rounded-full border border-white/10" aria-hidden="true" />
          <span className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-primary/20 blur-2xl" aria-hidden="true" />
        </span>
      </button>

      <aside
        className={cn(
          "group/sidebar fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border/60 bg-card/95 px-3 py-6 text-foreground shadow-2xl shadow-black/20 backdrop-blur transition-[transform,width] duration-300 ease-out md:rounded-none",
          drawerVisible ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          isMobile && "rounded-r-[32px]",
        )}
        style={{ width: isMobile ? mobileSidebarWidth : sidebarWidth }}
      >
        <button
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-background text-muted-foreground shadow md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close sidebar"
        >
          <X className="h-4 w-4" />
        </button>

        <button
          className="absolute -right-4 top-24 hidden h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-background text-muted-foreground shadow-lg shadow-black/10 transition hover:text-primary md:flex"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={() => setDesktopCollapsed((prev) => !prev)}
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </button>

        <div className="flex h-full flex-col gap-5 pt-1">
          <div
            className={cn(
              "rounded-3xl border border-border/60 bg-background/75 px-4 py-4 shadow-inner shadow-black/5",
              collapsed && "px-3 py-3",
            )}
          >
            <div className={cn("flex items-center gap-4", collapsed && "justify-center")}>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 p-1.5">
                <Image
                  src="/logo-money.png"
                  alt="Ikon Kas Angkatan"
                  width={48}
                  height={48}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
              {!collapsed && (
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">Kas Angkatan</p>
                  <p className="text-xs text-muted-foreground">Finansial Transparan &amp; Modern</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto pb-4">
            <div
              className={cn(
                "flex items-center justify-between rounded-3xl border border-border/60 bg-background/65 px-4 py-4 shadow-inner shadow-black/5",
                collapsed && "flex-col gap-2 px-3 py-4 text-center",
              )}
            >
              {!collapsed && (
                <div className="text-left">
                  <p className="text-[0.55rem] font-semibold uppercase tracking-[0.55em] text-muted-foreground">Tema</p>
                  <p className="text-sm font-semibold text-foreground">Light / Dark</p>
                </div>
              )}
              <ThemeToggle />
            </div>

            <nav className="space-y-4 text-sm">
              <div
                className={cn(
                  "mx-auto flex w-full max-w-[12rem] items-center justify-center rounded-full border border-border/60 bg-background/70 px-4 py-2 text-[0.6rem] font-semibold uppercase tracking-[0.5em] text-muted-foreground shadow-inner shadow-black/10",
                  collapsed && "max-w-[3.5rem] px-0 tracking-[0.4em]",
                )}
              >
                Navigasi
              </div>
              <div className="space-y-2">
                {navItems.map((item) => (
                  <SidebarLink
                    key={item.href}
                    href={item.href}
                    icon={<item.icon className="h-4 w-4" />}
                    label={item.label}
                    collapsed={collapsed}
                    onNavigate={() => setMobileOpen(false)}
                    isActive={isPathActive(pathname, item.href)}
                  />
                ))}
              </div>
            </nav>
          </div>

          <div
            className={cn(
              "rounded-3xl border border-border/60 bg-background/60 p-4 text-sm shadow-inner shadow-black/5",
              collapsed && "px-2 py-3",
            )}
          >
            <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                {resolvedSession?.token ? sessionInitial : <LogIn className="h-4 w-4" />}
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <p className="text-[0.6rem] font-semibold uppercase tracking-[0.45em] text-muted-foreground">
                    {resolvedSession?.token ? "Admin" : "Status"}
                  </p>
                  <p className="truncate font-semibold text-foreground">
                    {resolvedSession?.token ? resolvedSession.email ?? "Admin Angkatan" : "Belum login"}
                  </p>
                </div>
              )}
            </div>
            {!collapsed && (
              <p className="mt-3 text-xs text-muted-foreground">
                {resolvedSession?.token
                  ? "Gunakan Panel Admin untuk mengelola transaksi kas."
                  : "Login terlebih dahulu sebelum mencatat transaksi kas."}
              </p>
            )}
          </div>
        </div>
      </aside>

      {drawerVisible && (
        <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}
    </>
  );
}

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  onNavigate: () => void;
  isActive: boolean;
}

function SidebarLink({ href, icon, label, collapsed, onNavigate, isActive }: SidebarLinkProps) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "group relative flex items-center gap-3 rounded-3xl border border-transparent px-3 py-2.5 text-sm font-medium transition-all duration-200",
        collapsed ? "justify-center" : "pl-2 pr-4",
        isActive
          ? "border-primary/40 bg-primary/10 text-primary shadow-inner shadow-primary/20"
          : "text-muted-foreground hover:border-border/70 hover:bg-background/70 hover:text-foreground",
      )}
      aria-current={isActive ? "page" : undefined}
    >
      <span
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-2xl bg-muted/40 text-muted-foreground transition-colors duration-200 group-hover:bg-primary/10 group-hover:text-primary",
          isActive && "bg-primary/15 text-primary",
        )}
      >
        {icon}
      </span>
      {!collapsed && <span className="truncate">{label}</span>}
      {collapsed && (
        <span className="pointer-events-none absolute left-[calc(100%+0.75rem)] top-1/2 hidden -translate-y-1/2 rounded-full bg-popover px-3 py-1 text-xs font-semibold text-popover-foreground opacity-0 shadow-xl ring-1 ring-border transition-all duration-200 group-hover:-translate-y-1/2 group-hover:opacity-100 md:inline-flex">
          {label}
        </span>
      )}
    </Link>
  );
}

function isPathActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname.startsWith(href);
}

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const updateMatch = () => setIsMobile(mediaQuery.matches);
    updateMatch();
    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updateMatch);
      return () => mediaQuery.removeEventListener("change", updateMatch);
    }
    mediaQuery.addListener(updateMatch);
    return () => mediaQuery.removeListener(updateMatch);
  }, [breakpoint]);

  return isMobile;
}
