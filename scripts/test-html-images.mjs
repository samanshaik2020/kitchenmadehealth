import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

// Use the project's TypeScript compiler without adding a separate test runner.
const source = readFileSync(new URL("../lib/html-images.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});
const imageHelpers = {};
new Function("exports", outputText)(imageHelpers);
const { uploadHtmlImage, listHtmlImages, deleteHtmlImage, validateHtmlImage, htmlImageErrorMessage, MAX_HTML_IMAGE_BYTES } = imageHelpers;

const editorId = "730cb6cc-85be-4a68-9b1f-344a75520c79";
function storageClient(files = [], options = {}) {
  const calls = [];
  return {
    calls,
    auth: {
      getUser: async () => ({ data: { user: options.signedOut ? null : { id: editorId } }, error: null }),
    },
    storage: {
      from(bucket) {
        assert.equal(bucket, "html-page-images");
        return {
          async upload(path, file, uploadOptions) {
            calls.push({ operation: "upload", path, file, options: uploadOptions });
            if (options.failure) return { error: options.failure };
            files.unshift({ id: crypto.randomUUID(), name: path.slice(editorId.length + 1) });
            return { error: null };
          },
          async list(folder, listOptions) {
            calls.push({ operation: "list", folder, options: listOptions });
            return { data: files.slice(0, listOptions.limit), error: options.failure ?? null };
          },
          async remove(paths) {
            calls.push({ operation: "remove", paths });
            if (options.failure) return { data: null, error: options.failure };
            if (options.deleteDenied) return { data: [], error: null };
            const removed = [];
            for (const path of paths) {
              const index = files.findIndex((file) => `${editorId}/${file.name}` === path);
              if (index !== -1) removed.push({ ...files.splice(index, 1)[0], name: path });
            }
            return { data: removed, error: null };
          },
          getPublicUrl(path) {
            return { data: { publicUrl: `https://storage.example/storage/v1/object/public/${bucket}/${path}` } };
          },
        };
      },
    },
  };
}

test("supported image formats and exact size boundary", () => {
  for (const type of ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]) {
    assert.equal(validateHtmlImage(new File(["image"], "photo", { type })), null);
  }
  assert.equal(validateHtmlImage(new File([new Uint8Array(MAX_HTML_IMAGE_BYTES)], "photo.png", { type: "image/png" })), null);
  assert.match(validateHtmlImage(new File([new Uint8Array(MAX_HTML_IMAGE_BYTES + 1)], "photo.png", { type: "image/png" })), /5 MB/);
  assert.match(validateHtmlImage(new File([], "empty.png", { type: "image/png" })), /empty/);
});

test("invalid files are rejected before any upload", async () => {
  const client = storageClient();
  for (const type of ["text/html", "image/svg+xml", "application/pdf", "constructor", ""]) {
    await assert.rejects(uploadHtmlImage(client, new File(["file"], "file.png", { type })), /Choose a JPG/);
  }
  assert.equal(client.calls.length, 0);
});

test("same filename creates unique stable URLs in the editor's folder", async () => {
  const client = storageClient();
  const file = new File(["image"], "../../Kitchen photo.svg", { type: "image/png" });
  const first = await uploadHtmlImage(client, file);
  const second = await uploadHtmlImage(client, file);
  assert.notEqual(first.publicUrl, second.publicUrl);
  for (const call of client.calls) {
    assert.equal(call.path.split("/").length, 2);
    assert.ok(call.path.startsWith(`${editorId}/`));
    assert.ok(call.path.endsWith(".png"));
    assert.equal(call.options.upsert, false);
    assert.equal(call.options.contentType, "image/png");
  }
});

test("a new library session retrieves uploaded links and ignores folders", async () => {
  const files = [];
  const uploaded = await uploadHtmlImage(storageClient(files), new File(["image"], "kitchen.webp", { type: "image/webp" }));
  files.push({ id: null, name: "folder" });
  const reopened = storageClient(files);
  const listed = await listHtmlImages(reopened);
  assert.equal(listed.length, 1);
  assert.equal(listed[0].publicUrl, uploaded.publicUrl);
  assert.equal(listed[0].name, "kitchen.webp");
  assert.equal(reopened.calls[0].folder, editorId);
  assert.deepEqual(reopened.calls[0].options.sortBy, { column: "created_at", order: "desc" });
});

test("signed-out sessions cannot upload, list, or delete images", async () => {
  const client = storageClient([], { signedOut: true });
  await assert.rejects(listHtmlImages(client), /sign in again/);
  await assert.rejects(uploadHtmlImage(client, new File(["image"], "photo.jpg", { type: "image/jpeg" })), /sign in again/);
  await assert.rejects(deleteHtmlImage(client, `${editorId}/photo.jpg`), /sign in again/);
  assert.equal(client.calls.length, 0);
});

test("deleting an uploaded image removes only that file from future library sessions", async () => {
  const files = [];
  const client = storageClient(files);
  const deleted = await uploadHtmlImage(client, new File(["image"], "first.png", { type: "image/png" }));
  const kept = await uploadHtmlImage(client, new File(["image"], "second.png", { type: "image/png" }));
  await deleteHtmlImage(client, deleted.path);
  const listed = await listHtmlImages(storageClient(files));
  assert.deepEqual(listed.map((image) => image.publicUrl), [kept.publicUrl]);
  assert.deepEqual(client.calls.find((call) => call.operation === "remove").paths, [deleted.path]);
});

test("another editor's image, folder paths, and traversal are rejected before deletion", async () => {
  const client = storageClient();
  for (const path of ["another-editor/photo.png", `${editorId}/../photo.png`, `${editorId}/folder/photo.png`, `${editorId}/`, `${editorId}/..`, `${editorId}/photo\\other.png`]) {
    await assert.rejects(deleteHtmlImage(client, path), /own library/);
  }
  assert.equal(client.calls.length, 0);
});

test("denied and failed deletions preserve the image and do not report success", async () => {
  const files = [];
  const uploaded = await uploadHtmlImage(storageClient(files), new File(["image"], "photo.png", { type: "image/png" }));
  await assert.rejects(deleteHtmlImage(storageClient(files, { deleteDenied: true }), uploaded.path), /image deletion SQL/);
  await assert.rejects(deleteHtmlImage(storageClient(files, { failure: new Error("Storage unavailable") }), uploaded.path), /Storage unavailable/);
  assert.equal((await listHtmlImages(storageClient(files)))[0].publicUrl, uploaded.publicUrl);
});

test("storage failures produce setup guidance rather than a false success URL", async () => {
  const failure = new Error("Bucket not found");
  const client = storageClient([], { failure });
  await assert.rejects(uploadHtmlImage(client, new File(["image"], "photo.png", { type: "image/png" })), /Bucket not found/);
  await assert.rejects(listHtmlImages(client), /Bucket not found/);
  assert.match(htmlImageErrorMessage(failure), /Run the supplied SQL in Supabase/);
});
