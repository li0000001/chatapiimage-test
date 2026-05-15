"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Github, Image, LayoutDashboard, LogOut, Menu, Sparkles, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import webConfig from "@/constants/common-env";
import { getValidatedAuthSession } from "@/lib/auth-session";
import { cn } from "@/lib/utils";
import { clearStoredAuthSession, type StoredAuthSession } from "@/store/auth";

const adminNavItems = [
  { href: "/image", label: "画图" },
  { href: "/accounts", label: "号池管理" },
  { href: "/register", label: "注册机" },
  { href: "/image-manager", label: "图片管理" },
  { href: "/logs", label: "日志管理" },
  { href: "/settings", label: "设置" },
];

const userNavItems = [{ href: "/image", label: "创作台" }];

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<StoredAuthSession | null | undefined>(undefined);

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (pathname === "/login") {
        if (!active) {
          return;
        }
        setSession(null);
        return;
      }

      const storedSession = await getValidatedAuthSession();
      if (!active) {
        return;
      }
      setSession(storedSession);
    };

    void load();
    return () => {
      active = false;
    };
  }, [pathname]);

  const handleLogout = async () => {
    await clearStoredAuthSession();
    router.replace("/login");
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (pathname === "/login" || session === undefined || !session) {
    return null;
  }

  const navItems = session.role === "admin" ? adminNavItems : userNavItems;
  const isAdmin = session.role === "admin";
  const roleLabel = isAdmin ? "管理员" : "普通用户";
  const displayName = session.name.trim() || roleLabel;

  if (!isAdmin) {
    return (
      <header className="sticky top-0 z-40 pt-2">
        <div className="mx-auto flex min-h-14 max-w-[1380px] items-center justify-between gap-3 rounded-[24px] border border-white/75 bg-white/82 px-3 py-2 shadow-[0_18px_70px_-48px_rgba(15,23,42,0.55)] backdrop-blur-xl sm:min-h-16 sm:px-5">
          <Link href="/image" className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <Image className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[15px] font-semibold tracking-tight text-slate-950 sm:text-base">
                AI 图片创作台
              </span>
              <span className="hidden text-xs text-slate-500 sm:block">生成、编辑与历史记录</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 rounded-full bg-slate-100/80 p-1 sm:flex">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition",
                    active ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-900",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-3 py-1.5 text-xs font-medium text-teal-800 md:flex">
              <Sparkles className="size-3.5" />
              <span className="max-w-[140px] truncate">{displayName}</span>
            </div>
            <button
              type="button"
              className="inline-flex size-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-950"
              onClick={() => void handleLogout()}
              aria-label="退出登录"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-40 pt-2">
        <div className="mx-auto flex min-h-12 items-center justify-between gap-3 rounded-[20px] border border-white/60 bg-white/78 px-3 py-2 shadow-[0_8px_40px_-20px_rgba(15,23,42,0.15)] backdrop-blur-xl sm:min-h-14 sm:gap-6 sm:rounded-[24px] sm:px-5">
          <div className="flex items-center gap-3">
            <Link href="/image" className="flex items-center gap-2.5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-stone-900 text-white sm:size-10 sm:rounded-2xl">
                <LayoutDashboard className="size-4 sm:size-5" />
              </span>
              <span className="hidden text-[15px] font-bold tracking-tight text-stone-950 transition hover:text-stone-700 sm:block">
                chatgpt2api
              </span>
            </Link>
            <a
              href="https://github.com/basketikun/chatgpt2api"
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 md:inline-flex"
              aria-label="GitHub repository"
            >
              <Github className="size-3.5" />
              <span>GitHub</span>
            </a>
          </div>

          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 sm:flex">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative shrink-0 whitespace-nowrap rounded-xl px-3.5 py-2 text-[14px] font-medium transition-all duration-200",
                    active
                      ? "bg-stone-900 text-white shadow-[0_2px_8px_-2px_rgba(15,23,42,0.3)]"
                      : "text-stone-500 hover:bg-stone-100 hover:text-stone-900",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 sm:flex">
            <span className="flex items-center gap-1.5 rounded-xl border border-stone-200/80 bg-stone-50/80 px-3 py-1.5 text-[12px] font-medium text-stone-500">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              {roleLabel}
            </span>
            <span className="rounded-xl bg-stone-100/80 px-2.5 py-1.5 text-[11px] font-medium text-stone-400">
              v{webConfig.appVersion}
            </span>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12px] font-medium text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
              onClick={() => void handleLogout()}
            >
              <LogOut className="size-3.5" />
              退出
            </button>
          </div>

          <button
            type="button"
            className="ml-auto inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-600 transition hover:bg-stone-50 sm:hidden"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="打开菜单"
          >
            <Menu className="size-4" />
          </button>
        </div>
      </header>

      {isMobileMenuOpen ? (
        <div className="fixed inset-0 z-50 sm:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/30 animate-in fade-in-0" />
          <div
            className="absolute inset-x-0 bottom-0 rounded-t-[28px] bg-white px-5 pt-5 shadow-[0_-12px_60px_-24px_rgba(15,23,42,0.3)] animate-in slide-in-from-bottom"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1.25rem)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-stone-200" />
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-stone-500">导航菜单</span>
              <button
                type="button"
                className="rounded-xl p-2 text-stone-400 hover:bg-stone-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="mb-3 flex items-center gap-2 rounded-xl bg-stone-50 px-3 py-2 text-xs text-stone-500">
              <span className="rounded-md bg-stone-200 px-2 py-0.5 font-medium text-stone-600">{roleLabel}</span>
              <span className="truncate">{displayName}</span>
              <span className="ml-auto text-stone-400">v{webConfig.appVersion}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition",
                      active
                        ? "bg-stone-950 text-white"
                        : "bg-stone-50 text-stone-700 hover:bg-stone-100",
                    )}
                  >
                    <span className={cn("size-2 rounded-full", active ? "bg-white" : "bg-stone-300")} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
            <button
              type="button"
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-white py-3 text-sm font-medium text-stone-600 transition hover:bg-stone-50"
              onClick={() => {
                setIsMobileMenuOpen(false);
                void handleLogout();
              }}
            >
              <LogOut className="size-4" />
              退出登录
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
