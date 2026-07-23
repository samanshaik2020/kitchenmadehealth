import type { Category, Post } from "@/lib/types";

export const demoCategories: Category[] = [
  {
    id: "cat-cookware",
    name: "Cookware",
    slug: "cookware",
    description: "Pans, pots, materials, and the tools that make stovetop cooking better.",
  },
  {
    id: "cat-knives",
    name: "Knives",
    slug: "knives",
    description: "Sharper buying advice, care tips, and practical knife skills.",
  },
  {
    id: "cat-appliances",
    name: "Appliances",
    slug: "appliances",
    description: "Honest guidance for the machines earning space on your counter.",
  },
  {
    id: "cat-guides",
    name: "Kitchen Guides",
    slug: "kitchen-guides",
    description: "Straightforward answers for a calmer, more capable kitchen.",
  },
];

const shared = {
  author_id: "demo-author",
  status: "published" as const,
  view_count: 0,
};

export const demoPosts: Post[] = [
  {
    ...shared,
    id: "post-1",
    category_id: "cat-cookware",
    title: "The Quiet Art of Choosing a Pan That Lasts",
    slug: "how-to-choose-a-pan-that-lasts",
    excerpt:
      "Forget the 20-piece sets. Here is how to choose one dependable pan around the way you actually cook.",
    content: `
      <p>A good pan should feel less like a purchase and more like a long-term kitchen companion. The right one heats predictably, releases food when you ask it to, and gets better as your instincts grow.</p>
      <h2>Begin with how you cook</h2>
      <p>If most dinners start with onions in oil, a wide stainless-steel skillet is remarkably versatile. If eggs and delicate fish are daily fixtures, add a small nonstick pan. High-heat searing calls for cast iron or carbon steel.</p>
      <blockquote>The best cookware is not the most expensive. It is the piece you understand well enough to reach for without thinking.</blockquote>
      <h2>Look beyond the label</h2>
      <p>Weight should feel substantial but manageable. Handles should stay comfortable when the pan is full. On clad stainless cookware, check that the conductive core runs up the walls rather than stopping at the base.</p>
      <h3>A simple three-pan foundation</h3>
      <ul><li>A 10–12 inch stainless skillet</li><li>A 2–3 quart saucepan with a lid</li><li>A cast-iron or enameled Dutch oven</li></ul>
      <p>Build slowly. A small collection of excellent tools will always outperform a cabinet crowded with compromises.</p>
    `,
    cover_image_url:
      "https://images.unsplash.com/photo-1584990347449-a750607b346d?auto=format&fit=crop&w=1600&q=85",
    seo_title: "How to Choose a Pan That Lasts | KitchenMadeHealth",
    seo_description:
      "Learn how to choose durable cookware based on your cooking style, materials, construction, and a practical three-pan foundation.",
    published_at: "2026-07-18T09:00:00.000Z",
    created_at: "2026-07-16T09:00:00.000Z",
    updated_at: "2026-07-18T09:00:00.000Z",
    category: demoCategories[0],
  },
  {
    ...shared,
    id: "post-2",
    category_id: "cat-knives",
    title: "7 Chef’s Knives We’d Happily Use Every Day",
    slug: "best-chefs-knives",
    excerpt:
      "Seven balanced, dependable knives for different hands, budgets, and cutting styles.",
    content: `
      <p>Your chef’s knife is the most personal tool in the kitchen. Balance, profile, handle shape, and steel all matter—but only in relation to your hand and the way you move.</p>
      <h2>What we looked for</h2>
      <p>We prioritized predictable edge geometry, comfortable handles, solid quality control, and steel that is realistic to maintain at home.</p>
      <h2>Before you buy</h2>
      <p>Whenever possible, hold the knife. Pinch the blade where it meets the handle and mimic a chopping motion. The right knife should disappear into your grip.</p>
      <blockquote>A knife that feels natural will be safer, faster, and far more enjoyable than one chosen by specifications alone.</blockquote>
    `,
    cover_image_url:
      "https://images.unsplash.com/photo-1593618998160-e34014e67546?auto=format&fit=crop&w=1600&q=85",
    seo_title: "Best Chef's Knives for Everyday Cooking",
    seo_description:
      "A practical guide to choosing the best chef’s knife for your hand, budget, and cooking style.",
    published_at: "2026-07-12T09:00:00.000Z",
    created_at: "2026-07-10T09:00:00.000Z",
    updated_at: "2026-07-12T09:00:00.000Z",
    category: demoCategories[1],
  },
  {
    ...shared,
    id: "post-3",
    category_id: "cat-appliances",
    title: "The Countertop Appliances Worth the Space",
    slug: "countertop-appliances-worth-the-space",
    excerpt:
      "A small-kitchen test: which appliances earn their footprint, and which belong in the cupboard?",
    content: `
      <p>Counter space is premium kitchen real estate. Every appliance living there should save meaningful time, improve a result, or make something you genuinely love.</p>
      <h2>The frequency test</h2>
      <p>If you use it three times a week, it earns the counter. Once a week earns an accessible cupboard. Anything less should be exceptional—or reconsidered.</p>
      <h2>Our short list</h2>
      <ul><li>A quiet electric kettle</li><li>A compact food processor</li><li>A reliable toaster oven</li></ul>
      <p>Choose appliances around routines, not aspirations. Your real Tuesday morning is a better buying guide than an imagined Sunday project.</p>
    `,
    cover_image_url:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1600&q=85",
    seo_title: "Countertop Appliances Worth Buying",
    seo_description:
      "Use our frequency test to decide which countertop kitchen appliances genuinely deserve the space.",
    published_at: "2026-07-05T09:00:00.000Z",
    created_at: "2026-07-03T09:00:00.000Z",
    updated_at: "2026-07-05T09:00:00.000Z",
    category: demoCategories[2],
  },
  {
    ...shared,
    id: "post-4",
    category_id: "cat-guides",
    title: "A Better Way to Organize a Working Kitchen",
    slug: "organize-a-working-kitchen",
    excerpt:
      "Design storage around movements, not categories, and make your kitchen noticeably easier to use.",
    content: `
      <p>A beautifully organized kitchen can still be frustrating to cook in. The most useful kitchens are arranged around small, repeated movements.</p>
      <h2>Create working zones</h2>
      <p>Keep oils, salt, and your most-used utensils near the stove. Store knives and boards near the preparation surface. Put plates where they can move easily to the table or dishwasher.</p>
      <blockquote>Organize for the cook you are on a busy evening, not the cook you are during a weekend reset.</blockquote>
      <h2>Protect the prime spaces</h2>
      <p>Eye-level shelves and top drawers are for tools used every day. Rarely used pieces can move higher, lower, or out of the kitchen entirely.</p>
    `,
    cover_image_url:
      "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=1600&q=85",
    seo_title: "How to Organize a Kitchen That Works",
    seo_description:
      "Organize your kitchen around practical work zones and everyday cooking movements.",
    published_at: "2026-06-26T09:00:00.000Z",
    created_at: "2026-06-24T09:00:00.000Z",
    updated_at: "2026-06-26T09:00:00.000Z",
    category: demoCategories[3],
  },
  {
    ...shared,
    id: "post-5",
    category_id: "cat-cookware",
    title: "Stainless Steel, Cast Iron, or Carbon Steel?",
    slug: "stainless-vs-cast-iron-vs-carbon-steel",
    excerpt:
      "Three excellent materials, three distinct personalities. Here’s where each one shines.",
    content: `
      <p>No single cookware material does everything best. Understanding the tradeoffs makes it easier to choose a pan for a job—and to enjoy using it.</p>
      <h2>Stainless steel</h2><p>Responsive, durable, and ideal for pan sauces. It rewards good heat control.</p>
      <h2>Cast iron</h2><p>Excellent heat retention for searing and baking, with a surface that improves through use.</p>
      <h2>Carbon steel</h2><p>A lighter, more responsive cousin to cast iron that seasons beautifully and moves easily from stovetop to oven.</p>
    `,
    cover_image_url:
      "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=1600&q=85",
    seo_title: "Stainless Steel vs Cast Iron vs Carbon Steel",
    seo_description:
      "Compare stainless steel, cast iron, and carbon steel cookware to find the best material for each cooking task.",
    published_at: "2026-06-19T09:00:00.000Z",
    created_at: "2026-06-18T09:00:00.000Z",
    updated_at: "2026-06-19T09:00:00.000Z",
    category: demoCategories[0],
  },
  {
    ...shared,
    id: "post-6",
    category_id: "cat-knives",
    title: "How to Keep a Sharp Knife Sharp",
    slug: "how-to-keep-a-knife-sharp",
    excerpt:
      "A simple routine for honing, sharpening, washing, and storing the tool you use most.",
    content: `
      <p>Knife care is less about rescue and more about rhythm. A few easy habits protect the edge and reduce how often serious sharpening is needed.</p>
      <h2>Use a forgiving board</h2><p>Wood and quality rubber boards are gentle on an edge. Glass, marble, and ceramic surfaces blunt it quickly.</p>
      <h2>Hone lightly, sharpen deliberately</h2><p>Honing realigns an edge; sharpening removes steel to create a new one. A few light honing passes can be routine. Full sharpening might happen only a few times a year.</p>
    `,
    cover_image_url:
      "https://images.unsplash.com/photo-1566454419290-57a0589c9fa2?auto=format&fit=crop&w=1600&q=85",
    seo_title: "How to Keep Kitchen Knives Sharp",
    seo_description:
      "Keep your chef’s knife sharp with the right cutting board, honing routine, sharpening schedule, and storage.",
    published_at: "2026-06-10T09:00:00.000Z",
    created_at: "2026-06-08T09:00:00.000Z",
    updated_at: "2026-06-10T09:00:00.000Z",
    category: demoCategories[1],
  },
];
