import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-midnight/60 mt-24">
      <div className="mx-auto max-w-7xl px-6 py-12 grid gap-10 md:grid-cols-2 lg:grid-cols-5">
        <div>
          <div className="font-display text-2xl text-gradient-gold">LUXOR AI</div>
          <p className="mt-3 text-sm text-muted-foreground max-w-xs">
            The intelligent companion for the world's greatest open-air museum.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gold mb-3">Explore</h4>
          <ul className="space-y-2 text-sm text-foreground/75">
            <li><Link to="/attractions" className="hover:text-gold">Attractions</Link></li>
            <li><Link to="/hotels" className="hover:text-gold">Hotels</Link></li>
            <li><Link to="/restaurants" className="hover:text-gold">Restaurants</Link></li>
            <li><Link to="/bazaars" className="hover:text-gold">Bazaars</Link></li>
            <li><Link to="/events" className="hover:text-gold">Events</Link></li>
            <li><Link to="/itineraries" className="hover:text-gold">Itineraries</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gold mb-3">Plan</h4>
          <ul className="space-y-2 text-sm text-foreground/75">
            <li><Link to="/map" className="hover:text-gold">Interactive Map</Link></li>
            <li><Link to="/ask-luxor" className="hover:text-gold">Ask Luxor AI</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gold mb-3">Business</h4>
          <ul className="space-y-2 text-sm text-foreground/75">
            <li><Link to="/businesses" className="hover:text-gold">Business Directory</Link></li>
            <li><Link to="/business/register" className="hover:text-gold">List your business</Link></li>
            <li><Link to="/business/login" className="hover:text-gold">Business sign in</Link></li>
            <li><Link to="/admin" className="hover:text-gold">Admin</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gold mb-3">Luxor, Egypt</h4>
          <p className="text-sm text-muted-foreground">
            Where the Nile splits the world into the land of the living and the land of the dead.
          </p>
        </div>
      </div>
      <div className="border-t border-border/40 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Luxor AI — Crafted for travelers and storytellers.
      </div>
    </footer>
  );
}
