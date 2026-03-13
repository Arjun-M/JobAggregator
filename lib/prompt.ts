import { JOB_TAXONOMY } from "./job_taxonomy";

export function buildExtractionPrompt(): string {
  const taxonomySummary = JSON.stringify({
    industries: Object.keys(JOB_TAXONOMY.industries),
    functionalRoles: Object.keys(JOB_TAXONOMY.functionalRoles),
    seniorityLevels: JOB_TAXONOMY.seniorityLevels,
    employmentTypes: JOB_TAXONOMY.employmentTypes,
    opportunityTypes: JOB_TAXONOMY.opportunityEventTypes,
    educationAssessment: JOB_TAXONOMY.educationAssessment
  }, null, 2);

  return `Extract detailed information from this image.
Return ONLY a flat JSON object.

STEP 1: RELEVANCE CHECK
Determine if this image is a valid Job Posting, Internship, Career Event, Educational Opportunity, or Exam/Certification Notification.
- RELEVANT: Job ads, hiring posts, hackathons, admission notices, exam schedules, scholarship grants.
- IRRELEVANT: Memes, personal photos, political news, crime news, product advertisements, random screenshots.

If IRRELEVANT, return ONLY:
{
  "is_relevant": false,
  "confidence": 1.0
}

STEP 2: EXTRACTION (If Relevant)
Extract the following fields.
- is_relevant: true
- title: The official job title or event name.
- about: Comprehensive info about the organization or context.
- description: Detailed role/event description.
- organization: Company/Institution name.
- location: City/Remote status.
- employment_type: Choose ONE from taxonomy.employmentTypes if applicable.
- salary: Salary range or stipend.
- validity_date: Deadline in YYYY-MM-DD.
- tags: Select 3-5 relevant tags strictly from the provided TAXONOMY.
- application_url: Direct link. MUST be a full, valid URL (e.g., "https://example.com/apply").
- website: Official website. MUST be a full, valid URL.
- email: Contact email. MUST be a valid email address.
- phone: Contact phone.
- confidence: Score (0.0 to 1.0).

TAXONOMY FOR TAGGING (Use these values for 'tags'):
${taxonomySummary}

Rules:
1. Return ONLY valid JSON.
2. For 'tags', use the exact strings from the taxonomy keys or values provided above.
3. Be strict with 'is_relevant'.
`;
}
