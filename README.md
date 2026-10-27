# 🚀 ClubPulse — College Club Contribution & Management Platform

**ClubPulse** is an operating system for campus student organizations designed specifically to solve the **“Ghost Members and Burnout Leads”** problem in universities.

---

## 🎯 The Core Problem & Solution

| Problem | Symptoms | ClubPulse Solution |
| :--- | :--- | :--- |
| **Ghost Members** | 80% of recruited members disappear after week 1, holding titles without delivering work. | Transparent task allocation, participation telemetry, and verified contribution ledger. |
| **Burnout Leads** | 1 or 2 passionate leads shoulder 80%+ of logistics, tech, and sponsorships alone. | Algorithmic **Burnout Early Warning Radar** and automated workload rebalancing recommendations. |
| **Ambiguous Credit** | No verifiable record of who built what for campus credits or resumes. | Cryptographic **Proof-of-Work Certificates** with audit hashes signed by club leadership. |
| **Disengagement** | Leads don't know members are overwhelmed until they quit. | **Pulse 360 Feedback** assessing workload fairness and event fatigue sentiment. |

---

## ⚡ Quick Start (Frontend Demo)

The application runs locally without requiring database credentials, API keys, or external backend setup. State persists across page refreshes via client-side storage.

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev

# 3. Open in browser
# http://localhost:3000
```

---

## 🎭 Three Interactive Demo Personas

Use the **Persona Switcher** in the top navigation or visit [`/demo-select`](http://localhost:3000/demo-select) to test role-tailored dashboards:

1. **Student / Member (`Aarav Sharma`)**:
   - CSE 3rd Year • GDSC Member • DesignHub Applicant
   - Explore clubs, submit applications, view assigned tasks, submit deliverables with links/notes, and earn verified XP.
2. **Club Lead (`Priya Patel`)**:
   - IT 4th Year • Lead of Google Developer Student Club (GDSC)
   - Experiencing the **Burnout Risk Warning (68/100)** due to carrying 65% of open tasks.
   - Screen applicants, 1-click approve new members, review task submissions, verify XP, and detect ghost members.
3. **Campus Administrator (`Dr. Rajesh Kumar`)**:
   - Dean of Student Affairs & Activity Council
   - Campus-wide governance, inter-club benchmarks, audit trail compliance, and print-ready council reports.

---

## 📦 Architecture: 3 Fully Implemented Modules

### Module 1: Club & Recruitment Service
- **Club Discovery (`/clubs`)**: Searchable, filterable catalog of 5 college clubs across Technology, Design, Entrepreneurship, Robotics, and Literary categories.
- **Club Profiles (`/clubs/[id]`)**: Detailed profile showcasing activities, upcoming events, lead contact, and an interactive **Apply to Join** modal.
- **Recruitment Management (`/recruitment`)**: Candidate pipeline with statuses: *Pending, Under Review, Interview Scheduled, Approved, Rejected*. Approving automatically enrolls the student into the club.
- **Member Directory & Ghost Radar (`/members`)**: Real-time directory highlighting members with <30% participation with 1-click **Re-engagement Nudge**.
- **Member Onboarding (`/onboarding`)**: 5-step onboarding milestone checklist with XP rewards.

### Module 2: Task & Contribution Service
- **Interactive Kanban Board (`/tasks`)**: 5 columns (*To Do, In Progress, Under Review, Completed, Blocked*) with priority tags, overdue alerts, and 1-click status transitions.
- **Personal Task Queue (`/my-tasks`)**: Dedicated queue for active members to start tasks and submit deliverables for lead verification.
- **Burnout Radar & Workload (`/workload`)**: Task concentration visualization comparing lead load against safe thresholds (35%), accompanied by an automated rebalancing engine.
- **Verified Contribution Ledger (`/contributions`)**: Proof-of-work certificate cards with digital audit hashes and printable credentials (`window.print()`).

### Module 3: Feedback & Analytics Service
- **Club Analytics (`/analytics`)**: Real-time telemetry KPI cards, weekly deliverable velocity charts, member retention curves, and client-side **CSV export**.
- **Pulse 360 Feedback (`/feedback`)**: Workload fairness ratings, event fatigue scores, anonymous reviews, and lead response tools.
- **Executive Audit Report (`/reports`)**: Printable campus activity governance report styled for PDF export.

---

## 🔄 10-Step Verification Walkthrough

1. Open [`/clubs/club_designhub`](http://localhost:3000/clubs/club_designhub) as **Aarav** and submit an application for *"Product Designer"*.
2. Switch to **Club Lead (Priya)** via the top banner.
3. Open [`/recruitment`](http://localhost:3000/recruitment) and click **Approve** on the pending applicant. Notice they are instantly enrolled into the club.
4. Navigate to [`/tasks`](http://localhost:3000/tasks) and click **Create Task** to assign a new deliverable.
5. Switch back to **Member (Aarav)** and open [`/my-tasks`](http://localhost:3000/my-tasks).
6. Click **Submit for Review** on an active task, adding a deliverable link and notes.
7. Switch to **Club Lead (Priya)** and click **Approve** on the submitted task.
8. Open [`/contributions`](http://localhost:3000/contributions) to verify the new verified certificate and XP award.
9. Open [`/feedback`](http://localhost:3000/feedback) and submit a pulse rating on workload fairness.
10. Navigate to [`/analytics`](http://localhost:3000/analytics) to see the updated metrics and click **Export CSV**.

---

## 🔌 Tomorrow's Backend Integration Blueprint

All UI components consume data exclusively through the typed service layer in [`src/lib/api.ts`](file:///e:/next.js%20project%20sem%205/src/lib/api.ts) and [`src/context/ClubPulseContext.tsx`](file:///e:/next.js%20project%20sem%205/src/context/ClubPulseContext.tsx).

Tomorrow, connect database credentials and swap the service methods for real API calls:

```typescript
// Authentication
POST /api/auth/login
POST /api/auth/session

// Clubs & Recruitment
GET  /api/clubs
GET  /api/clubs/:id
POST /api/clubs/:id/apply
POST /api/applications/:id/approve
POST /api/applications/:id/reject

// Tasks & Workload
GET   /api/tasks
POST  /api/tasks
PATCH /api/tasks/:id/status
POST  /api/tasks/:id/submit
POST  /api/tasks/:id/approve

// Contributions & Feedback
GET  /api/contributions
POST /api/feedback
GET  /api/analytics/summary
```
