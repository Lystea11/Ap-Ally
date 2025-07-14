// src/components/Header.tsx

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export function Header() {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-3 pl-4">
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
        
        <div className="flex items-center gap-3 pr-4">
          {loading ? (
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-20 rounded-md" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          ) : isAuthenticated && user ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end text-right">
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
                    className="relative h-10 w-10 rounded-full ring-2 ring-transparent hover:ring-primary/20 transition-all duration-200"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage 
                        src={user.photoURL ?? `https://placehold.co/40x40.png`} 
                        alt={user.displayName ?? "User avatar"} 
                        data-ai-hint="user avatar"
                        className="object-cover" 
                      />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {user.displayName?.charAt(0) ?? user.email?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
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
          ) : null}
        </div>
      </div>
    </header>
  );
}