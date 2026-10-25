import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import ts from "typescript";

const require = createRequire(import.meta.url);
function loadModule(path, dependencies = {}) {
  const source = readFileSync(new URL(path, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  });
  const exports = {};
  new Function("exports", "require", outputText)(exports, (name) => {
    if (Object.hasOwn(dependencies, name)) return dependencies[name];
    if (name === "zod" || name === "sanitize-html") return require(name);
    throw new Error(`Unexpected dependency: ${name}`);
  });
  return exports;
}

const youtube = loadModule("../lib/youtube.ts");
const pdf = loadModule("../lib/post-pdfs.ts");
const { sanitizePostContent } = loadModule("../lib/post-content.ts", { "@/lib/youtube": youtube });
const videoId = "aB3_dE-4567";
const ownerId = "730cb6cc-85be-4a68-9b1f-344a75520c79";
const validPdf = () => new File(["%PDF-1.7\nexample"], "guide.pdf", { type: "application/pdf" });

function storageClient(options = {}) {
  const calls = [];
  return {
    calls,
    auth: { getUser: async () => ({ data: { user: options.signedOut ? null : { id: ownerId } }, error: null }) },
    storage: { from(bucket) {
      assert.equal(bucket, "post-pdfs");
      return {
        upload: async (path, file, uploadOptions) => {
          calls.push({ path, file, uploadOptions });
          return { error: options.failure ?? null };
        },
        info: async (path) => {
          calls.push({ path });
          return { data: options.info ?? { size: 100, contentType: "application/pdf" }, error: options.failure ?? null };
        },
      };
    } },
  };
}

test("YouTube watch, short, mobile, Shorts, live and embed URLs normalize to one ID", () => {
  for (const url of [
    `https://www.youtube.com/watch?v=${videoId}&t=30`,
    `https://youtu.be/${videoId}?si=tracking`,
    `https://m.youtube.com/watch?v=${videoId}`,
    `https://youtube.com/shorts/${videoId}`,
    `https://youtube.com/live/${videoId}`,
    `https://www.youtube.com/embed/${videoId}`,
    `https://www.youtube-nocookie.com/embed/${videoId}`,
  ]) assert.equal(youtube.getYouTubeVideoId(url), videoId, url);
  assert.equal(youtube.youtubeWatchUrl(videoId), `https://www.youtube.com/watch?v=${videoId}`);
});

test("article video sanitization keeps a normalized YouTube embed and removes hostile iframe inputs", () => {
  const clean = sanitizePostContent(`<div data-youtube-video=""><iframe src="https://youtu.be/${videoId}?autoplay=1" title="Cooking video" onload="alert(1)" srcdoc="bad"></iframe></div><p>Continue reading.</p>`);
  assert.ok(clean.includes(youtube.youtubeEmbedUrl(videoId)));
  assert.ok(clean.includes('data-youtube-video'));
  assert.ok(clean.includes('title="Cooking video"'));
  assert.ok(clean.includes('<p>Continue reading.</p>'));
  assert.doesNotMatch(clean, /autoplay|onload|srcdoc/);
  for (const src of ['javascript:alert(1)','https://evil.example/embed/'+videoId,'/dashboard','https://www.youtube-nocookie.com/redirect?url=https://evil.example']) {
    assert.doesNotMatch(sanitizePostContent(`<iframe src="${src}"></iframe>`), /<iframe/);
  }
  assert.doesNotMatch(sanitizePostContent('<script>alert(1)</script><img src="x" onerror="alert(1)">'), /script|onerror/);
});

test("PDF library lists only the signed-in owner's valid PDFs, including legacy paths", async () => {
  const rows = [
    {id:'one',name:'old-file.pdf',metadata:{size:120,mimetype:'application/pdf'}},
    {id:'two',name:'730cb6cc-85be-4a68-9b1f-344a75520c79-cooking-guide.pdf',metadata:{size:240,mimetype:'application/pdf'}},
    {id:'three',name:'folder/bad.pdf',metadata:{size:120,mimetype:'application/pdf'}},
    {id:'four',name:'wrong.pdf',metadata:{size:120,mimetype:'text/html'}},
    {id:'five',name:'large.pdf',metadata:{size:5_000_000,mimetype:'application/pdf'}},
    {id:'six',name:'missing.pdf',metadata:null},
    {id:null,name:'folder',metadata:null},
  ];
  const client = {auth:{getUser:async()=>({data:{user:{id:ownerId}}})},storage:{from:bucket=>{
    assert.equal(bucket,'post-pdfs');
    return {list:async(folder,options)=>{assert.equal(folder,ownerId);assert.equal(options.limit,100);return {data:rows,error:null};},getPublicUrl:path=>({data:{publicUrl:'https://storage.example/'+path}})};
  }}};
  const items = await pdf.listPostPdfs(client);
  assert.equal(items.length,2);
  assert.equal(items[1].name,'cooking-guide.pdf');
  assert.ok(items.every(item=>item.path.startsWith(ownerId+'/')));
  await assert.rejects(pdf.listPostPdfs(storageClient({signedOut:true})),/sign in again/);
});

test("unrelated, malformed, channel, playlist and hostile URLs are rejected", () => {
  for (const url of ["", videoId, "javascript:alert(1)", `https://youtube.com.evil.test/watch?v=${videoId}`, `https://evil.test/${videoId}`, `https://youtube.com@evil.test/watch?v=${videoId}`, `https://user@youtube.com/watch?v=${videoId}`, `https://youtube.com:8080/watch?v=${videoId}`, "https://youtube.com/playlist?list=123", "https://youtube.com/@kitchen", "https://youtu.be/short", `https://youtu.be/${videoId}/other`]) {
    assert.equal(youtube.getYouTubeVideoId(url), null, url);
  }
});

test("PDF limit accepts 4,999,999 bytes and rejects 5 MB and above", () => {
  for (const size of [pdf.PDF_SIZE_LIMIT - 1, pdf.PDF_SIZE_LIMIT, pdf.PDF_SIZE_LIMIT + 1]) {
    const result = pdf.validatePostPdf(new File([new Uint8Array(size)], "guide.pdf", { type: "application/pdf" }));
    if (size < pdf.PDF_SIZE_LIMIT) assert.equal(result, null);
    else assert.match(result, /below 5 MB/);
  }
});

test("empty PDFs, disguised files and bad signatures never reach Storage", async () => {
  const client = storageClient();
  for (const file of [
    new File([], "empty.pdf", { type: "application/pdf" }),
    new File(["%PDF-1.7"], "guide.html", { type: "application/pdf" }),
    new File(["%PDF-1.7"], "guide.pdf", { type: "text/html" }),
    new File(["not a pdf"], "guide.pdf", { type: "application/pdf" }),
  ]) await assert.rejects(pdf.uploadPostPdf(client, file));
  assert.equal(client.calls.length, 0);
});

test("PDF upload uses a unique owner path and returns the original filename", async () => {
  const client = storageClient();
  const first = await pdf.uploadPostPdf(client, validPdf());
  const second = await pdf.uploadPostPdf(client, validPdf());
  assert.notEqual(first.path, second.path);
  assert.ok(pdf.isPostPdfPath(first.path, ownerId));
  assert.equal(first.name, "guide.pdf");
  assert.equal(first.size, validPdf().size);
  assert.deepEqual(client.calls[0].uploadOptions, { contentType: "application/pdf", upsert: false });
});

test("signed-out and failed PDF uploads report failure", async () => {
  await assert.rejects(pdf.uploadPostPdf(storageClient({ signedOut: true }), validPdf()), /sign in again/);
  await assert.rejects(pdf.uploadPostPdf(storageClient({ failure: new Error("Storage offline") }), validPdf()), /Storage offline/);
});

test("PDF saves verify actual stored metadata and reject another owner's path", async () => {
  const attachment = { path: `${ownerId}/example.pdf`, name: "guide.pdf", size: 1 };
  assert.equal((await pdf.verifyPostPdf(storageClient(), ownerId, attachment)).size, 100);
  assert.equal(await pdf.verifyPostPdf(storageClient(), ownerId, null), null);
  const client = storageClient();
  for (const path of ["other/example.pdf", `${ownerId}/../example.pdf`, `${ownerId}/folder/example.pdf`, `${ownerId}/bad.html`]) {
    await assert.rejects(pdf.verifyPostPdf(client, ownerId, { ...attachment, path }), /own account/);
  }
  assert.equal(client.calls.length, 0);
  for (const info of [{ size: 5_000_000, contentType: "application/pdf" }, { size: 0, contentType: "application/pdf" }, { size: 100, contentType: "text/html" }, { contentType: "application/pdf" }]) {
    await assert.rejects(pdf.verifyPostPdf(storageClient({ info }), ownerId, attachment), /PDF below 5 MB/);
  }
  await assert.rejects(pdf.verifyPostPdf(storageClient({ failure: new Error("Missing") }), ownerId, attachment), /could not be found/);
});

function videoActions(options = {}) {
  const saved = [];
  const invalidations = [];
  const actions = loadModule("../app/(admin)/dashboard/videos/actions.ts", {
    "next/cache": { revalidatePath: (path) => invalidations.push(path), updateTag: (tag) => invalidations.push(tag) },
    "@/lib/admin-auth": {
      databaseUpgradeMessage: (message) => message,
      getAuthenticatedClient: async () => {
        if (options.signedOut) throw new Error("Please sign in again.");
        return { user: { id: ownerId }, supabase: { from: () => ({ upsert: async (rows) => { if (!options.failure) saved.push(...rows); return { error: options.failure }; } }) } };
      },
    },
    "@/lib/public-cache": { PUBLIC_YOUTUBE_CACHE_TAG: "public-youtube" },
    "@/lib/supabase/env": { isSupabaseConfigured: () => !options.unconfigured },
    "@/lib/youtube": youtube,
  });
  return { ...actions, saved, invalidations };
}

test("all six links save in slot order, and empty slots clear old links", async () => {
  const actions = videoActions();
  const form = new FormData();
  for (let slot = 1; slot <= 6; slot++) {
    form.set(`url_${slot}`, slot === 2 ? "" : `https://youtu.be/${videoId}`);
    form.set(`title_${slot}`, `Video ${slot}`);
  }
  const result = await actions.saveYouTubeVideos({}, form);
  assert.equal(result.success, true);
  assert.equal(actions.saved.length, 6);
  assert.deepEqual(actions.saved.map((row) => row.slot), [1, 2, 3, 4, 5, 6]);
  assert.equal(actions.saved[1].video_id, null);
  assert.equal(actions.saved[1].title, "");
  assert.ok(actions.invalidations.includes("/"));
  assert.ok(actions.invalidations.includes("public-youtube"));
});

test("invalid URLs and overlong titles return field errors without changing saved videos", async () => {
  const actions = videoActions();
  const form = new FormData();
  form.set("url_1", "https://example.com/video");
  form.set("title_2", "x".repeat(181));
  const result = await actions.saveYouTubeVideos({}, form);
  assert.equal(result.success, false);
  assert.ok(result.errors.url_1);
  assert.ok(result.errors.title_2);
  assert.equal(actions.saved.length, 0);
  assert.equal(actions.invalidations.length, 0);
});

test("YouTube auth, missing database, and write failures never report success", async () => {
  for (const options of [{ signedOut: true }, { unconfigured: true }, { failure: { message: "Database unavailable" } }]) {
    const actions = videoActions(options);
    const form = new FormData();
    form.set("url_1", `https://youtu.be/${videoId}`);
    const result = await actions.saveYouTubeVideos({}, form);
    assert.equal(result.success, false);
    assert.equal(actions.saved.length, 0);
    assert.equal(actions.invalidations.length, 0);
  }
});
