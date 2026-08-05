import { Link } from "@tanstack/react-router";
import { Sparkles, Shield, LogOut, User, Menu } from "lucide-react";
import { useState } from "react";
import { useAuth, signOut } from "@/lib/auth";

const tourist = [
  { to: "/attractions", label: "Attractions" },
  { to: "/itineraries", label: "Itineraries" },
  { to: "/hotels", label: "Hotels" },
  { to: "/restaurants", label: "Restaurants" },
  { to: "/bazaars", label: "Bazaars" },
  { to: "/events", label: "Events" },
  { to: "/businesses", label: "Businesses" },
  { to: "/map", label: "Map" },
] as const;

export function Header() {
  const { user, roles } = useAuth();
  const [open, setOpen] = useState(false);
  const isAdmin = roles.includes("admin");
  const isBusiness = roles.includes("business");

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 backdrop-blur-xl bg-midnight/70">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-gold text-primary-foreground font-display text-lg font-bold shadow-gold">L</span>
          <span className="font-display text-xl tracking-wider">
            <span className="text-gradient-gold">LUXOR</span>
            <span className="ml-1 text-foreground/80 text-sm align-middle">AI</span>
          </span>
        </Link>

        <nav className="hidden xl:flex items-center gap-5 text-sm">
          {tourist.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-foreground/75 hover:text-gold transition-colors"
              activeProps={{ className: "text-gold" }}
            >
              {item.label}
            </Link>
          ))}
          {isAdmin && (
            <Link to="/admin" className="text-foreground/75 hover:text-gold inline-flex items-center gap-1" activeProps={{ className: "text-gold" }}>
              <Shield className="h-3.5 w-3.5" /> Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="hidden md:flex items-center gap-2">
              {isBusiness && (
                <Link to="/business/dashboard" className="rounded-full border border-gold/40 px-3 py-1.5 text-xs text-gold hover:bg-gold/10">
                  Dashboard
                </Link>
              )}
              <button onClick={() => signOut()} className="inline-flex items-center gap-1.5 text-xs text-foreground/70 hover:text-gold">
                <LogOut className="h-3.5 w-3.5" /> Sign out
              </button>
            </div>
          ) : (
            <Link to="/auth" className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1.5 text-xs text-foreground/80 hover:text-gold hover:border-gold/40">
              <User className="h-3.5 w-3.5" /> Sign in
            </Link>
          )}

          <Link
            to="/ask-luxor"
            className="hidden sm:inline-flex items-center gap-2 rounded-full bg-gradient-gold px-4 py-2 text-sm font-medium text-primary-foreground shadow-gold"
          >
            <Sparkles className="h-4 w-4" /> Ask Luxor AI
          </Link>

          <button onClick={() => setOpen((v) => !v)} className="xl:hidden p-2 text-foreground/70 hover:text-gold">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {open && (
        <div className="xl:hidden border-t border-border/60 bg-midnight/95 px-6 py-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            {tourist.map((item) => (
              <Link key={item.to} to={item.to} onClick={() => setOpen(false)} className="text-foreground/75 hover:text-gold py-1.5">
                {item.label}
              </Link>
            ))}
            <Link to="/ask-luxor" onClick={() => setOpen(false)} className="text-gold py-1.5">Ask Luxor AI</Link>
            {isBusiness && <Link to="/business/dashboard" onClick={() => setOpen(false)} className="text-gold py-1.5">Business Dashboard</Link>}
            {isAdmin && <Link to="/admin" onClick={() => setOpen(false)} className="text-gold py-1.5">Admin</Link>}
            {!user && <Link to="/auth" onClick={() => setOpen(false)} className="text-gold py-1.5">Sign in / Sign up</Link>}
            {user && (
              <button onClick={() => { setOpen(false); signOut(); }} className="text-left text-foreground/70 py-1.5">Sign out</button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
