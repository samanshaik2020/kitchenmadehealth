import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import ts from "typescript";

const require = createRequire(import.meta.url);
function load(path, dependencies = {}) {
  const { outputText } = ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  });
  const exports = {};
  new Function("exports", "require", outputText)(exports, name => {
    if (Object.hasOwn(dependencies, name)) return dependencies[name];
    if (name === "zod" || name === "sanitize-html") return require(name);
    throw new Error(`Unexpected dependency: ${name}`);
  });
  return exports;
}
const youtube = load("../lib/youtube.ts");
const publishing = load("../lib/publishing-checks.ts");
const errors = load("../lib/action-errors.ts");
const sanitizer = load("../lib/post-content.ts", { "@/lib/youtube": youtube });

function postForm(overrides = {}) {
  const form = new FormData();
  const values = {
    title: "A practical kitchen guide", slug: "a-practical-kitchen-guide",
    content: '<p>A complete guide with <a href="https://www.nhs.uk/live-well/">a research source</a>.</p>',
    category_id: "730cb6cc-85be-4a68-9b1f-344a75520c79", status: "published",
    excerpt: "", cover_image_url: "", cover_image_alt: "", supporting_image_1_url: "",
    supporting_image_1_alt: "", supporting_image_2_url: "", supporting_image_2_alt: "",
    published_at: "", seo_title: "", seo_description: "", primary_keyword: "",
    tag_ids: "[]", affiliate_links: "[]", pdf_attachment: "null", ...overrides,
  };
  for (const [key, value] of Object.entries(values)) form.set(key, value);
  return form;
}

function actions(options = {}) {
  const writes = [];
  const invalidations = [];
  const current = { id: "post-1", author_id: "editor-1", status: "draft", published_at: null };
  const supabase = { from(table) {
    let operation = "read";
    let payload;
    const result = () => {
      if (table === "posts" && operation !== "read") {
        if (options.failure) return { data: null, error: options.failure };
        writes.push({ table, operation, payload });
      }
      return { data: table === "posts" ? { ...current, ...payload } : [], error: null };
    };
    const query = {
      select() { return query; }, eq() { return query; }, in() { return query; },
      insert(value) { operation = "insert"; payload = value; return query; },
      update(value) { operation = "update"; payload = value; return query; },
      delete() { operation = "delete"; return query; },
      single: async () => result(),
      then(resolve, reject) { return Promise.resolve(result()).then(resolve, reject); },
    };
    return query;
  } };
  const module = load("../app/(admin)/dashboard/actions.ts", {
    "next/cache": { revalidatePath: path => invalidations.push(path), updateTag: tag => invalidations.push(tag) },
    "next/navigation": { redirect: path => { throw new Error(`REDIRECT:${path}`); } },
    "@/lib/post-content": sanitizer,
    "@/lib/admin-auth": {
      getAuthenticatedClient: async () => {
        if (options.signedOut) throw new Error("Your session has expired. Please sign in again.");
        return { supabase, user: { id: "editor-1" } };
      },
      databaseUpgradeMessage: message => message,
      logActivity: async () => {},
    },
    "@/lib/supabase/env": { isSupabaseConfigured: () => true },
    "@/lib/public-cache": { PUBLIC_POSTS_CACHE_TAG: "public-posts" },
    "@/lib/post-pdfs": { PDF_SIZE_LIMIT: 5_000_000, verifyPostPdf: async (_client, _id, attachment) => attachment },
    "@/lib/utils": { slugify: value => value.toLowerCase().replace(/\s+/g, "-") },
    "@/lib/publishing-checks": publishing,
    "@/lib/action-errors": errors,
  });
  return { ...module, writes, invalidations };
}

test("an article publishes without a YouTube URL, PDF, or images", async () => {
  const api = actions();
  await assert.rejects(api.createPost({}, postForm()), /REDIRECT:\/dashboard\?created=1/);
  assert.equal(api.writes.length, 1);
  assert.equal(api.writes[0].payload.status, "published");
  assert.equal(api.writes[0].payload.pdf_attachment, null);
  assert.ok(api.writes[0].payload.published_at);
  assert.ok(api.invalidations.includes("/"));
});

test("an uninserted optional video field does not block an article update", async () => {
  const api = actions();
  await assert.rejects(api.updatePost("post-1", {}, postForm({ "article-youtube-url": "unfinished link" })), /REDIRECT:\/dashboard\?saved=1/);
  assert.equal(api.writes[0].payload.status, "published");
  assert.doesNotMatch(api.writes[0].payload.content, /youtube|unfinished link/);
});

test("publishing reports actual missing sources and categories and writes nothing", async () => {
  const api = actions();
  const result = await api.createPost({}, postForm({ category_id: "", content: "<p>A complete article without a source.</p>" }));
  assert.equal(result.success, false);
  assert.match(result.errors.category_id[0], /category/i);
  assert.match(result.errors.content[0], /source/i);
  assert.equal(api.writes.length, 0);
});

test("drafts can save without sources; schedules still validate their date", async () => {
  const draft = actions();
  await assert.rejects(draft.createPost({}, postForm({ status: "draft", content: "<p>A draft still being written.</p>" })), /REDIRECT/);
  assert.equal(draft.writes[0].payload.status, "draft");
  const scheduled = actions();
  const result = await scheduled.createPost({}, postForm({ status: "scheduled", published_at: "2020-01-01T09:00" }));
  assert.equal(result.success, false);
  assert.match(result.errors.published_at[0], /future/);
  assert.equal(scheduled.writes.length, 0);
});

test("authentication and database failures return actionable errors", async () => {
  for (const [options, message] of [[{ signedOut: true }, /sign in again/], [{ failure: { code: "23505" } }, /slug/], [{ failure: { code: "42501" } }, /permission/]]) {
    const api = actions(options);
    const result = await api.createPost({}, postForm());
    assert.equal(result.success, false);
    assert.match(result.message, message);
    assert.equal(api.writes.length, 0);
    assert.equal(api.invalidations.length, 0);
  }
});

test("the watchlist provides six valid distinct videos and respects saved cleared slots", async () => {
  assert.equal(youtube.DEFAULT_YOUTUBE_VIDEOS.length, 6);
  assert.equal(new Set(youtube.DEFAULT_YOUTUBE_VIDEOS.map(video => video.video_id)).size, 6);
  for (const video of youtube.DEFAULT_YOUTUBE_VIDEOS) assert.equal(youtube.getYouTubeVideoId(youtube.youtubeWatchUrl(video.video_id)), video.video_id);
  for (const data of [[], [{ slot: 1, video_id: null, title: "" }]]) {
    const { getYouTubeVideos } = load("../lib/youtube-data.ts", {
      "@/lib/public-cache": { PUBLIC_YOUTUBE_CACHE_TAG: "youtube" },
      "@/lib/supabase/env": { isSupabaseConfigured: () => true },
      "@/lib/supabase/public": { createPublicClient: () => ({ from: () => ({ select: () => ({ order: async () => ({ data, error: null }) }) }) }) },
      "@/lib/youtube": youtube,
    });
    assert.deepEqual(await getYouTubeVideos(), data.length ? data : youtube.DEFAULT_YOUTUBE_VIDEOS);
  }
});

test("known health categories use distinct topic images and a shared hero is replaced", () => {
  const images = load("../lib/editorial-images.ts");
  const slugs = ["diabetes-blood-sugar", "home-remedies", "meditation-and-mindfulness", "mental-wellness", "superfoods-and-nutrition", "weight-loss-and-fitness", "womens-health"];
  assert.equal(new Set(slugs.map(slug => images.getCategoryImage(slug).src)).size, 7);
  for (const slug of slugs) {
    const image = images.getPostImage({ cover_image_url: "https://www.kitchenmadehealth.com/images/kitchen-made-health-hero.webp", category: { slug } });
    assert.ok(!slugs.some(category => images.getCategoryImage(category).src === image.src));
    assert.equal(images.isGenericHero(image.src), false);
  }
});
