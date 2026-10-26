type EditorialImage = { src: string; alt: string };

const photo = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=85`;

export const categoryImages: Record<string, EditorialImage> = {
  "diabetes-blood-sugar": { src: "/images/topics/balanced-meals.jpg", alt: "A colourful selection of fresh vegetables and balanced meal ingredients" },
  "home-remedies": { src: "/images/topics/tea-ritual.jpg", alt: "A warm cup of tea for a quiet moment at home" },
  "meditation-and-mindfulness": { src: "/images/topics/mindful-moments.jpg", alt: "A peaceful outdoor meditation practice" },
  "mental-wellness": { src: "/images/topics/forest-calm.jpg", alt: "Sunlight filtering through a quiet green forest" },
  "superfoods-and-nutrition": { src: "/images/topics/nourishing-bowl.jpg", alt: "A nourishing bowl with fresh vegetables and colourful ingredients" },
  "weight-loss-and-fitness": { src: "/images/topics/daily-movement.jpg", alt: "An outdoor run along a sunlit path" },
  "womens-health": { src: "/images/topics/outdoor-yoga.jpg", alt: "A moment of movement and stretching outdoors" },
  knives: { src: photo("photo-1593618998160-e34014e67546"), alt: "Kitchen knives and ingredients ready for cooking" },
  appliances: { src: photo("photo-1556909114-f6e7ad7d3136"), alt: "A bright and welcoming home kitchen" },
};

export function imageIdentity(src: string) {
  try { return new URL(src, "https://www.kitchenmadehealth.com").pathname; }
  catch { return src; }
}

export function isGenericHero(src: string) {
  return imageIdentity(src) === "/images/kitchen-made-health-hero.webp";
}

export function getCategoryImage(slug?: string): EditorialImage {
  return categoryImages[slug ?? ""] ?? categoryImages["superfoods-and-nutrition"];
}

export function getPostImage(post: { cover_image_url: string | null; cover_image_alt?: string | null; category?: { slug: string } | null }): EditorialImage {
  if (post.cover_image_url && isGenericHero(post.cover_image_url)) {
    return { src: "/images/topics/seasonal-salad.jpg", alt: "A colourful salad with fresh seasonal vegetables" };
  }
  if (post.cover_image_url && !isGenericHero(post.cover_image_url)) {
    return { src: post.cover_image_url, alt: post.cover_image_alt || "" };
  }
  return getCategoryImage(post.category?.slug);
}
