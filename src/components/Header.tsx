// src/components/Header.tsx

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { BoarAvatar } from "@/components/BoarAvatar";
import { useGamification } from "@/hooks/useGamification";
import { useState } from "react";

export function Header() {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const { gamificationData, loading: gamificationLoading } = useGamification();
  const router = useRouter();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/");
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3 pl-2 sm:pl-4">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-3 transition-all duration-200 hover:opacity-80 group"
          >
            <div className="flex items-center justify-center w-9 h-9 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <span className="font-headline text-xl font-bold text-primary tracking-tight">
              AP Ally
            </span>
          </Link>
        </div>
        
        <div className="flex items-center gap-3 pr-2 sm:pr-4">
          {loading ? (
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-20 rounded-md" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          ) : isAuthenticated && user ? (
            <>
              {/* Desktop Navigation */}
              <div className="hidden sm:flex items-center gap-4">
                <div className="hidden md:flex flex-col items-end text-right">
                  <p className="text-sm font-medium text-foreground leading-none">
                    {user.displayName ?? 'Anonymous User'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {user.email}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="relative h-10 w-10 rounded-full ring-2 ring-transparent hover:ring-primary/20 transition-all duration-200 p-0"
                    >
                      <BoarAvatar 
                        boarLevel={gamificationData?.boar_level || 1}
                        showBadge={true}
                        fallbackText={user.displayName?.charAt(0) ?? user.email?.charAt(0) ?? "U"}
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 p-2" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal p-3">
                      <div className="flex flex-col space-y-2">
                        <p className="text-sm font-semibold leading-none text-foreground">
                          {user.displayName ?? 'Anonymous User'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground break-all">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="p-3 cursor-pointer hover:bg-destructive/10 focus:bg-destructive/10"
                    >
                      <LogOut className="mr-3 h-4 w-4 text-destructive" />
                      <span className="text-destructive font-medium">Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Mobile Navigation */}
              <div className="flex sm:hidden items-center gap-3">
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-10 w-10">
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-80 p-0">
                    <SheetHeader className="p-6 pb-4 border-b">
                      <SheetTitle className="text-left">
                        <div className="flex items-center gap-3">
                          <BoarAvatar 
                            boarLevel={gamificationData?.boar_level || 1}
                            size="lg"
                            showBadge={true}
                            fallbackText={user.displayName?.charAt(0) ?? user.email?.charAt(0) ?? "U"}
                          />
                          <div className="flex flex-col">
                            <p className="text-sm font-semibold text-foreground leading-none">
                              {user.displayName ?? 'Anonymous User'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </SheetTitle>
                    </SheetHeader>
                    <div className="px-6 py-4 space-y-4">
                      <Button 
                        variant="ghost" 
                        onClick={() => {
                          router.push("/dashboard");
                          setMobileMenuOpen(false);
                        }}
                        className="w-full justify-start text-left h-auto py-3"
                      >
                        <GraduationCap className="mr-3 h-5 w-5" />
                        <span>Dashboard</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        onClick={handleLogout}
                        className="w-full justify-start text-left h-auto py-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <LogOut className="mr-3 h-5 w-5" />
                        <span>Log out</span>
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}