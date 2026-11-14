'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BrandMark } from '@/components/ui/BrandMark';
import {
  LayoutDashboard,
  FileText,
  Users,
  Upload,
  Bell,
  ClipboardList,
  FileSearch,
  History,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Building2,
  CheckSquare,
  ClipboardCheck,
  BarChart3,
  Briefcase,
  ShieldCheck,
  Code,
  MessageCircle,
  TrendingUp,
  PieChart,
  PenTool,
  ScanLine,
  Brain,
  Globe,
  UserCircle,
  CreditCard,
  FileDown,
  Search,
  X,
  Lock,
} from 'lucide-react';
import { useI18n } from '@/components/i18n/I18nProvider';
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';
import {
  filterSidebarItems,
  type NavIconKey,
  type SidebarNavItem,
  type SidebarUser,
} from '@/lib/sidebar-nav';

interface SidebarProps {
  user: SidebarUser;
  collapsed: boolean;
  onToggle: () => void;
  onExpand?: () => void;
  onLogout: () => void;
}

const ICON_MAP: Record<NavIconKey, React.ElementType> = {
  dashboard: LayoutDashboard,
  supervisor: BarChart3,
  claims: FileText,
  authorizations: ShieldCheck,
  coding: Code,
  tasks: CheckSquare,
  chat: MessageCircle,
  practices: Building2,
  signoffs: ClipboardCheck,
  productivity: TrendingUp,
  reports: PieChart,
  ai: Brain,
  ocr: ScanLine,
  signatures: PenTool,
  patients: UserCircle,
  payments: CreditCard,
  era: FileDown,
  upload: Upload,
  workQueue: ClipboardList,
  review: FileSearch,
  users: Users,
  denialCodes: Briefcase,
  auditLogs: History,
  notifications: Bell,
  profile: UserCircle,
  account: UserCircle,
  organization: Building2,
  billing: CreditCard,
  platform: Globe,
  security: Lock,
};

export function Sidebar({ user, collapsed, onToggle, onExpand, onLogout }: SidebarProps) {
  const { t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const pendingFocusRef = useRef(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const isSearching = searchQuery.trim().length > 0;

  const filteredItems = useMemo(() => {
    const base = filterSidebarItems(user, searchQuery);
    const q = searchQuery.trim().toLowerCase();
    if (!q) return base;
    // Also match the labels the user actually sees in their language.
    const extra = filterSidebarItems(user, '').filter(
      (item) =>
        !base.includes(item) &&
        (t(`nav.${item.id}`).toLowerCase().includes(q) ||
          item.keywords.some((k) => k.toLowerCase().includes(q)))
    );
    // Include sub-options whose translated label matches, even if the
    // English search above filtered them out.
    return [...base, ...extra];
  }, [user, searchQuery, t]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchQuery]);

  // Focus search input after expanding from collapsed rail
  useEffect(() => {
    if (!collapsed && pendingFocusRef.current) {
      pendingFocusRef.current = false;
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [collapsed]);

  // Global keyboard shortcut: Ctrl+K / Cmd+K focuses sidebar function search
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (collapsed) {
          pendingFocusRef.current = true;
          if (onExpand) onExpand();
          else onToggle();
        } else {
          searchInputRef.current?.focus();
          searchInputRef.current?.select();
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [collapsed, onExpand, onToggle]);

  const handleCollapsedSearchClick = () => {
    pendingFocusRef.current = true;
    if (onExpand) onExpand();
    else onToggle();
  };

  const navigateToItem = (item: SidebarNavItem) => {
    if (item.isSubOption) {
      setSearchQuery('');
    }
    router.push(item.href);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      if (searchQuery) {
        setSearchQuery('');
      } else {
        searchInputRef.current?.blur();
      }
      return;
    }

    if (filteredItems.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % filteredItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === 'Enter' && isSearching) {
      e.preventDefault();
      const target = filteredItems[highlightedIndex] || filteredItems[0];
      if (target) {
        navigateToItem(target);
      }
    }
  };

  return (
    <aside
      className={`fixed left-0 rtl:left-auto rtl:right-0 top-0 h-full bg-[#0F2D52] text-white transition-all duration-300 z-40 ${
        collapsed ? 'w-[60px]' : 'w-[240px]'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-between h-14 px-3 border-b border-white/10">
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
              <BrandMark size="sm" />
              <span className="font-bold text-sm tracking-tight truncate">BloomAR Manager</span>
            </Link>
          )}
          <button
            onClick={onToggle}
            aria-label={collapsed ? t('common.expandSidebar') : t('common.collapseSidebar')}
            className={`p-1.5 rounded-md hover:bg-white/10 transition-colors ${collapsed ? 'mx-auto' : ''}`}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Sidebar Function Search */}
        <div className="px-2 pt-2.5 pb-1">
          {!collapsed ? (
            <div className="flex items-center gap-2 bg-white/[0.08] hover:bg-white/[0.12] focus-within:bg-white/[0.14] focus-within:ring-1 focus-within:ring-[#60A5FA]/70 border border-white/10 rounded-lg px-2.5 py-1.5 transition-colors">
              <Search className="w-3.5 h-3.5 text-white/55 flex-shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder={t('common.searchOptions')}
                aria-label={t('common.searchSidebar')}
                className="w-full bg-transparent text-xs text-white placeholder:text-white/45 focus:outline-none min-w-0"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    searchInputRef.current?.focus();
                  }}
                  aria-label="Clear search"
                  title="Clear search (Esc)"
                  className="text-white/50 hover:text-white p-0.5 rounded transition-colors flex-shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <kbd
                  title="Press Ctrl+K or Cmd+K to search"
                  className="text-[10px] font-medium text-white/35 bg-white/[0.06] border border-white/10 rounded px-1 py-0.5 leading-none flex-shrink-0"
                >
                  ⌘K
                </kbd>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={handleCollapsedSearchClick}
              title="Search options (Ctrl+K)"
              aria-label={t('common.searchSidebar')}
              className="w-full flex items-center justify-center py-2 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-colors"
            >
              <Search className="w-[18px] h-[18px]" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-2 overflow-y-auto scrollbar-thin">
          {!collapsed && isSearching && filteredItems.length > 0 && (
            <div className="px-3 pt-0.5 pb-1.5 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-white/40">
              <span>{t('common.availableOptions', { count: filteredItems.length })}</span>
              <span>↵ {t('common.open')}</span>
            </div>
          )}

          <ul className="space-y-0.5 px-2">
            {filteredItems.map((item, idx) => {
              const Icon = ICON_MAP[item.icon] || FileText;
              const basePath = item.href.split('?')[0];
              const isActive =
                !item.isSubOption &&
                (pathname === basePath || pathname.startsWith(`${basePath}/`));
              const isKeyboardHighlighted = isSearching && !collapsed && idx === highlightedIndex;

              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    onClick={() => {
                      if (item.isSubOption) {
                        setSearchQuery('');
                      }
                    }}
                    onMouseEnter={() => {
                      if (isSearching) setHighlightedIndex(idx);
                    }}
                    title={collapsed ? t(`nav.${item.id}`) : undefined}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-all duration-150 ${
                      isActive
                        ? 'bg-[#2563EB] text-white font-semibold shadow-sm'
                        : isKeyboardHighlighted
                        ? 'bg-white/15 text-white ring-1 ring-white/20'
                        : 'text-white/60 hover:bg-white/8 hover:text-white'
                    } ${collapsed ? 'justify-center px-0' : ''}`}
                  >
                    <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                    {!collapsed && (
                      <div className="min-w-0 flex-1 flex items-center justify-between gap-1.5">
                        <span className="truncate">{t(`nav.${item.id}`)}</span>
                        {item.isSubOption && item.groupLabel && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/10 text-white/65 flex-shrink-0">
                            {item.groupLabel === 'AR Claims' ? t('nav.group.arClaims') : item.groupLabel}
                          </span>
                        )}
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {!collapsed && isSearching && filteredItems.length === 0 && (
            <div className="px-3 py-6 text-center">
              <p className="text-xs text-white/55">{t('common.noOptionsMatch', { query: searchQuery.trim() })}</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  searchInputRef.current?.focus();
                }}
                className="mt-2.5 text-[11px] font-semibold text-[#60A5FA] hover:text-white transition-colors"
              >
                {t('common.clearSearch')}
              </button>
            </div>
          )}
        </nav>

        {/* Language & region */}
        <div className={`border-t border-white/10 px-2 pt-2 ${collapsed ? 'flex justify-center' : ''}`}>
          <LanguageSwitcher variant="dark" compact={collapsed} />
        </div>
        {/* Logout */}
        <div className="p-2">
          <button
            onClick={onLogout}
            className={`flex items-center gap-2.5 px-2.5 py-2 w-full rounded-lg text-white/50 hover:bg-white/8 hover:text-white transition-colors text-[13px] ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut className="w-[18px] h-[18px]" />
            {!collapsed && <span>{t('common.logout')}</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
