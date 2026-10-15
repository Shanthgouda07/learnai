# LearnAI - Presentation Slides Outline (8-10 Slides)

A companion slide deck outline for hackathon judging, demo days, and educational stakeholder presentations.

---

## Slide 1: Title & Hook
- **Slide Title:** LearnAI: The Calm, Privacy-First AI Teaching Studio
- **Subtitle:** Human-in-the-Loop Personalized Computer Science Education
- **Visuals:** Clean mockups of the Calm Notebook interface (warm off-white `#FAF8F4`, deep teal accents `#134E4A`, ink text `#1A202C`). Side-by-side view of the Teacher AI Desk and Student Notebook.
- **Presenter Bullet Points:**
  - Traditional education technology forces teachers to choose between rigid one-size-fits-all curricula and unvetted black-box AI chatbots.
  - LearnAI unites teacher authority, deterministic diagnosis, and private generative assistance.
- **Key Takeaway:** "AI explains, code computes, teachers decide."

---

## Slide 2: The Core Problem
- **Slide Title:** The Classroom Reality: 1 Teacher, 40 Students, 40 Gaps
- **Key Visual:** Diagram showing one teacher attempting to monitor divergent learning paths; a student struggling with loops because of an invisible gap in variable reassignment.
- **Three Pain Points:**
  1. **Invisible Prerequisites:** Failure in advanced topics (e.g., loops, recursion) is almost always rooted in unaddressed foundational misconceptions (variables, state).
  2. **Teacher Burnout:** Customizing remedial materials for 40 distinct trajectories requires hours teachers don't have.
  3. **Privacy & Hallucination Risks:** Mainstream AI tools leak student PII and hallucinate answers or do students' homework for them.
- **Key Stat / Quote:** "Teachers spend over 10 hours a week creating differentiated materials and grading diagnostics."

---

## Slide 3: The Solution: Teacher-in-the-Loop Studio
- **Slide Title:** LearnAI Architecture of Trust
- **Visuals:** Three-tier conceptual diagram:
  - **Tier 1: Grounded Teacher Authoring** (RAG from verified sources, mandatory draft-approval workflow).
  - **Tier 2: Student Active-Recall Notebook** (Guarded Socratic helper, code sandbox visualizer, zero speed penalties).
  - **Tier 3: Teacher AI Desk** (Deterministic mastery analytics, DAG prerequisite tracing, one-click targeted interventions).
- **Core Principle:** AI never interacts with students or assigns homework autonomously. The teacher is the indispensable authority.

---

## Slide 4: How It Works: The AI Pipeline
- **Slide Title:** Technical Architecture: Determinism Meets Intelligence
- **Visuals:** Pipeline flow chart:
  ```
  Student Query -> PII Redaction -> Vector RAG (Teacher Notes) -> LLM (Temp 0.2) -> Guardrail Filter -> Anonymized Log
  ```
- **Technical Highlights:**
  - **Zero Direct LLM Math/Grading:** Mastery scores and prerequisite graphs are computed deterministically via Python algorithms (`backend/app/analytics/`), NOT guessed by LLMs.
  - **RAG Grounding:** Queries can only retrieve text chunks from teacher-approved lesson notes.
  - **Client-Side Privacy:** Regex and token anonymizers strip names, emails, and phone numbers before payloads leave the browser.

---

## Slide 5: Live Demo Walkthrough
- **Slide Title:** 3-Minute Live Demo Flow
- **Visuals:** Four-panel progression graphic:
  1. **Teacher Note Draft:** Drafting "Python Loops" with instant citations -> human approval.
  2. **Active Recall & Helper:** Student Alex passes recall gate; asks AI helper for hints; off-topic questions rejected.
  3. **Code Visualizer:** Step-by-step memory model and call stack animation.
  4. **Targeted Support:** Teacher heatmap flags Casey (`S-004`) for loop failure caused by variables; 1-click support task generated.

---

## Slide 6: Privacy & Ethics by Design
- **Slide Title:** Privacy Is Visible in the Product, Not Just Promised
- **Visuals:** Screenshot of the Privacy & Ethics Center (`/privacy`), GDPR/FERPA compliance badge.
- **Key Features:**
  - **Server-Side Consent Gate:** Unconsented students are blocked (HTTP 403) from all functional APIs until plain-language terms are accepted (available in 5 languages).
  - **Audit Logging with Zero PII:** `access_log` and `ai_logs` record strictly hashed identifiers (`anon_id`), never student names.
  - **Right to Erasure with Statistical Integrity:** Student data deletion purges personal identifiers while preserving anonymized aggregate statistics so school benchmarks remain valid.
  - **No Leaderboards or Anxiety Drivers:** Zero public rankings, zero speed bonuses; focuses purely on mastery and resilience.

---

## Slide 7: Universal Accessibility (WCAG 2.1 AA)
- **Slide Title:** Built for Every Learner from Day One
- **Visuals:** Settings Drawer mockup showing typography, spacing, contrast controls, and the Read Aloud wave.
- **Key Innovations:**
  - **Neurodivergent-Friendly Fonts:** Built-in toggle for Atkinson Hyperlegible and OpenDyslexic.
  - **Dynamic Scaling up to 200%:** Robust responsive CSS grid with guaranteed touch targets >= 44px.
  - **Native SpeechSynthesis Read-Aloud:** 100% on-device text-to-speech with sentence highlighting—zero audio data transmitted to cloud servers.
  - **Screen Reader & Keyboard Mastery:** Full tab indexing, visible focus rings, aria-live regions for AI streaming, and table alternatives for every interactive chart.
  - **AI Simple Language Mode:** 1-click simplified note summaries with AI-generated badges.

---

## Slide 8: Real-World Feasibility & Offline Resilience
- **Slide Title:** Ready for Real Classrooms
- **Visuals:** Side-by-side comparison: Cloud vs. Edge/Offline Classroom.
- **Highlights:**
  - **Zero-Cloud Mock Mode:** Fully functional offline mode without internet connection or API keys.
  - **Sub-5 Minute Setup:** Automated database seeding, SQLite storage, fast Vite client, lightweight FastAPI backend.
  - **Resource-Constrained Ready:** Runs smoothly on school Chromebooks and low-bandwidth mobile networks (tested down to 360px screen width).
  - **Safe Execution Sandbox:** Isolated AST-validated Python runner with timeout guards and memory limits.

---

## Slide 9: Impact & Roadmap
- **Slide Title:** The Road Ahead: Scaling Impact
- **Visuals:** Phased roadmap timeline.
- **Short-Term (Hackathon Phase):**
  - Python programming curriculum, interactive memory visualizer, deterministic prerequisite engine, privacy center.
- **Next Horizon (Production Deployment):**
  - **OCR Handwritten Worksheet Ingestion:** Scan paper homework directly into grounded learning notes.
  - **Multilingual Note Synchronization:** Teacher-reviewed localized notes across regional languages.
  - **LMS Interoperability:** Canvas, Google Classroom, and Moodle gradebook syncing.
  - **Containerized Sandbox:** Hardened gVisor/Docker runner for multi-language execution (JavaScript, C++, Rust).

---

## Slide 10: Conclusion & Call to Action
- **Slide Title:** Empowering Teachers. Protecting Students.
- **Visuals:** LearnAI Wordmark, QR Code linking to open-source repository and interactive demo.
- **Closing Statement:**
  > *"AI shouldn't replace teachers or gamble with student data. LearnAI puts powerful, grounded intelligence into the hands of educators to make every student feel understood."*
- **Q&A Invitations:** Ready for technical, pedagogical, and ethical inquiries.
