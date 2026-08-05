import karnak from "@/assets/karnak.jpg";
import luxorTemple from "@/assets/luxor-temple.jpg";
import valleyKings from "@/assets/valley-kings.jpg";
import hatshepsut from "@/assets/hatshepsut.jpg";
import nile from "@/assets/nile.jpg";
import balloons from "@/assets/balloons.jpg";
import hotel1 from "@/assets/hotel1.jpg";
import hotel2 from "@/assets/hotel2.jpg";
import hotel3 from "@/assets/hotel3.jpg";
import restaurant1 from "@/assets/restaurant1.jpg";
import restaurant2 from "@/assets/restaurant2.jpg";
import restaurant3 from "@/assets/restaurant3.jpg";

export type Attraction = {
  slug: string;
  name: string;
  shortName: string;
  bank: "East Bank" | "West Bank";
  era: string;
  image: string;
  tagline: string;
  description: string;
  highlights: string[];
  hours: string;
  ticket: string;
  bestTime: string;
  coords: { lat: number; lng: number };
};

export const attractions: Attraction[] = [
  {
    slug: "karnak-temple",
    name: "Karnak Temple Complex",
    shortName: "Karnak",
    bank: "East Bank",
    era: "c. 2000 BCE – 30 BCE",
    image: karnak,
    tagline: "The grandest temple complex ever built.",
    description:
      "A breathtaking open-air museum of pylons, sanctuaries and obelisks expanded by thirty pharaohs over two millennia. The Great Hypostyle Hall — 134 colossal columns carved with hieroglyphs — remains one of humanity's most ambitious architectural achievements.",
    highlights: ["Great Hypostyle Hall", "Sacred Lake", "Avenue of Sphinxes", "Sound & Light show at night"],
    hours: "6:00 – 17:30 daily",
    ticket: "EGP 450 (adult)",
    bestTime: "Early morning or evening",
    coords: { lat: 25.7188, lng: 32.6573 },
  },
  {
    slug: "luxor-temple",
    name: "Luxor Temple",
    shortName: "Luxor Temple",
    bank: "East Bank",
    era: "c. 1400 BCE",
    image: luxorTemple,
    tagline: "Where pharaohs were crowned, glowing at night.",
    description:
      "Built by Amenhotep III and Ramesses II, Luxor Temple connects to Karnak via the recently restored 2.7 km Avenue of Sphinxes. At dusk, golden floodlights bring the colonnades and the towering obelisk dramatically to life.",
    highlights: ["Obelisk of Ramesses II", "Court of Amenhotep III", "Avenue of Sphinxes"],
    hours: "6:00 – 21:00 daily",
    ticket: "EGP 400 (adult)",
    bestTime: "After sunset",
    coords: { lat: 25.6995, lng: 32.6391 },
  },
  {
    slug: "valley-of-the-kings",
    name: "Valley of the Kings",
    shortName: "Valley of the Kings",
    bank: "West Bank",
    era: "c. 1550 – 1070 BCE",
    image: valleyKings,
    tagline: "The royal burial ground of the New Kingdom.",
    description:
      "Sixty-three tombs carved deep into limestone hills sheltered the pharaohs of Egypt's golden age, including Tutankhamun, Ramesses VI and Seti I. Walk through chambers still alive with the bright pigments of original wall paintings.",
    highlights: ["Tomb of Tutankhamun", "Tomb of Seti I", "Tomb of Ramesses VI"],
    hours: "6:00 – 17:00 daily",
    ticket: "EGP 600 + tomb extras",
    bestTime: "Sunrise to beat the heat",
    coords: { lat: 25.7402, lng: 32.6014 },
  },
  {
    slug: "hatshepsut-temple",
    name: "Temple of Hatshepsut",
    shortName: "Hatshepsut",
    bank: "West Bank",
    era: "c. 1479 BCE",
    image: hatshepsut,
    tagline: "A terraced masterpiece against sheer cliffs.",
    description:
      "The mortuary temple of Egypt's most powerful female pharaoh rises in three colonnaded terraces from the desert floor at Deir el-Bahari. A perfect fusion of architecture and landscape that still feels strikingly modern.",
    highlights: ["Three sweeping terraces", "Punt Reliefs", "Chapel of Anubis"],
    hours: "6:00 – 17:00 daily",
    ticket: "EGP 360 (adult)",
    bestTime: "Early morning",
    coords: { lat: 25.7382, lng: 32.6064 },
  },
  {
    slug: "nile-felucca",
    name: "Felucca Sail on the Nile",
    shortName: "Nile Felucca",
    bank: "East Bank",
    era: "Timeless",
    image: nile,
    tagline: "Glide between East and West Bank under sail.",
    description:
      "A traditional wooden felucca is the oldest, slowest and most beautiful way to see Luxor. Drift past banana groves and date palms as the sun melts into the western desert behind the temples.",
    highlights: ["Sunset sail", "Banana Island stop", "Onboard mint tea"],
    hours: "Daily, by arrangement",
    ticket: "From EGP 300 / hour",
    bestTime: "Golden hour",
    coords: { lat: 25.6989, lng: 32.6418 },
  },
  {
    slug: "hot-air-balloon",
    name: "Hot Air Balloon over the West Bank",
    shortName: "Balloon Ride",
    bank: "West Bank",
    era: "Sunrise experience",
    image: balloons,
    tagline: "Float over temples and tombs at dawn.",
    description:
      "Lift off as the sun crests the eastern desert and drift silently above Hatshepsut's temple, the Colossi of Memnon, and the green ribbon of the Nile. The single most extraordinary 45 minutes of any Luxor visit.",
    highlights: ["Sunrise launch", "45 minute flight", "Hotel pickup included"],
    hours: "Pre-dawn departures",
    ticket: "From USD 90",
    bestTime: "October – April",
    coords: { lat: 25.7239, lng: 32.6014 },
  },
];

export type Hotel = {
  slug: string;
  name: string;
  area: string;
  rating: number;
  pricePerNight: number;
  image: string;
  description: string;
  amenities: string[];
};

export const hotels: Hotel[] = [
  {
    slug: "sofitel-winter-palace",
    name: "Sofitel Winter Palace",
    area: "Corniche el-Nil, East Bank",
    rating: 5,
    pricePerNight: 280,
    image: hotel1,
    description:
      "Belle Époque grande dame perched directly on the Nile, hosting royalty and Agatha Christie since 1886. Royal gardens, marble staircases and an indulgent Nile-view suite.",
    amenities: ["Nile-view rooms", "Heated pool", "Royal gardens", "Spa"],
  },
  {
    slug: "al-moudira-boutique",
    name: "Al Moudira Boutique Hotel",
    area: "West Bank oasis",
    rating: 5,
    pricePerNight: 210,
    image: hotel2,
    description:
      "A hand-built desert palace of vaulted domes, lanterns and antique mashrabiya screens, set in a palm grove minutes from the Valley of the Kings.",
    amenities: ["Boutique suites", "Palm courtyard", "Hammam", "Fine dining"],
  },
  {
    slug: "hilton-luxor-resort",
    name: "Hilton Luxor Resort & Spa",
    area: "North Karnak, East Bank",
    rating: 5,
    pricePerNight: 195,
    image: hotel3,
    description:
      "Modern resort with infinity pools cascading toward the Nile, an award-winning spa, and a sunset terrace overlooking the West Bank temples.",
    amenities: ["Infinity pool", "Riverside spa", "3 restaurants", "Gym"],
  },
];

export type Restaurant = {
  slug: string;
  name: string;
  cuisine: string;
  priceRange: "$" | "$$" | "$$$";
  image: string;
  description: string;
  highlights: string[];
};

export const restaurants: Restaurant[] = [
  {
    slug: "sofra-rooftop",
    name: "Sofra Rooftop",
    cuisine: "Modern Egyptian",
    priceRange: "$$",
    image: restaurant1,
    description:
      "Candlelit rooftop dining with a panoramic view of illuminated Luxor Temple. Slow-cooked tagines, fresh mezze and live oud most evenings.",
    highlights: ["Temple view", "Live oud", "Vegetarian menu"],
  },
  {
    slug: "1886-restaurant",
    name: "1886 Restaurant",
    cuisine: "French fine dining",
    priceRange: "$$$",
    image: restaurant2,
    description:
      "The signature room at the Winter Palace — gilded ceilings, white linen, and a tasting menu that blends classic French technique with Nile-valley ingredients.",
    highlights: ["Tasting menu", "Sommelier list", "Smart-elegant"],
  },
  {
    slug: "nile-tea-lounge",
    name: "Al-Sahaby Nile Tea Lounge",
    cuisine: "Cafe & desserts",
    priceRange: "$",
    image: restaurant3,
    description:
      "A riverside terrace for sweet mint tea, fresh karkadeh, and pistachio basbousa as the feluccas drift past at sunset.",
    highlights: ["Sunset views", "Local sweets", "Shisha lounge"],
  },
];

export type Itinerary = {
  slug: string;
  title: string;
  duration: string;
  vibe: string;
  days: { day: string; plan: string }[];
};

export const itineraries: Itinerary[] = [
  {
    slug: "essential-luxor-2-days",
    title: "Essential Luxor in 2 Days",
    duration: "2 days · 1 night",
    vibe: "First-timer, fast-paced",
    days: [
      {
        day: "Day 1 — East Bank",
        plan: "Sunrise at Karnak before the crowds. Brunch on the Nile. Afternoon nap. Sunset felucca, then Luxor Temple by floodlight followed by dinner on Sofra Rooftop.",
      },
      {
        day: "Day 2 — West Bank",
        plan: "Pre-dawn hot-air balloon. Valley of the Kings (Tutankhamun + Seti I). Hatshepsut at golden hour. Late lunch at Al Moudira, then return crossing by sunset.",
      },
    ],
  },
  {
    slug: "slow-luxor-5-days",
    title: "Slow Luxor — A 5 Day Immersion",
    duration: "5 days · 4 nights",
    vibe: "Romantic, unhurried",
    days: [
      { day: "Day 1", plan: "Settle into the Winter Palace. Evening walk along the Corniche, dinner at 1886." },
      { day: "Day 2", plan: "Karnak in depth with a private Egyptologist. Sound & Light show at night." },
      { day: "Day 3", plan: "Cross to the West Bank — Valley of the Kings, Valley of the Queens, Hatshepsut." },
      { day: "Day 4", plan: "Day trip to Dendera Temple. Spa afternoon. Sunset felucca with mezze on board." },
      { day: "Day 5", plan: "Sunrise balloon. Late breakfast. Bazaars of Souq al-Luxor before departure." },
    ],
  },
  {
    slug: "family-week",
    title: "Family Adventure Week",
    duration: "7 days · 6 nights",
    vibe: "Families with kids 8+",
    days: [
      { day: "Days 1–2", plan: "Hilton Luxor resort: pool days + Luxor Museum, Mummification Museum." },
      { day: "Day 3", plan: "Karnak with treasure-hunt guide for kids." },
      { day: "Day 4", plan: "West Bank highlights, Colossi of Memnon photo stop." },
      { day: "Day 5", plan: "Felucca picnic to Banana Island." },
      { day: "Day 6", plan: "Optional balloon (age 8+). Bazaar shopping for souvenirs." },
      { day: "Day 7", plan: "Slow morning, hotel checkout." },
    ],
  },
];
