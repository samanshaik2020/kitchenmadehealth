export type PolicySection = { heading: string; paragraphs: string[]; id?: string };
export type PolicyPage = { title: string; description: string; sections: PolicySection[] };

export const policyPages: Record<string, PolicyPage> = {
  "privacy-policy": {
    title: "Privacy policy",
    description: "How Kitchen Made Health handles newsletter details, site visits, and calculator inputs.",
    sections: [
      { heading: "Who this policy covers", paragraphs: ["This policy explains the public Kitchen Made Health website and its editorial workspace. For privacy questions or requests, email hello@kitchenmadehealth.com. This policy was updated on 25 October 2026."] },
      { heading: "Information you choose to provide", paragraphs: ["If you join the mailing list, we store your email address, subscription status, signup time, and signup source in our publishing database. If you email us, the message and details you include are used to respond to your request. Please do not send medical records or other sensitive health information.", "Editor accounts use authentication services to manage sign-in and sessions. Reader access to the journal and calculators does not require an account."] },
      { heading: "Visits and browser storage", paragraphs: ["Our hosting and database providers process technical request information needed to deliver and protect the website. Article pages record an aggregate view count. Browser session storage is used to avoid counting the same article repeatedly during a session and to remember when you dismiss a suggestion.", "Calculator measurements and results are calculated in your browser and are not submitted to our application server. A saved calorie-plan code encodes your inputs, so treat a code you copy or share as information about those inputs. Your browser, device, extensions, and any external services you choose to use have their own privacy practices."] },
      { heading: "Advertising and external destinations", paragraphs: ["Some pages may load Google advertising services. Those services can process device, cookie, and advertising information under Google's own privacy choices and policies. External videos and retailer pages apply their own policies when you visit them. Our affiliate disclosure explains how referral links work.", "Review Google privacy information at https://policies.google.com/privacy and advertising choices at https://myadcenter.google.com/. Browser settings can also limit cookies and other tracking. Disabling cookies can affect editor sign-in."] },
      { heading: "Service providers and retention", paragraphs: ["We use Vercel for website hosting and Supabase for publishing data, files, and authentication. We keep mailing-list information while it is needed to manage subscriptions, unless you request removal. Operational records and backups may be retained for security, reliability, or other applicable obligations."] },
      { heading: "Your choices", paragraphs: ["To request access, correction, unsubscribe, or deletion of information you supplied, email hello@kitchenmadehealth.com. Include the email address concerned and the request, but do not send a password. We may ask for enough information to verify that a request relates to you.", "The public content and calculators are intended for adults. We do not ask children to submit health measurements or join a mailing list. Privacy rights can vary by location."] },
    ],
  },
  terms: {
    title: "Terms of use",
    description: "The scope and limits of the educational information and tools on Kitchen Made Health.",
    sections: [
      { heading: "Educational use", paragraphs: ["Kitchen Made Health publishes general information about food, home routines, and wellbeing. The website is not a healthcare service and does not provide diagnosis, treatment, or personalized medical advice. Read the medical disclaimer before using health content or calculator results."] },
      { heading: "Use of the website", paragraphs: ["You may use the public website for lawful reading and personal reference. Do not attempt to access another person's account, disrupt the service, upload malicious material, or reuse content in a way that infringes others' rights. An editor account does not authorize access to other users' private data."] },
      { heading: "External services and purchases", paragraphs: ["We may link to independent sources and retailers. Their terms, availability, prices, delivery, returns, and guarantees are controlled by those providers. A link does not mean that we can verify every statement on an external website. Check the seller's current terms before making a purchase."] },
      { heading: "Accuracy and corrections", paragraphs: ["Information can change, and calculators use simplified estimates. We aim to correct material errors when they are identified. Email hello@kitchenmadehealth.com with a page URL and the issue. No website can promise uninterrupted access or suitability for every reader's circumstances."] },
      { heading: "Content and updates", paragraphs: ["Unless a separate license is shown, original site text and design remain with their respective rights holders. Short quotations with attribution are welcome where permitted by applicable rules. Ask before reproducing a full article or using images whose rights you have not verified.", "These terms were updated on 25 October 2026. Material changes will be reflected on this page. Nothing here removes rights that cannot be excluded under applicable law."] },
    ],
  },
  "medical-disclaimer": {
    title: "Medical disclaimer",
    description: "Important limits on health articles, home-care suggestions, and calculator estimates.",
    sections: [
      { heading: "Information, not individual care", paragraphs: ["Articles and tools are for general education. They do not establish a clinician-patient relationship, diagnose a condition, or provide a treatment plan. A qualified healthcare professional who knows your circumstances is the right person to advise on symptoms, medicines, supplements, diet, and activity."] },
      { heading: "Medicines and home remedies", paragraphs: ["Do not start, stop, or replace prescribed treatment because of a website article, testimonial, quiz, or product page. Natural products can cause adverse effects and interact with medicines. Check a new supplement or herbal product with a qualified clinician or pharmacist, especially during pregnancy or breastfeeding, for a child, or with a long-term condition."] },
      { heading: "Calculator limitations", paragraphs: ["The calculators are broad adult screening and planning estimates. They are not suitable for children, pregnancy, or people with individualized clinical nutrition or fluid instructions. BMI does not account for every body composition or health circumstance. Calorie, body-fat, and water estimates should not be treated as prescriptions."] },
      { heading: "Getting help", paragraphs: ["Seek appropriate medical advice for new, persistent, worsening, or concerning symptoms. In an emergency, contact your local emergency service. Do not delay urgent care while using this site or waiting for an email response."] },
      { heading: "Review status", paragraphs: ["A source link is not an endorsement of Kitchen Made Health by the organization linked. We identify a medical reviewer only when that person has actually reviewed the specific material. General editorial attribution should not be interpreted as professional medical review."] },
    ],
  },
  "editorial-policy": {
    title: "Our editorial policy",
    description: "Who publishes Kitchen Made Health and how to interpret sources, updates, and review labels.",
    sections: [
      { heading: "The Kitchen Made Health editorial desk", id: "editorial-desk", paragraphs: ["Kitchen Made Health is an independently published educational website. Articles credited to our editorial desk are published under the site's responsibility; that byline is an organization name, not a medical qualification. We do not claim that these articles have been independently medically reviewed unless a named, qualified reviewer is identified on the article."] },
      { heading: "Sources and uncertainty", paragraphs: ["We favor public-health agencies, professional clinical organizations, and original research. An article's source list should point to the actual material used. We distinguish a supported finding from an early or uncertain result and avoid presenting a home remedy or supplement as a replacement for established care.", "General further-reading links help explain a topic; they are not a claim that every sentence on the site has been verified by the linked organization. Readers should check the date, population, and limitations of any study."] },
      { heading: "Drafting and review", paragraphs: ["Software, including AI tools, may assist with research organization, drafting, and editing. Responsibility for published content remains with the site publisher. Automated assistance is not a substitute for a qualified health professional's review. We do not invent reviewer names, qualifications, testimonials, or testing claims."] },
      { heading: "Commercial independence", paragraphs: ["Referral links may earn a commission, as explained in the affiliate disclosure. An affiliate arrangement does not provide evidence that a product treats a condition. Advertisements and retailer statements are separate from our editorial guidance. We do not claim personal product testing unless that testing has actually taken place."] },
      { heading: "Updates and corrections", paragraphs: ["Article pages show publication and update dates when available. A date marks an editorial change; it does not by itself mean a clinical review was performed. Send corrections to hello@kitchenmadehealth.com with the page URL, the statement concerned, and a reliable reference where possible.", "An unfinished article, placeholder offer, or unsupported claim should be corrected or held from publication. Our publishing checks help catch draft instructions and missing references before future publication."] },
    ],
  },
  "affiliate-disclosure": {
    title: "Affiliate disclosure",
    description: "How referral links and advertising may support Kitchen Made Health.",
    sections: [
      { heading: "Referral links", paragraphs: ["Some clearly identified product links may be affiliate links. If a qualifying purchase follows a link, Kitchen Made Health may earn a commission under the retailer's program. The retailer determines the price and terms; check the current offer yourself."] },
      { heading: "What a recommendation means", paragraphs: ["A commission is not evidence of medical benefit, a guarantee of safety, or proof that a product was personally tested. Educational articles, advertisements, and retailer claims should be evaluated separately. We identify sponsored links and do not publish placeholder purchase destinations as real offers."] },
      { heading: "Questions and corrections", paragraphs: ["Email hello@kitchenmadehealth.com if a link is broken, a disclosure is unclear, or a product claim needs correction. Product availability, prices, shipping, and guarantees can change without notice."] },
    ],
  },
  contact: {
    title: "Contact the editorial desk",
    description: "Send corrections, privacy requests, and website questions to Kitchen Made Health.",
    sections: [
      { heading: "Get in touch", paragraphs: ["Email hello@kitchenmadehealth.com for editorial corrections, questions about the website, privacy requests, or affiliate disclosures. Include a relevant page URL so we can identify the issue."] },
      { heading: "Health questions", paragraphs: ["We cannot provide personal medical advice or assess symptoms by email. Do not send medical records, passwords, or other sensitive information. For a personal health question, contact a qualified healthcare professional. For an emergency, contact your local emergency service."] },
      { heading: "Mailing-list requests", paragraphs: ["You can request unsubscribe or deletion of a mailing-list entry by emailing us from the address concerned. We may need to verify that a request relates to your information."] },
    ],
  },
};
