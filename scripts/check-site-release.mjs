import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const origin = process.argv[2] || 'http://127.0.0.1:3100';
const publicOrigin = 'https://www.kitchenmadehealth.com';
const articleSlugs = [
  'i-ranked-5-popular-blood-sugar-hacks-by-the-evidence-the-best-one-is-free',
  'how-to-read-food-labels-for-blood-sugar-control',
  '9-home-remedies-for-dandruff-that-actually-work',
  'hormonal-imbalance-in-women-signs-and-natural-support',
];
const policySlugs = ['privacy-policy','terms','medical-disclaimer','editorial-policy','affiliate-disclosure','contact'];
const results = [];
async function read(path, expected = 200, redirect = 'follow') {
  const response = await fetch(origin + path, { redirect, signal: AbortSignal.timeout(30000) });
  const body = await response.text();
  results.push({ path, status: response.status, url: response.url, bytes: Buffer.byteLength(body) });
  assert.equal(response.status, expected, `${path} status`);
  return { body, response };
}
const canonical = body => body.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/)?.[1];
const {body: home,response: homeResponse} = await read('/');
assert.equal(canonical(home), publicOrigin);
assert.match(home,/Skip to main content/);
assert.doesNotMatch(home, /href="\/products"|href="#"/);
for (const policy of policySlugs) assert.match(home,new RegExp(`href="/${policy}"`));
for (const header of ['content-security-policy','x-content-type-options','referrer-policy','x-frame-options']) assert.ok(homeResponse.headers.get(header), header);
const {body: sitemap}=await read('/sitemap.xml');
const locations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
assert.ok(locations.length > 70);
assert.ok(locations.every(url=>url===publicOrigin||url.startsWith(publicOrigin+'/')));
assert.ok(locations.includes(`${publicOrigin}/blog/${articleSlugs[0]}`));
assert.ok(!locations.some(url=>url.endsWith('/products')||url.endsWith('/glucotrust-german-version')));
for (const path of ['/robots.txt','/feed.xml']) {
  const {body}=await read(path);
  assert.doesNotMatch(body,/localhost|127\.0\.0\.1/);
  assert.ok(body.includes(publicOrigin));
}
for(const path of ['/blog','/blog?page=2','/health-calculators','/welcome',...policySlugs.map(p=>'/'+p)]) {
  const {body}=await read(path);
  assert.equal(canonical(body),publicOrigin+path);
}
const {body: search}=await read('/blog?q=blood');
assert.ok(search.includes('Results for'), 'Search results heading');
assert.match(search, /noindex/);
assert.match(search, /name="q"/);
const {body: noResults}=await read('/blog?q=zzzxxyyauditcheck');
assert.ok(noResults.includes('No matching stories'), 'Empty search result');
for(const slug of articleSlugs) {
  const {body}=await read('/blog/'+slug);
  assert.equal(canonical(body),publicOrigin+'/blog/'+slug);
  assert.match(body,/BlogPosting/);
  assert.match(body,/BreadcrumbList/);
  assert.doesNotMatch(body,/\[Author[^\]]*\]|\[affiliate links\]|Sources to cite\s*\(|Start writing your guide/);
  const article=body.match(/<div class="article-content"[^>]*>([\s\S]*?)<\/div>/)?.[1] || '';
  assert.ok((article.match(/href="https:\/\//g)||[]).length>=2,`${slug} source links`);
}
for (const slug of ['medicinal-garden-kit','why-do-cravings-hit-at-3-pm']) {
  const {body,response}=await read('/pages/'+slug);
  assert.doesNotMatch(body,/AFFILIATE\/CAMPAIGN|target_self|target=_self|spots remaining|limited stock/i);
  for(const policy of ['privacy-policy','terms','contact']) assert.ok(body.includes(publicOrigin+'/'+policy));
  assert.match(response.headers.get('content-security-policy')||'',/sandbox/);
}
const legacy=await read('/pages/glucotrust-german-version',308,'manual');
assert.ok(legacy.response.headers.get('location')?.endsWith('/pages/why-do-cravings-hit-at-3-pm'));
await read('/audit-nonexistent-page-2026-10-25',404);
const {body: products}=await read('/products');
assert.match(products,/noindex/);
const image=await fetch(origin+'/opengraph-image');
assert.equal(image.status,200);
assert.match(image.headers.get('content-type'),/image\/png/);
const dashboard=await read('/dashboard',307,'manual');
assert.ok(dashboard.response.headers.get('location')?.includes('/login'));
const evidence={checkedAt:new Date().toISOString(),origin,sitemapUrls:locations.length,results};
await fs.mkdir('artifacts/site-fixes-2026-10-25',{recursive:true});
await fs.writeFile(`artifacts/site-fixes-2026-10-25/${origin.includes('127.0.0.1')?'local':'live'}-release-check.json`,JSON.stringify(evidence,null,2));
console.log(JSON.stringify({passed:results.length+1,sitemapUrls:locations.length,origin},null,2));
