export function findPublishingIssues(content: string) {
  const issues: string[] = [];
  const text = content.replace(/<[^>]+>/g, " ");
  if (/\[(?:author(?: name)?(?:\s*\/\s*team)?|date|affiliate links?|link the exact studies)[^\]]*\]|start writing your guide|sources to cite\s*\(|add ['’]medically reviewed|same window for (?:fb|google) compliance/i.test(text)) {
    issues.push("Remove draft placeholders and editing instructions before publishing.");
  }
  if (/\/AFFILIATE(?:\/CAMPAIGN)?\b|YOUR[_ -]AFFILIATE|target_self\s*[•·]/i.test(content)) {
    issues.push("Replace template affiliate links and internal notes before publishing.");
  }
  return issues;
}
