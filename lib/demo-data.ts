import type { Category, Post } from "@/lib/types";

export const demoCategories: Category[] = [
  {
    id: "cat-blood-sugar",
    name: "Diabetes & blood sugar",
    slug: "diabetes-blood-sugar",
    description:
      "Practical, evidence-aware guidance for steadier blood sugar, nourishing meals, and everyday diabetes care.",
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
    id: "cat-remedies",
    name: "Home remedies",
    slug: "home-remedies",
    description:
      "Gentle, kitchen-rooted home remedies with clear limits, sensible precautions, and realistic expectations.",
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
    category_id: "cat-blood-sugar",
    title: "A Gentler Breakfast for Steadier Blood Sugar",
    slug: "breakfast-for-steadier-blood-sugar",
    excerpt:
      "Build a satisfying morning meal around protein, fibre, and familiar ingredients without turning breakfast into a calculation.",
    content: `
      <p>A steadier breakfast can still be comforting, quick, and recognisably yours. The aim is not a perfect formula but a plate that keeps you satisfied and works with your individual care plan.</p>
      <h2>Start with staying power</h2>
      <p>Protein and fibre can make a morning meal more satisfying. Eggs with vegetables, plain yoghurt with nuts, or lentils folded into a savoury breakfast are flexible starting points.</p>
      <blockquote>Use general guidance as a starting place, then follow the glucose targets and meal plan agreed with your qualified clinician.</blockquote>
      <h2>Keep the ritual simple</h2>
      <p>Prepare one component ahead, keep portions consistent while learning what works for you, and notice patterns rather than judging a single reading.</p>
    `,
    cover_image_url:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1600&q=85",
    seo_title: "Breakfast Ideas for Steadier Blood Sugar",
    seo_description:
      "Practical breakfast ideas built around protein, fibre, and satisfying everyday ingredients for steadier mornings.",
    published_at: "2026-07-18T09:00:00.000Z",
    created_at: "2026-07-16T09:00:00.000Z",
    updated_at: "2026-07-18T09:00:00.000Z",
    category: demoCategories[0],
  },
  {
    ...shared,
    id: "post-2",
    category_id: "cat-knives",
    title: "7 Chef's Knives We Would Happily Use Every Day",
    slug: "best-chefs-knives",
    excerpt:
      "Seven balanced, dependable knives for different hands, budgets, and cutting styles.",
    content: `
      <p>Your chef's knife is the most personal tool in the kitchen. Balance, profile, handle shape, and steel all matter, but only in relation to your hand and the way you move.</p>
      <h2>What we looked for</h2>
      <p>We prioritised predictable edge geometry, comfortable handles, solid quality control, and steel that is realistic to maintain at home.</p>
      <blockquote>A knife that feels natural will be safer, faster, and far more enjoyable than one chosen by specifications alone.</blockquote>
    `,
    cover_image_url:
      "https://images.unsplash.com/photo-1593618998160-e34014e67546?auto=format&fit=crop&w=1600&q=85",
    seo_title: "Best Chef's Knives for Everyday Cooking",
    seo_description:
      "A practical guide to choosing the best chef's knife for your hand, budget, and cooking style.",
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
      <p>If you use it three times a week, it earns the counter. Once a week earns an accessible cupboard. Anything less should be exceptional or reconsidered.</p>
      <h2>Our short list</h2>
      <ul><li>A quiet electric kettle</li><li>A compact food processor</li><li>A reliable toaster oven</li></ul>
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
    category_id: "cat-remedies",
    title: "A Sensible Kitchen Shelf for Simple Home Remedies",
    slug: "simple-home-remedies-kitchen-shelf",
    excerpt:
      "A small collection of soothing staples, plus the warning signs that mean a home remedy is not enough.",
    content: `
      <p>Home remedies are most useful when they are modest. Warm fluids, honey for an adult cough, saline, or a cool compress may offer comfort, but they do not replace diagnosis or treatment.</p>
      <h2>Choose comfort with clear limits</h2>
      <p>Keep labels, check allergies and medicine interactions, and avoid giving honey to a child under one year. Seek care for severe, persistent, or rapidly worsening symptoms.</p>
      <blockquote>A good home remedy supports comfort while leaving room for timely professional care.</blockquote>
    `,
    cover_image_url:
      "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=1600&q=85",
    seo_title: "Simple Home Remedies and When to Seek Care",
    seo_description:
      "Build a small, sensible home-remedy shelf and learn when symptoms need professional medical care.",
    published_at: "2026-06-26T09:00:00.000Z",
    created_at: "2026-06-24T09:00:00.000Z",
    updated_at: "2026-06-26T09:00:00.000Z",
    category: demoCategories[3],
  },
];
