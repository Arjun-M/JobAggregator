# JobAggregator | Intelligent Job Board

A private, AI-powered intelligence platform designed to transform raw job postings (screenshots, images, and text) into structured, high-signal career opportunities.

## 🏗️ System Architecture

The application is built using a modern **Next.js 15** stack with a focus on automated data extraction and classification.

### 1. Data Ingestion (Admin)
- **OCR Engine**: Uses Tesseract.js (or similar) to extract raw text from uploaded job screenshots.
- **AI Extraction**: Processes the raw text through a Large Language Model (OpenAI/Anthropic) using a specialized prompt to identify job titles, companies, salary, and requirements.
- **Staging Area**: Extracted data is held in a "Review Queue" where admins can verify or correct the AI's output before it goes live.

### 2. Processing Pipeline
- **Taxonomy Mapping**: Every job is automatically tagged based on a predefined industry and role taxonomy (`lib/job_taxonomy.ts`).
- **Confidence Scoring**: The AI provides a confidence score for each extraction to flag low-quality data for manual review.
- **Auto-Archiving**: Listings older than 30 days or past their validity date are automatically moved to the archive.

### 3. User Experience
- **Personalized Dashboard**: Users can set filters for specific roles, industries, and locations.
- **Save for Later**: Users can track opportunities by saving them to their profile.
- **Market Reports**: Aggregated data is transformed into Daily, Weekly, and Monthly market digests.

---

## 🗄️ Database Schema (MongoDB)

The system uses five primary collections to manage the lifecycle of a job posting.

### 1. `raw_uploads`
Stores the initial metadata of the uploaded image before processing.
```json
{
  "_id": "ObjectId",
  "image_url": "string (Cloudinary URL)",
  "uploaded_at": "ISO8601 String",
  "status": "pending | processed | error",
  "error_reason": "string | null",
  "created_at": "ISO8601 String"
}
```

### 2. `staging_jobs`
The "Draft" state of a job after AI extraction but before admin approval.
```json
{
  "_id": "ObjectId",
  "source": {
    "image_url": "string",
    "uploaded_at": "string"
  },
  "job": {
    "title": "string",
    "organization": "string",
    "location": "string",
    "employment_type": "Full-time | Part-time | Contract | etc",
    "salary": "string",
    "validity_date": "YYYY-MM-DD",
    "description": "string (Full extracted text)",
    "tags": ["string"],
    "application_url": "string | null",
    "website": "string | null",
    "email": "string | null",
    "phone": "string | null"
  },
  "meta": {
    "ocr_hash": "string (to prevent duplicates)",
    "confidence": "number (0.0 - 1.0)",
    "extracted_at": "string"
  },
  "status": "pending_review | approved | rejected",
  "needs_manual_review": "boolean"
}
```

### 3. `jobs`
Live and Archived listings.
```json
{
  "_id": "ObjectId",
  "staging_id": "ObjectId",
  "job": { /* Same as staging_jobs.job */ },
  "source": { /* Same as staging_jobs.source */ },
  "meta": { /* Same as staging_jobs.meta */ },
  "status": "approved",
  "verified_at": "ISO8601 String",
  "archived_at": "ISO8601 String | null",
  "updated_at": "ISO8601 String"
}
```

### 4. `users` & `user_profiles`
User authentication and personalized settings.
```json
// user_profiles
{
  "_id": "ObjectId",
  "userId": "string",
  "saved_jobs": ["string (job_ids)"],
  "personalized_filters": {
    "employment_types": ["string"],
    "industries": ["string"],
    "functional_roles": ["string"],
    "locations": ["string"],
    "min_salary": "string"
  },
  "newsletter_subscription": "boolean"
}
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (Local or Atlas)
- Cloudinary Account (for image hosting)
- OpenAI or Anthropic API Key

### Installation
1. Clone the repository.
2. `npm install`
3. Create a `.env` file based on the environment variables mentioned in the "Environment Configuration" section of the deployment guide.
4. `npm run dev`

### Commands
- `npm run dev`: Starts development server.
- `npm run build`: Creates a production build (checks types and lints).
- `npm run start`: Runs the production server.
- `npm run typecheck`: Runs TypeScript compiler check.

---

## 🔒 Security & Privacy
- **JWT Auth**: All user sessions are secured via JSON Web Tokens.
- **Private Data**: This is a closed-access tool; registration is typically restricted to invited members of the SSKZM OBA network.
- **Redaction**: AI is instructed to redact sensitive personal information from raw job images during extraction.
