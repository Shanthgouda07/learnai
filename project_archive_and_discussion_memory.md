# LearnAI: Master Project Archive and Conversation Memory

> **Archive Identifier**: `learnai-full-discussion-archive-v1`  
> **Timestamp**: 2026-10-15T00:31:33+05:30  
> **Primary File**: [learnai_portal.html](file:///C:/Users/Shanth%20gouda/.gemini/antigravity-ide/brain/5930531f-d636-4834-b0a3-80a3fb3eea15/learnai_portal.html)  
> **Active Live Server URL**: `http://localhost:7890/learnai_portal.html`

---

## 1. Project Overview

**LearnAI** is a high-performance computer science instruction, telemetry, and live laboratory platform designed for higher-education computer science cohorts. It serves dual roles through an integrated portal:
1. **Faculty Studio**: For professors and instructional staff to monitor diagnostic student telemetry, broadcast live lectures and terminals, synthesize and verify notes/cheatsheets, manage online/offline assignments, and upload course materials.
2. **Student Workspace**: For enrolled engineering students to execute step-by-step code tracers in local browser sandboxes, complete online assignments using an inbuilt Word Doc editor or file attachments, attend live meetings, and study faculty-verified cheatsheets.

---

## 2. Audio & Design Constraints (Strict Compliance)

The following architectural and visual constraints were established via voice instruction:

| Constraint | Enforcement Standard |
|---|---|
| **No Purple Gradients** | No purple or violet gradients anywhere. Palette is strictly deep forest teal (`#0F3D39` / `#0D9488`), dark slate (`#0F172A`), and neutral grays (`#F8FAFC`, `#E2E8F0`). |
| **No Pill-Shaped Buttons** | All buttons, badges, chips, tabs, and dropzones use standard rectangular geometry with a crisp `4px` border radius (`--radius: 4px`). No rounded pills or capsule shapes. |
| **No Emojis** | Zero Unicode emoji characters anywhere in the UI or codebase. All visual indicators use inline vector SVG icons or clear text labels. |
| **No Em Dashes** | Zero em dashes (`—` or `--`) in copy or headers. Replaced with standard colons, commas, or hyphens. |
| **No Fake Reviews or Metrics** | No fabricated marketing testimonials, fictitious customer counters, or star ratings. All numbers reflect actual cohort records (e.g. 42 students, 2 flagged). |
| **No Vague Hero Text** | All text is domain-accurate, professional computer science and software engineering terminology. |
| **No Scroll / Cursor Animations** | Parallax scroll transforms, bouncy scroll effects, and custom cursor animations are eliminated for crisp, instant UI responsiveness. |
| **Custom Domain** | Top environment bar displays `https://portal.learnai.edu` with TLS 1.3 lock badge and cluster node indicator. |
| **Favicon** | Inline SVG favicon `<link rel="icon" type="image/svg+xml" ...>` embedded in `<head>`. |
| **Relocated Policies** | Privacy Policy and Terms and Conditions moved to the bottom utilities of the sidebar and the global footer. |

---

## 3. Platform Modules & Features

### A. Live Meeting & Interactive Terminal Laboratory
- **Live Screen Broadcast**: Faculty can toggle screen sharing (`Share Screen` / `Stop Screen`). Line-level code execution highlights in real-time across student screens.
- **Hands-on Interactive Lab Terminal**:
  - Live UNIX-style terminal (`instructor@cs301:~$` / `broadcast@cs301:~$`).
  - Terminal commands supported:
    - `python3 lru_cache.py` or `run`: Executes unit test assertions.
    - `step`: Advances code tracer to the next line.
    - `valgrind ./heap_alloc`: Simulates dynamic heap analysis reporting zero memory leaks.
    - `clear`: Wipes terminal buffer.
    - `help`: Lists shell commands.
    - `whoami`: Displays authenticated session identity.
- **Audio / Video Controls**: Toggle microphone, camera, and SRTP encrypted peer connection status.
- **Live Classroom Q&A Chat**: Real-time discussion between faculty and students.

### B. Engineering Notes & AI Cheatsheets Studio
- **Preloaded Computer Science Datasets**:
  - **Python (CS-301)**: GIL deep-dive, `ProcessPoolExecutor` vs `asyncio`, CPython Reference Counting & Generational Cyclic GC.
  - **Java (JVM Core)**: JVM architecture (Classloader, Heap, Stack, Metaspace), JIT Compilation, `volatile` vs `synchronized`, `ReentrantLock` & Condition queues, `HashMap` treeification.
  - **C Programming (Systems)**: Pointers, `int **pp`, dynamic heap memory (`malloc`/`free`), memory leaks, Valgrind diagnostics, struct alignment & padding bytes.
- **Synthesis Engine**: Generates concise revision notes, syntax cheatsheets, or flashcard assessment pairs.
- **Faculty Verification Workflow**: Faculty reviews and edits the draft before clicking `Approve and Publish to Students`.

### C. Assignments Hub (Online & Offline Modes)
- **Online Mode**:
  - **Inbuilt Rich Word Doc Editor**: Formatting toolbar (Bold, Italic, H3, Bullet List, Code Block, Clear), live word counter, and auto-save draft.
  - **File Attachment Upload**: Supports `.py`, `.java`, `.c`, `.pdf`, `.docx`, and `.zip` from computer or mobile devices.
- **Offline Laboratory Mode**:
  - Instructions for physical lab attendance (e.g. Laboratory CS-204), terminal execution proof, and handwritten memory diagram submissions.
- **Rubric Generation**: Faculty can generate custom grading rubrics with point breakdowns.

### D. Course Resources Upload & Download Center
- Faculty upload dropzone for lecture slides, starter templates, and technical specifications.
- Instant synchronization with student downloads view.

### E. Security Hardening
- **SHA-256 Hashed Credentials**: No plaintext passwords in code or memory. Client input is hashed with `crypto.subtle.digest('SHA-256')` before evaluation.
- **IIFE Closure Scoping**: Encapsulates state within `(function(){ "use strict"; ... })();`, preventing DevTools inspection of user objects.
- **XSS Prevention**: User inputs pass through HTML entity escaping.
- **Cryptographic Session Tokens**: 128-bit random tokens via `crypto.getRandomValues`.

### F. Legal & Institutional Compliance
- **Privacy Policy**: Complies with FERPA (34 CFR Part 99), India DPDP Act 2023, and GDPR Art. 5 (Zero-PII architecture, client-side execution, zero model training on student work).
- **Terms & Conditions**: Academic integrity rules, code plagiarism policy, and 100% student ownership of submitted intellectual property.

---

## 4. Credentials Reference

| Role | User ID | Password | Profile | Permissions |
|---|---|---|---|---|
| **Faculty** | `T-001` | `teach123` | Sarah J. | Full instructional access, telemetry, meeting broadcasting, note verification, assignment grading |
| **Student (Track 1)** | `S-001` | `student123` | Alex Rivera | High benchmark student (96%), active code tracer, assignment submission |
| **Student (Track 2)** | `S-004` | `student123` | Casey Smith | Flagged for memory allocation intervention, review module access |
| **Student (Track 3)** | `S-012` | `student123` | Emery Kumar | Standard track student (85%), active assignment workspace |

---

## 5. How to Resume or Recall This Project

When asking to continue work on this project in any future turn, you can simply say:
- *"Remind me of our previous conversation on LearnAI"*
- *"Continue from the LearnAI archive"*
- *"Add [feature] to the LearnAI portal"*

All details, file paths, visual constraints, and codebase structure will be automatically restored from this master archive.
