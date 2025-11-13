import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Globe, Menu, X } from "lucide-react";
import { Link } from "wouter";

const navItems = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Membership", path: "/membership" },
  { label: "Opportunities", path: "/opportunities" },
  { label: "News", path: "/news" },
  { label: "Contact", path: "/contact" },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent">
              <Globe className="w-6 h-6 text-accent-foreground" />
            </div>
            <span className="text-xl md:text-2xl font-display font-bold text-white">PEF</span>
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
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <Button
              className="bg-accent hover:bg-accent text-accent-foreground font-semibold"
              data-testid="button-join-now"
            >
              Join Now
            </Button>
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
            <Button
              className="w-full bg-accent hover:bg-accent text-accent-foreground font-semibold mt-4"
              data-testid="button-mobile-join"
            >
              Join Now
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
