'use client';

import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  ArrowRight, 
  ChevronRight, 
  Layers, 
  Workflow, 
  LineChart, 
  Scale, 
  ShieldAlert, 
  FileCheck2,
  Lock
} from 'lucide-react';
import { Logo } from '../logo';
import { AuthenticatedUser } from '@/lib/types';
import { cn } from '../../lib/utils';
import Link from 'next/link';

interface NavItem {
  label: string;
  href: string;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Workflow', href: '#how-it-works' },
  { label: 'Verification', href: '#verification' },
  { label: 'Four Truths', href: '#audit-ledger' },
  { label: 'Timeline', href: '#money-over-time' },
  { label: 'Benchmark', href: '#comparison' },
  { label: 'Exceptions', href: '#attention' },
];

export interface SiteHeaderProps {
  onStartOnboarding: () => void;
  onAuthenticate?: (user: AuthenticatedUser) => void;
}

export function SiteHeader({ onStartOnboarding, onAuthenticate }: SiteHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const [hasExistingSession, setHasExistingSession] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const activeProj = localStorage.getItem("groundup_active_project_id") || localStorage.getItem("groundup_last_project_id");
      const user = localStorage.getItem("groundup_user");
      if (activeProj || user) {
        setHasExistingSession(true);
        if (activeProj) setActiveProjectId(activeProj);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Active section scroll spy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.25, rootMargin: '-76px 0px -40% 0px' }
    );

    const sectionIds = ['how-it-works', 'verification', 'audit-ledger', 'money-over-time', 'comparison', 'attention'];
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Close mobile drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    const targetId = href.replace('#', '');
    const el = document.getElementById(targetId);
    if (el) {
      const headerOffset = 76;
      const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      window.history.pushState(null, '', href);
    }
  };


  return (
    <>
      {/* Keyboard Accessibility Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2.5 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-ring font-semibold text-xs transition-all"
      >
        Skip to main content
      </a>

      {/* Main Architectural Header */}
      <header 
        id="site-header"
        role="banner"
        className={cn(
          "sticky top-0 z-50 transition-all duration-200 border-b",
          scrolled 
            ? "border-border/80 bg-background/95 backdrop-blur-md shadow-xs py-3" 
            : "border-border/40 bg-background/80 backdrop-blur-sm py-4"
        )}
      >
        <div className="mx-auto flex max-w-7xl 2xl:max-w-screen-2xl items-center justify-between gap-2 sm:gap-4 px-3 sm:px-6 lg:px-8 2xl:px-12">
          {/* Brand Logo */}
          <div className="flex items-center shrink-0">
            <Logo onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
          </div>

          {/* Desktop Navigation Links */}
          <nav aria-label="Main Navigation" className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.href.replace('#', '');
              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={cn(
                    "group relative px-3.5 py-1.5 text-xs font-semibold transition-colors rounded-lg hover:bg-muted/70 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isActive ? "text-foreground font-bold bg-muted/50" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span>{item.label}</span>
                  <span 
                    className={cn(
                      "absolute inset-x-3 -bottom-0.5 h-0.5 bg-foreground transition-transform duration-200 ease-out origin-center rounded-full",
                      isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    )}
                    aria-hidden="true" 
                  />
                </a>
              );
            })}
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {mounted && hasExistingSession ? (
              <Link
                href={activeProjectId ? `/projects/${activeProjectId}/control-center` : "/projects"}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/auth/login"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                Sign In
              </Link>
            )}
            <button
              type="button"
              onClick={onStartOnboarding}
              className="btn-micro inline-flex items-center gap-1 sm:gap-1.5 rounded-xl border border-foreground/15 bg-primary px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-primary-foreground hover:bg-primary/90 shadow-sm cursor-pointer whitespace-nowrap"
            >
              <span><span className="hidden sm:inline">Start your project</span><span className="sm:hidden">Start project</span></span>
              <ArrowRight className="size-3.5 hidden sm:inline-block" aria-hidden="true" />
            </button>

            {/* Mobile Menu Trigger */}
            <button
              type="button"
              id="mobile-menu-trigger"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation-drawer"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="lg:hidden p-2 rounded-xl text-foreground hover:bg-muted transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center shrink-0 border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {mobileMenuOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div 
            id="mobile-navigation-drawer"
            role="region"
            aria-label="Mobile Navigation"
            className="lg:hidden border-b border-border bg-background/98 backdrop-blur-xl px-4 pt-3 pb-6 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <nav aria-label="Mobile Primary Navigation" className="space-y-1 mb-4">
              {NAV_ITEMS.map((item) => {
                const isActive = activeSection === item.href.replace('#', '');
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl text-sm font-semibold transition-colors",
                      isActive ? "bg-muted text-foreground font-bold" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    )}
                  >
                    <span>{item.label}</span>
                    <ChevronRight className={cn("size-4", isActive ? "text-foreground" : "text-muted-foreground/60")} aria-hidden="true" />
                  </a>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-border flex flex-col gap-2">
              {mounted && hasExistingSession ? (
                <Link
                  href={activeProjectId ? `/projects/${activeProjectId}/control-center` : "/projects"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 px-3 rounded-xl border border-border bg-background text-foreground text-xs font-semibold text-center hover:bg-muted transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>Enter Dashboard</span>
                </Link>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 px-3 rounded-xl border border-border bg-background text-foreground text-xs font-semibold text-center hover:bg-muted transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>Sign In</span>
                </Link>
              )}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onStartOnboarding();
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold text-center hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Start your project</span>
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

export default SiteHeader;
