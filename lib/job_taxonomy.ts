// lib/job_taxonomy.ts
// This file contains a comprehensive taxonomy for classifying job-like postings, opportunities, events, and related content.
// It's structured for multi-label tagging, allowing flexible and sensible filtering.

export const JOB_TAXONOMY = {
  employmentTypes: [
    "Full-time (permanent)",
    "Part-time",
    "Contract (fixed-term)",
    "Freelance / gig / independent contractor",
    "Temporary / seasonal",
    "Fixed-term / project-based",
    "Probationary / trial",
    "Casual / on-call",
    "Zero-hour (or flexible-hours)",
    "Job-share",
  ],
  opportunityEventTypes: [
    "Internship (paid / unpaid / summer / industrial)",
    "Apprenticeship / traineeship / apprenticeship schemes",
    "Graduate / management trainee / campus hiring",
    "Fellowship (research / policy / industry fellowships)",
    "Residency / clinical residency / internship (medical)",
    "Postdoctoral position (postdoc)",
    "Volunteer / pro-bono / NGO placements",
    "Part-time/adjunct teaching positions",
    "Contracted research / consultancy engagements",
    "Hackathon / coding competition / ideathon / datathon",
    "Case competition / business plan contest / startup pitch contest",
    "Bootcamp (coding bootcamp, design bootcamp)",
    "Training camp / skill camp (e.g., sales camp, leadership camp)",
    "Short course / MOOC / online course / on-campus course",
    "Certification program / credentialing course (paid or free)",
    "Exam / entrance test / standardized test (e.g., licensing exam)",
    "Assessment centre / recruiter assessment / technical test",
    "Workshop / seminar / masterclass / clinic",
    "Conference / symposium / summit / congress (with hiring booths)",
    "Career fair / job fair / campus drive / placement event",
    "Walk-in interview / open interview / recruitment drive",
    "Recruitment agency listing / headhunter assignment",
    "Hackweek / innovation week / sprint / design sprint",
    "Study program / continuing education / professional development (CPD)",
    "Micro-internship / microtask / short-term gig platform task",
    "Mentorship program / shadowing / practicum / field placement",
    "Scholarship / grant opportunity (education-focused)",
    "Accelerator / incubator cohort / startup accelerator program",
    "Talent challenge / coding challenge platform listing (HackerRank, CodeChef, etc.)",
    "Trials & auditions (creative roles: actor, musician, model)",
    "Open call / tender / RFP (consulting, contracting bids)",
    "Fellowship cohorts / lab rotations / visiting researcher appointments",
    "Certification exams (professional bodies)",
    "Licensing / licensing renewals (e.g., medical, legal, pilot)",
    "Internal mobility posting / internal rotation / secondment",
    "On-site training / safety training / compliance training",
    "Campus placement (on-campus interviews & offers)",
  ],
  industries: {
    "Information Technology & Software": [
      "Frontend", "Backend", "Full-stack", "Mobile", "DevOps", "Site Reliability", "Cloud",
      "Embedded", "QA", "Test Automation", "Security", "Blockchain", "Web3", "Game Dev",
      "AR/VR", "IoT", "Edge", "MLOps", "AI", "Machine Learning", "Data Science", "Data Engineering",
      "Product Management", "Product Design", "UX", "UI", "Interaction Design", "Service Design"
    ],
    "Hardware & Electronics": ["Semiconductor", "Embedded Systems"],
    "Finance & Banking": ["Retail Banking", "Investment Banking", "Fintech", "Insurance", "Accounting", "Audit"],
    "Consulting": ["Management Consulting", "Strategy Consulting", "IT Consulting"],
    "Legal & Compliance": ["Paralegal", "Regulatory Affairs"],
    "Healthcare & Medical": [
      "Doctors", "Nurses", "Allied Health", "Pharmacists", "Clinical Trials", "Medical Lab",
      "Radiology", "Telemedicine"
    ],
    "Pharma / Biotech / Life Sciences": ["Research Labs"],
    "Education & Academia": ["K12", "Colleges", "Universities", "EdTech"],
    "Government / Public Sector": ["Civil Services", "Policy", "Urban Planning"],
    "Nonprofit / Social Impact": ["NGO", "CSR"],
    "Marketing & Advertising": ["Growth Marketing", "SEO", "SEM", "Content Marketing", "Social Media"],
    "Sales": ["Business Development", "Account Management", "Channel Sales"],
    "Human Resources": ["Talent Acquisition", "People Operations", "L&D", "Payroll"],
    "Operations": ["Supply Chain", "Logistics", "Procurement", "Fleet Management", "Warehouse Management"],
    "Manufacturing & Production": ["Industrial", "Plant Operations", "Quality Control"],
    "Construction": ["Civil Engineering", "Architecture", "Real Estate"],
    "Energy & Utilities": ["Oil & Gas", "Renewable Energy", "Power Generation", "Nuclear Energy"],
    "Automotive & Mobility": ["EVs", "Automotive Engineering", "Ride-sharing"],
    "Hospitality & Travel": ["Food & Beverage", "Tourism"],
    "Retail & E-commerce": ["Merchandising", "Visual Merchandising"],
    "Media & Entertainment": ["Film", "TV", "Radio", "Broadcasting", "Gaming"],
    "Arts & Creative": ["Design", "Photography", "Illustration", "Animation"],
    "Sports & Fitness": ["Coaching", "Wellness"],
    "Agriculture": ["AgriTech", "Food Processing"],
    "Telecommunications": ["ISP", "Network Engineering"],
    "Security & Defense": ["Aerospace", "National Security"],
    "Environmental": ["Sustainability", "Climate Tech", "Conservation"],
    "Facilities Management": ["Property Management"],
    "Consumer Goods": ["FMCG", "Beauty", "Fashion"],
    "Biotechnology": ["Clinical Research Organizations (CROs)"],
    "Research Institutes": ["Think Tanks"],
    "Others / Cross-domain": [] // Placeholder for custom or less categorized industries
  },
  functionalRoles: {
    "Engineering / Technical": [
      "Software Engineer (Frontend)", "Software Engineer (Backend)", "Software Engineer (Fullstack)",
      "Systems Engineer", "DevOps Engineer", "Cloud Engineer", "SRE", "QA Engineer", "Test Engineer",
      "QA Automation Engineer", "Data Engineer", "Data Analyst", "Data Scientist", "ML Engineer",
      "Security Engineer", "InfoSec", "SOC Analyst", "Pen Tester", "Embedded Engineer",
      "Firmware Engineer", "Hardware Engineer", "Network Engineer", "Telecom Engineer",
      "DBA", "Storage Engineer"
    ],
    "Product & Design": [
      "Product Manager", "Product Owner", "Program Manager", "UX Researcher", "UX Designer",
      "UI Designer", "Visual Designer", "Industrial Designer", "Service Designer"
    ],
    "Management & Leadership": [
      "Team Lead", "Tech Lead", "Engineering Manager", "Director", "VP", "C-level",
      "Project Manager", "Program Manager", "Delivery Manager"
    ],
    "Business & Strategy": [
      "Business Analyst", "Strategy Analyst", "Management Consultant", "Operations Manager",
      "Supply Chain Manager"
    ],
    "Sales & Marketing": [
      "SDR", "BDR", "Account Executive", "Account Manager", "Growth Marketer", "Content Marketer",
      "SEO Specialist", "PPC Specialist", "Social Media Manager", "Brand Manager",
      "Product Marketing Manager"
    ],
    "Creative & Content": [
      "Copywriter", "Content Writer", "Editor", "Journalist", "Creative Director", "Art Director",
      "Photographer", "Videographer"
    ],
    "Customer-facing roles": [
      "Customer Success Manager", "Support Engineer", "Helpdesk", "Call Center Representative"
    ],
    "HR & People": [
      "Recruiter", "Talent Sourcer", "HRBP", "L&D Specialist"
    ],
    "Finance & Legal": [
      "Accountant", "Financial Analyst", "Controller", "Tax Specialist", "Legal Counsel",
      "Compliance Officer", "Paralegal"
    ],
    "Science & Research": [
      "Lab Technician", "Research Associate", "Scientist", "Principal Investigator"
    ],
    "Healthcare & Clinical": [
      "Doctor", "Nurse", "Allied Health Professional", "Therapist", "Clinician", "Clinical Researcher"
    ],
    "Education & Training": [
      "Lecturer", "Instructor", "Trainer", "Teaching Assistant", "Tutor"
    ],
    "Other skilled trades": [
      "Electrician", "Plumber", "Carpenter", "Machinist", "Welder"
    ],
    "Blue-collar / gig roles": [
      "Driver", "Delivery Personnel", "Warehouse Picker", "Field Technician"
    ],
    "Specialist roles": [
      "UX Writer", "Localization Specialist", "Accessibility Specialist", "Procurement Specialist",
      "Grant Writer", "Patent Agent"
    ]
  },
  seniorityLevels: [
    "Internship / Student / Trainee",
    "Entry-level / Junior / Fresher",
    "Intermediate / Associate / Mid-level",
    "Senior / Experienced / Lead",
    "Principal / Staff / Architect / Distinguished Engineer",
    "Manager / Senior Manager / Director / VP",
    "Executive / C-level (CEO, CTO, CFO)",
    "Individual contributor",
    "People manager"
  ],
  workModeLogistics: [
    "On-site / office-based",
    "Remote (fully remote)",
    "Hybrid (days in office + remote)",
    "Work from anywhere (geo-agnostic)",
    "Shift-based (night shift, rotational shift)",
    "Rotational posting (R&D rotations, graduate rotations)",
    "Fieldwork / travel-heavy",
    "Relocation required / relocation assistance offered",
    "Visa sponsorship available / not available / open to international candidates"
  ],
  compensationContract: [
    "Paid", "Unpaid", // for internships
    "Salary band", "Hourly", "Per-project", "Stipend",
    "Equity component (stock options / ESOP)",
    "Bonus / commission / performance incentives",
    "Allowances (housing, transport, relocation)",
    "Stipend / fellowship stipend / grant amount",
    "Paid time off / benefits / healthcare / insurance / pension"
  ],
  educationAssessment: [
    "High-school", "Diploma", "Bachelors", "Masters", "PhD", "MD",
    "PMP", "CFA", "CA", "ACCA", "CISSP", "AWS Certs", "GCP Certs", "Azure Certs",
    "Medical License", "Bar Exam", "Pilot License", "Engineering Council Registration",
    "GATE", "GRE", "GMAT", "CAT", "JEE", "NEET", // Region-specific entrance exams
    "CompTIA", "Cisco Certs", "Microsoft Certs", "Oracle Certs",
    "Skill Assessment Tests", "Technical Screening", "Coding Tests", "Psychometric Tests",
    "Continuing Professional Development (CPD)", "Mandatory Compliance Training",
    "Language Proficiency Tests (IELTS, TOEFL)",
    "Hackathon Results", "Challenge Badges", "Platform Certifications (Kaggle, Codeforces)",
    "Internal Competency Assessment", "Promotion Assessment Center"
  ],
  recruitmentChannels: [
    "Direct company posting / corporate careers page",
    "Job board listing (Indeed, Naukri, LinkedIn, Monster)",
    "Campus recruitment / placement cell",
    "Recruitment agency / headhunter / staffing firm",
    "Employee referral / internal posting",
    "Social media hiring (Twitter/X, LinkedIn posts)",
    "Freelance marketplaces (Upwork, Fiverr)",
    "Microtask platforms (Amazon MTurk, CrowdFlower)",
    "Niche community postings (GitHub, Stack Overflow Jobs, Dribbble, Behance)",
    "Government job portals / public service commission notices",
    "Classified ads / newspaper clipping",
    "Email outreach / targeted hiring campaign",
    "Events & meetups (hackathons, conferences)"
  ],
  miscNiche: [
    "Hackathon", "Datathon", "Ideathon",
    "Bootcamp", "Short-term intensive",
    "Camp (training camp, coding camp, summer camp)",
    "Course", "MOOC", "Certification",
    "Exam", "Entrance-test", "Recruitment-test",
    "Scholarship", "Grant", "Stipend",
    "Fellowship", "Residency", "Postdoc",
    "Internship type: remote", "Internship type: on-site", "Internship type: stipend", "Internship type: unpaid",
    "Recruitment urgency: immediate joiner", "Recruitment urgency: ASAP", "Recruitment urgency: within 15 days", "Recruitment urgency: notice period ok",
    "Interview format: technical interview", "Interview format: HR interview", "Interview format: panel", "Interview format: one-on-one",
    "Interview format: take-home test", "Interview format: coding test", "Interview format: live coding", "Interview format: whiteboard",
    "Interview format: video interview", "Interview format: telephonic",
    "Work authorization / visa requirement tags (H1B, Tier2, PR acceptable)",
    "Background-check required", "Drug test required", "Security clearance",
    "Accessibility-friendly role", "Neurodiversity-friendly hiring",
    "Relocation assistance / travel reimbursement offered",
    "Diversity hiring tags: Women-only", "Diversity hiring tags: Disability-friendly", "Diversity hiring tags: Veteran-friendly", "Diversity hiring tags: LGBTQ+ friendly",
    "Probation period length (3 months, 6 months)",
    "Onboarding start date", "Expected start window",
    "Application method: email", "Application method: apply link", "Application method: form", "Application method: walk-in", "Application method: recruiter direct",
    "Source language (for multilingual postings)",
    "Image-specific tags: scanned-newspaper", "Image-specific tags: low-resolution", "Image-specific tags: handwritten", "Image-specific tags: multi-column", "Image-specific tags: multi-language",
  ]
};

// Helper function to get all tags from the taxonomy for easier use in forms/filters
export function getAllTaxonomyTags(): string[] {
  const allTags: Set<string> = new Set();

  Object.values(JOB_TAXONOMY.employmentTypes).forEach(tag => allTags.add(tag));
  Object.values(JOB_TAXONOMY.opportunityEventTypes).forEach(tag => allTags.add(tag));
  Object.values(JOB_TAXONOMY.compensationContract).forEach(tag => allTags.add(tag));
  Object.values(JOB_TAXONOMY.educationAssessment).forEach(tag => allTags.add(tag));
  Object.values(JOB_TAXONOMY.recruitmentChannels).forEach(tag => allTags.add(tag));
  Object.values(JOB_TAXONOMY.miscNiche).forEach(tag => allTags.add(tag));
  Object.values(JOB_TAXONOMY.seniorityLevels).forEach(tag => allTags.add(tag));
  Object.values(JOB_TAXONOMY.workModeLogistics).forEach(tag => allTags.add(tag));

  // Handle nested objects for industries and functional roles
  const industries = JOB_TAXONOMY.industries as Record<string, string[]>;
  const functionalRoles = JOB_TAXONOMY.functionalRoles as Record<string, string[]>;

  for (const group of [industries, functionalRoles]) {
    for (const key in group) {
      if (Array.isArray(group[key])) {
        group[key].forEach(tag => allTags.add(tag));
      } else {
        allTags.add(key); // Add the main category itself
      }
    }
  }

  return Array.from(allTags).sort();
}

export type JobTaxonomy = typeof JOB_TAXONOMY;
