import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut, LayoutDashboard, ChevronDown } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import logoImage from "@assets/image_1763355890421.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { label: "Home", path: "/" },
  { label: "Membership", path: "/membership" },
  { label: "Opportunities", path: "/opportunities" },
  { label: "Contact", path: "/contact" },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const { currentUser, userData, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-primary/95 backdrop-blur-sm shadow-lg" : "bg-gradient-to-r from-primary to-[hsl(213,58%,35%)]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center gap-2 hover-elevate rounded-md px-2 py-1" data-testid="link-home">
            <img 
              src={logoImage} 
              alt="PEF Logo" 
              className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover"
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/10"
                  data-testid={`link-nav-${item.label.toLowerCase()}`}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
            
            <DropdownMenu open={aboutOpen} onOpenChange={setAboutOpen} modal={false}>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="text-white hover:bg-white/10" 
                  data-testid="button-nav-about"
                  onMouseEnter={() => setAboutOpen(true)}
                  onMouseLeave={() => setAboutOpen(false)}
                >
                  About <ChevronDown className="ml-1 w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="min-w-[180px]"
                onMouseEnter={() => setAboutOpen(true)}
                onMouseLeave={() => setAboutOpen(false)}
              >
                <Link href="/about">
                  <DropdownMenuItem className="cursor-pointer text-base py-2.5" data-testid="link-nav-about">
                    About Us
                  </DropdownMenuItem>
                </Link>
                <Link href="/leadership">
                  <DropdownMenuItem className="cursor-pointer text-base py-2.5" data-testid="link-nav-leadership">
                    Leadership
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu open={mediaOpen} onOpenChange={setMediaOpen} modal={false}>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="text-white hover:bg-white/10" 
                  data-testid="button-nav-media"
                  onMouseEnter={() => setMediaOpen(true)}
                  onMouseLeave={() => setMediaOpen(false)}
                >
                  Media <ChevronDown className="ml-1 w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="min-w-[180px]"
                onMouseEnter={() => setMediaOpen(true)}
                onMouseLeave={() => setMediaOpen(false)}
              >
                <Link href="/media">
                  <DropdownMenuItem className="cursor-pointer text-base py-2.5" data-testid="link-nav-media">
                    News & Updates
                  </DropdownMenuItem>
                </Link>
                <Link href="/gallery">
                  <DropdownMenuItem className="cursor-pointer text-base py-2.5" data-testid="link-nav-gallery">
                    Gallery
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>

            {currentUser && (
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/10"
                  data-testid="link-nav-dashboard"
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            )}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-transparent border-white/20 hover:bg-white/10 text-white" data-testid="button-user-menu">
                    <User className="w-4 h-4 mr-2" />
                    {userData?.name || currentUser.displayName || currentUser.email}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/dashboard">
                    <DropdownMenuItem data-testid="menu-item-dashboard">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/edit-profile">
                    <DropdownMenuItem data-testid="menu-item-profile">
                      <User className="w-4 h-4 mr-2" />
                      Edit Profile
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem onClick={logout} data-testid="menu-item-logout">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-white hover:bg-white/10" data-testid="button-login">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-accent hover:bg-accent text-accent-foreground font-semibold" data-testid="button-join-now">
                    Join Now
                  </Button>
                </Link>
              </>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden bg-primary border-t border-white/10">
          <nav className="px-4 py-4 space-y-2">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-white/10"
                  onClick={() => setIsMobileMenuOpen(false)}
                  data-testid={`link-mobile-${item.label.toLowerCase()}`}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
            
            <Link href="/about">
              <Button
                variant="ghost"
                className="w-full justify-start text-white hover:bg-white/10"
                onClick={() => setIsMobileMenuOpen(false)}
                data-testid="link-mobile-about"
              >
                About
              </Button>
            </Link>
            <Link href="/leadership">
              <Button
                variant="ghost"
                className="w-full justify-start text-white hover:bg-white/10 pl-8"
                onClick={() => setIsMobileMenuOpen(false)}
                data-testid="link-mobile-leadership"
              >
                Leadership
              </Button>
            </Link>
            
            <Link href="/media">
              <Button
                variant="ghost"
                className="w-full justify-start text-white hover:bg-white/10"
                onClick={() => setIsMobileMenuOpen(false)}
                data-testid="link-mobile-media"
              >
                Media
              </Button>
            </Link>
            <Link href="/gallery">
              <Button
                variant="ghost"
                className="w-full justify-start text-white hover:bg-white/10 pl-8"
                onClick={() => setIsMobileMenuOpen(false)}
                data-testid="link-mobile-gallery"
              >
                Gallery
              </Button>
            </Link>
            {currentUser ? (
              <>
                <Link href="/dashboard">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-white hover:bg-white/10"
                    onClick={() => setIsMobileMenuOpen(false)}
                    data-testid="button-mobile-dashboard"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Link href="/edit-profile">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-white hover:bg-white/10"
                    onClick={() => setIsMobileMenuOpen(false)}
                    data-testid="button-mobile-profile"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-white/10"
                  onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                  data-testid="button-mobile-logout"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-white hover:bg-white/10"
                    onClick={() => setIsMobileMenuOpen(false)}
                    data-testid="button-mobile-login"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    className="w-full bg-accent hover:bg-accent text-accent-foreground font-semibold"
                    onClick={() => setIsMobileMenuOpen(false)}
                    data-testid="button-mobile-join"
                  >
                    Join Now
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
