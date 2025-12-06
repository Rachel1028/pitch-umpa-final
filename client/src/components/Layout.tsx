import { Link, useLocation } from "wouter";
import { Mic2, Upload, BarChart2, Settings, Menu, X, ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAnalysisPath = location === "/analyze" || location === "/compare";

  return (
    <div className="min-h-screen flex flex-col font-sans text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.5)]">
              <Mic2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              UMPA
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {/* Home */}
            <Link href="/">
              <a
                className={cn(
                  "flex items-center text-sm font-medium transition-colors hover:text-primary",
                  location === "/"
                    ? "text-primary drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                    : "text-muted-foreground"
                )}
              >
                <Mic2 className="w-4 h-4 mr-2" />
                홈
              </a>
            </Link>

            {/* Upload */}
            <Link href="/upload">
              <a
                className={cn(
                  "flex items-center text-sm font-medium transition-colors hover:text-primary",
                  location === "/upload"
                    ? "text-primary drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                    : "text-muted-foreground"
                )}
              >
                <Upload className="w-4 h-4 mr-2" />
                파일 업로드
              </a>
            </Link>

            {/* Analysis Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    "flex items-center text-sm font-medium transition-colors hover:text-primary gap-1",
                    isAnalysisPath
                      ? "text-primary drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                      : "text-muted-foreground"
                  )}
                >
                  <BarChart2 className="w-4 h-4" />
                  분석
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-card border-white/10 text-white">
                <DropdownMenuItem asChild>
                  <Link href="/analyze">
                    <a className="flex items-center w-full cursor-pointer hover:bg-white/10 p-2 rounded">
                      파일 분석
                    </a>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/compare">
                    <a className="flex items-center w-full cursor-pointer hover:bg-white/10 p-2 rounded">
                      비교 분석
                    </a>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Real-time Measurement */}
            <Link href="/realtime">
              <a
                className={cn(
                  "flex items-center text-sm font-medium transition-colors hover:text-primary",
                  location === "/realtime"
                    ? "text-primary drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                    : "text-muted-foreground"
                )}
              >
                <Mic2 className="w-4 h-4 mr-2" />
                실시간 측정
              </a>
            </Link>

            {/* Settings */}
            <Link href="/settings">
              <a
                className={cn(
                  "flex items-center text-sm font-medium transition-colors hover:text-primary",
                  location === "/settings"
                    ? "text-primary drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                    : "text-muted-foreground"
                )}
              >
                <Settings className="w-4 h-4 mr-2" />
                설정
              </a>
            </Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-muted-foreground hover:text-primary hover:bg-white/5"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-background/95 backdrop-blur-xl p-4 space-y-2 animate-in slide-in-from-top-5">
            <Link href="/">
              <a
                className={cn(
                  "flex items-center p-3 rounded-lg text-sm font-medium transition-all",
                  location === "/"
                    ? "bg-primary/10 text-primary shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Mic2 className="w-4 h-4 mr-2" />
                홈
              </a>
            </Link>

            <Link href="/upload">
              <a
                className={cn(
                  "flex items-center p-3 rounded-lg text-sm font-medium transition-all",
                  location === "/upload"
                    ? "bg-primary/10 text-primary shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Upload className="w-4 h-4 mr-2" />
                파일 업로드
              </a>
            </Link>

            <div className="px-3 py-2 text-xs text-muted-foreground font-semibold">분석</div>
            <Link href="/analyze">
              <a
                className={cn(
                  "flex items-center p-3 rounded-lg text-sm font-medium transition-all ml-4",
                  location === "/analyze"
                    ? "bg-primary/10 text-primary shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                파일 분석
              </a>
            </Link>

            <Link href="/compare">
              <a
                className={cn(
                  "flex items-center p-3 rounded-lg text-sm font-medium transition-all ml-4",
                  location === "/compare"
                    ? "bg-primary/10 text-primary shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                비교 분석
              </a>
            </Link>

            <Link href="/realtime">
              <a
                className={cn(
                  "flex items-center p-3 rounded-lg text-sm font-medium transition-all",
                  location === "/realtime"
                    ? "bg-primary/10 text-primary shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Mic2 className="w-4 h-4 mr-2" />
                실시간 측정
              </a>
            </Link>

            <Link href="/settings">
              <a
                className={cn(
                  "flex items-center p-3 rounded-lg text-sm font-medium transition-all",
                  location === "/settings"
                    ? "bg-primary/10 text-primary shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Settings className="w-4 h-4 mr-2" />
                설정
              </a>
            </Link>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 container py-8 animate-in fade-in duration-500">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-background/50 backdrop-blur-sm py-6 mt-auto">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2025 UMPA. Open Source Project.</p>
          <div className="flex items-center gap-4">
            <a href="https://github.com/Rachel1028/pitch-umpa.git" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Github</a>
            <a href="/proposal.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Documentation</a>
            <Link href="/team">
              <a className="hover:text-primary transition-colors">Team</a>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
