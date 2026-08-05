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

export const attractionImage: Record<string, string> = {
  "karnak-temple": karnak,
  "luxor-temple": luxorTemple,
  "valley-of-the-kings": valleyKings,
  "hatshepsut-temple": hatshepsut,
  "nile-felucca": nile,
  "hot-air-balloon": balloons,
  "medinet-habu": karnak,
  "luxor-museum": luxorTemple,
};

export const galleryImages = {
  karnak, luxorTemple, valleyKings, hatshepsut, nile, balloons,
  hotel1, hotel2, hotel3, restaurant1, restaurant2, restaurant3,
};

export function imageForAttractionSlug(slug: string | null | undefined): string {
  if (!slug) return karnak;
  return attractionImage[slug] ?? karnak;
}

export function imageForEvent(category: string | null | undefined): string {
  switch ((category ?? "").toLowerCase()) {
    case "music":
    case "festival":
      return luxorTemple;
    case "adventure":
      return balloons;
    case "religious":
      return karnak;
    default:
      return nile;
  }
}

export function imageForBusinessType(type: string | null | undefined, idx = 0): string {
  switch (type) {
    case "Hotel":
      return [hotel1, hotel2, hotel3][idx % 3];
    case "Restaurant":
      return [restaurant1, restaurant2, restaurant3][idx % 3];
    case "Bazaar":
      return [karnak, nile][idx % 2];
    case "Tour Company":
      return [balloons, valleyKings][idx % 2];
    default:
      return karnak;
  }
}
