import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { DonationModal } from "@/components/donation-modal";
import { 
  Menu, 
  Home, 
  FolderOpen, 
  BookOpen, 
  Sprout, 
  User, 
  LogOut,
  Heart
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import bonemeaLogo from "@assets/SkyBlock_items_enchanted_bonemeal_1752287919002.gif";

export default function MobileNav() {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/projects", label: "Projects", icon: FolderOpen },
    { href: "/greenhouse", label: "Greenhouse", icon: Sprout },
    { href: "/docs", label: "Documentation", icon: BookOpen },
  ];



  const closeSheet = () => setIsOpen(false);

  return (
    <header className="glass-card moss-texture border-b living-border px-4 py-3 md:hidden">
      <div className="flex items-center justify-between">
        {/* Logo and Title */}
        <Link href="/">
          <div className="flex items-center space-x-2">
            <img 
              src={bonemeaLogo} 
              alt="Bonemeal" 
              className="w-7 h-7 floating"
              style={{ imageRendering: 'pixelated' }}
            />
            <span className="text-lg font-semibold text-primary">Bonemeal</span>
          </div>
        </Link>

        {/* Hamburger Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="grow-button">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="glass-card moss-texture w-80 sm:w-96">
            <SheetHeader className="text-left mb-6">
              <SheetTitle className="flex items-center gap-3">
                <img 
                  src={bonemeaLogo} 
                  alt="Bonemeal" 
                  className="w-6 h-6 floating"
                  style={{ imageRendering: 'pixelated' }}
                />
                <span className="text-primary">Navigation</span>
              </SheetTitle>
            </SheetHeader>

            <div className="space-y-6">
              {/* User Info */}
              {isAuthenticated && user && (
                <div className="flex items-center space-x-3 p-3 bg-background/40 rounded-lg border border-primary/20">
                  <Avatar className="h-10 w-10">
                    <AvatarImage 
                      src={user.avatar || undefined} 
                      alt={user.username || 'User'} 
                    />
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {user.username?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {user.username || user.email}
                    </p>
                    <p className="text-xs text-muted-foreground">Logged in</p>
                  </div>
                </div>
              )}

              {/* Navigation Items */}
              <nav className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">Main Navigation</h3>
                {navItems.map(({ href, label, icon: Icon }) => (
                  <Link key={href} href={href}>
                    <Button
                      variant={location === href ? "default" : "ghost"}
                      className={`w-full justify-start gap-3 grow-button ${
                        location === href ? "moss-texture" : ""
                      }`}
                      onClick={closeSheet}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </Button>
                  </Link>
                ))}
              </nav>

              {/* Support Button */}
              <div className="pt-4 border-t border-border/40">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 grow-button"
                  onClick={() => {
                    setShowDonationModal(true);
                    closeSheet();
                  }}
                >
                  <Heart className="h-4 w-4 text-pink-500" />
                  Support Development
                </Button>
              </div>

              {/* Auth Actions */}
              {isAuthenticated ? (
                <div className="pt-4 border-t border-border/40">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3"
                    onClick={() => {
                      window.location.href = '/api/logout';
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="pt-4 border-t border-border/40">
                  <Button
                    className="w-full grow-button moss-texture"
                    onClick={() => {
                      window.location.href = '/api/login';
                    }}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Donation Modal */}
      <DonationModal open={showDonationModal} onOpenChange={setShowDonationModal} />
    </header>
  );
}