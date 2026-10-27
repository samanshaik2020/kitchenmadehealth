import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

function loadModule(path) {
  const source = readFileSync(new URL(path, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const exports = {};
  new Function("exports", outputText)(exports);
  return exports;
}
const { resolveSiteUrl, PRODUCTION_SITE_URL, serializeJsonLd } = loadModule("../lib/site-config.ts");
const { journalHref, normalizeSearchQuery, parsePage, searchFilterWords } = loadModule("../lib/article-search.ts");
const { findPublishingIssues } = loadModule("../lib/publishing-checks.ts");
const { actionErrorMessage } = loadModule("../lib/action-errors.ts");

for (const candidate of ["http://localhost:3000", "http://127.0.0.1:3000", "http://[::1]:3000", "javascript:alert(1)", "not a URL", "https://user:password@example.com"]) {
  assert.equal(resolveSiteUrl(candidate, true), PRODUCTION_SITE_URL);
}
assert.equal(resolveSiteUrl("https://kitchenmadehealth.com/path?query=1", true), PRODUCTION_SITE_URL);
assert.equal(resolveSiteUrl("http://localhost:3000", false), "http://localhost:3000");
assert.equal(resolveSiteUrl("https://www.kitchenmadehealth.com/", true), PRODUCTION_SITE_URL);
assert(!serializeJsonLd({title:"</script><script>alert(1)</script>"}).includes("<"));

assert.equal(normalizeSearchQuery(["  blood   sugar  "]), "blood sugar");
assert.equal(normalizeSearchQuery("a".repeat(200)).length, 100);
assert.equal(searchFilterWords('blood%,title.eq.secret("x")'), "blood title eq secret x");
for (const value of [undefined, "-2", "1.5", "NaN", "0"]) assert.equal(parsePage(value), 1);
assert.equal(parsePage("2"), 2);
assert.equal(parsePage("999999999999999999999999"), 10000);
const url = new URL(journalHref({category:"diabetes-blood-sugar",q:"food & sugar",page:2}),PRODUCTION_SITE_URL);
assert.equal(url.searchParams.get("q"),"food & sugar");
assert.equal(url.searchParams.get("category"),"diabetes-blood-sugar");
assert.equal(url.searchParams.get("page"),"2");
assert.equal(journalHref({page:1}),"/blog");

assert(findPublishingIssues('<p>[Author name / team] [date] Start writing your guide…</p>').length);
assert(findPublishingIssues('<a href="https://retailer.example/AFFILIATE/CAMPAIGN">Buy</a>').length);
assert.deepEqual(findPublishingIssues('<p>Health guidance without references.</p>'),[]);
assert.deepEqual(findPublishingIssues('<p>See <a href="https://www.cdc.gov/">the source</a>.</p>'),[]);
assert.match(actionErrorMessage({code:"PGRST116",message:"No rows"},"Failed"),/author account/);
assert.equal(actionErrorMessage({message:"A database field is missing"},"Failed"),"A database field is missing");
assert.equal(actionErrorMessage(null,"Failed"),"Failed");

function luminance(hex) {
  const channels=hex.match(/../g).map(c=>parseInt(c,16)/255).map(c=>c<=0.04045?c/12.92:((c+0.055)/1.055)**2.4);
  return channels[0]*0.2126+channels[1]*0.7152+channels[2]*0.0722;
}
function contrast(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);}
const css=readFileSync(new URL('../app/globals.css',import.meta.url),'utf8');
const accent=css.match(/--color-terracotta:\s*#([\da-f]{6})/i)[1];
assert(contrast(accent,'f6f2e9')>=4.5,'Small accent text must meet AA contrast on paper.');
assert(contrast(accent,'ece5d6')>=4.5,'Small accent text must meet AA contrast on cream.');
assert(contrast('ffffff',accent)>=4.5,'White button labels must meet AA contrast.');
console.log('Site audit regression checks passed: production URLs, search and pagination, publishing guards, JSON-LD escaping, and accent contrast.');
