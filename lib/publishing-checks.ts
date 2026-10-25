export function findPublishingIssues(content: string, requireSources = false) {
  const issues: string[] = [];
  const text = content.replace(/<[^>]+>/g, " ");
  if (/\[(?:author(?: name)?(?:\s*\/\s*team)?|date|affiliate links?|link the exact studies)[^\]]*\]|start writing your guide|sources to cite\s*\(|add ['’]medically reviewed|same window for (?:fb|google) compliance/i.test(text)) {
    issues.push("Remove draft placeholders and editing instructions before publishing.");
  }
  if (/\/AFFILIATE(?:\/CAMPAIGN)?\b|YOUR[_ -]AFFILIATE|target_self\s*[•·]/i.test(content)) {
    issues.push("Replace template affiliate links and internal notes before publishing.");
  }
  if (requireSources && !/<a\b[^>]*href\s*=\s*["']https:\/\/[^"']+["']/i.test(content)) {
    issues.push("Add a link to an authoritative source before publishing health guidance.");
  }
  return issues;
}
