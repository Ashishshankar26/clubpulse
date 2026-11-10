const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ImageRun,
  Header,
  Footer,
  PageNumber,
  PageBreak,
  ShadingType,
  VerticalAlign,
} = require('docx');

// Helper to create clean text runs in Times New Roman
function tr(text, options = {}) {
  return new TextRun({
    text,
    font: 'Times New Roman',
    size: options.size || 22, // 11pt default
    bold: !!options.bold,
    italics: !!options.italics,
    color: options.color || '111827',
  });
}

// Helper for body paragraphs with justified alignment
function p(textOrRuns, options = {}) {
  const children = Array.isArray(textOrRuns)
    ? textOrRuns
    : [typeof textOrRuns === 'string' ? tr(textOrRuns, options) : textOrRuns];

  return new Paragraph({
    alignment: options.alignment || AlignmentType.JUSTIFIED,
    spacing: {
      before: options.before !== undefined ? options.before : 0,
      after: options.after !== undefined ? options.after : 80, // 4pt after
      line: options.line !== undefined ? options.line : 250, // 1.15 line spacing
    },
    children,
  });
}

// Heading 1 (14pt bold)
function h1(text, options = {}) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    alignment: options.alignment || AlignmentType.LEFT,
    spacing: {
      before: options.before !== undefined ? options.before : 140,
      after: options.after !== undefined ? options.after : 60,
    },
    children: [
      new TextRun({
        text,
        font: 'Times New Roman',
        size: 28, // 14pt
        bold: true,
        color: '0F172A',
      }),
    ],
  });
}

// Heading 2 (12pt bold)
function h2(text, options = {}) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    alignment: options.alignment || AlignmentType.LEFT,
    spacing: {
      before: options.before !== undefined ? options.before : 100,
      after: options.after !== undefined ? options.after : 40,
    },
    children: [
      new TextRun({
        text,
        font: 'Times New Roman',
        size: 24, // 12pt
        bold: true,
        color: '1E293B',
      }),
    ],
  });
}

// Helper for figure captions
function figureCaption(num, caption) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 40, after: 60 },
    children: [
      new TextRun({
        text: `Figure ${num}: `,
        font: 'Times New Roman',
        size: 19, // 9.5pt
        bold: true,
        color: '0F172A',
      }),
      new TextRun({
        text: caption,
        font: 'Times New Roman',
        size: 19,
        italics: true,
        color: '334155',
      }),
    ],
  });
}

// Helper for image inclusion
function imgParagraph(imagePath, width = 410, height = 205) {
  if (!fs.existsSync(imagePath)) {
    return p(`[Image placeholder: ${path.basename(imagePath)}]`, { alignment: AlignmentType.CENTER });
  }
  const imgBuffer = fs.readFileSync(imagePath);
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 30, after: 20 },
    children: [
      new ImageRun({
        data: imgBuffer,
        transformation: {
          width,
          height,
        },
      }),
    ],
  });
}

async function buildLpuProjectReport() {
  console.log('Generating Professional LPU Academic Project Report (DOCX)...');

  // Paths
  const lpuLogoPath = path.join(process.cwd(), 'docs', 'lpu_logo.png');
  const screenshotDir = path.join(process.cwd(), 'docs', 'report_screenshots');

  const fig1Path = path.join(screenshotDir, '02_dashboard_lead.png');
  const fig2Path = path.join(screenshotDir, '03_club_discovery.png');
  const fig3Path = path.join(screenshotDir, '05_recruitment_pipeline.png');
  const fig4Path = path.join(screenshotDir, '06_task_kanban.png');
  const fig5Path = path.join(screenshotDir, '07_workload_burnout.png');
  const fig6Path = path.join(screenshotDir, '09_pulse_survey.png');

  // Common borders
  const thinBorder = {
    top: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
    left: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
    right: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
  };

  // ==========================================
  // SECTION 1: COVER PAGE (PAGE 1)
  // ==========================================
  const coverChildren = [
    // Top Logo
    fs.existsSync(lpuLogoPath)
      ? new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 180, after: 140 },
          children: [
            new ImageRun({
              data: fs.readFileSync(lpuLogoPath),
              transformation: { width: 110, height: 109 },
            }),
          ],
        })
      : p('LOVELY PROFESSIONAL UNIVERSITY', { alignment: AlignmentType.CENTER }),

    // University Title
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 40 },
      children: [
        new TextRun({
          text: 'LOVELY PROFESSIONAL UNIVERSITY',
          font: 'Times New Roman',
          size: 32, // 16pt
          bold: true,
          color: '0F172A',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 200 },
      children: [
        new TextRun({
          text: 'School of Computer Science and Engineering',
          font: 'Times New Roman',
          size: 24, // 12pt
          color: '475569',
        }),
      ],
    }),

    // Project Report On
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 40 },
      children: [
        new TextRun({
          text: 'PROJECT REPORT',
          font: 'Times New Roman',
          size: 26, // 13pt
          bold: true,
          color: '1E293B',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 120 },
      children: [
        new TextRun({
          text: 'ON',
          font: 'Times New Roman',
          size: 20, // 10pt
          color: '64748B',
        }),
      ],
    }),

    // Project Title
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 40 },
      children: [
        new TextRun({
          text: 'Club.ing',
          font: 'Times New Roman',
          size: 40, // 20pt
          bold: true,
          color: '0F172A',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 60 },
      children: [
        new TextRun({
          text: 'Club Contribution and Management Platform',
          font: 'Times New Roman',
          size: 26, // 13pt
          italics: true,
          color: '334155',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 200 },
      children: [
        new TextRun({
          text: 'Addressing Problem P18: Ghost Members and Burnout Leads',
          font: 'Times New Roman',
          size: 21, // 10.5pt
          bold: true,
          color: '0284C7',
        }),
      ],
    }),

    // Course Information
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 60, after: 240 },
      children: [
        new TextRun({
          text: 'Course Code: INT 257 | Subject: Modern Web Application Development',
          font: 'Times New Roman',
          size: 22,
          bold: true,
          color: '1E293B',
        }),
      ],
    }),

    // Student & Faculty Submission Grid
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 40 },
      children: [
        new TextRun({
          text: 'SUBMITTED BY',
          font: 'Times New Roman',
          size: 22,
          bold: true,
          color: '0F172A',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 20 },
      children: [
        new TextRun({
          text: 'ASHISH SHANKAR',
          font: 'Times New Roman',
          size: 26, // 13pt
          bold: true,
          color: '0F172A',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 20 },
      children: [
        new TextRun({
          text: 'Registration Number: 12405540',
          font: 'Times New Roman',
          size: 22,
          color: '334155',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 20 },
      children: [
        new TextRun({
          text: 'School of Computer Science and Engineering',
          font: 'Times New Roman',
          size: 22,
          color: '334155',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 300 }, // Noticeable vertical space
      children: [
        new TextRun({
          text: 'Lovely Professional University, Phagwara, Punjab',
          font: 'Times New Roman',
          size: 22,
          color: '334155',
        }),
      ],
    }),

    // Faculty Details
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 40 },
      children: [
        new TextRun({
          text: 'SUBMITTED TO',
          font: 'Times New Roman',
          size: 22,
          bold: true,
          color: '0F172A',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 20 },
      children: [
        new TextRun({
          text: 'Mr. Akash Pundir',
          font: 'Times New Roman',
          size: 26, // 13pt
          bold: true,
          color: '0F172A',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 20 },
      children: [
        new TextRun({
          text: 'Faculty – School of Computer Science and Engineering',
          font: 'Times New Roman',
          size: 22,
          color: '334155',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 0 },
      children: [
        new TextRun({
          text: 'Lovely Professional University, Phagwara, Punjab',
          font: 'Times New Roman',
          size: 22,
          color: '334155',
        }),
      ],
    }),
  ];

  // ==========================================
  // SECTION 2: REPORT BODY (PAGES 2 TO 8)
  // ==========================================
  const bodyChildren = [
    // ------------------------------------------
    // PAGE 2: ABSTRACT, INTRODUCTION & PROBLEM STATEMENT
    // ------------------------------------------
    h1('1. Abstract & Introduction'),
    p(
      'Co-curricular student organizations and technical societies represent a cornerstone of experiential learning in university education. At institutions like Lovely Professional University, collegiate clubs offer students essential avenues to cultivate leadership capabilities, technical proficiencies, professional event organizing experience, and cross-disciplinary teamwork. Despite substantial campus enthusiasm during recruitment drives, university organizations systematically experience severe operational attrition, asymmetric workload concentration, and accountability breakdown. This capstone engineering report introduces Club.ing (ClubPulse), an integrated full-stack web platform specifically engineered to address university problem P18: Ghost Members and Burnout Leads.'
    ),
    p(
      'Club.ing establishes a unified, transparent operating system for university clubs. By interconnecting student recruitment, verifiable task assignment, contribution tracking, anonymous member pulse surveys, and executive burnout telemetry within a modular architecture, the system replaces informal WhatsApp groups and spreadsheets with an institutional platform that ensures accountability, transparency, and sustained club health.'
    ),

    h1('2. Problem Statement: P18 – Ghost Members and Burnout Leads'),
    p(
      'Field investigations into collegiate student bodies reveal persistent friction points that compromise student organizations. The problem manifests across six interrelated operational vulnerabilities:'
    ),

    p([
      tr('1. Workload Imbalance and Lead Burnout: ', { bold: true }),
      tr(
        'In typical clubs, more than 80% of project execution, sponsorship outreach, and event logistics falls upon 2 to 3 core organizers. This extreme concentration creates academic distress, fatigue, and organizer exhaustion, frequently prompting key leads to resign mid-tenure.'
      ),
    ]),
    p([
      tr('2. Ghost Membership Phenomenon: ', { bold: true }),
      tr(
        'Dozens of students register during club orientation to bolster their resumes. However, after obtaining membership status, a significant percentage never attend working sessions or deliver assigned tasks, remaining inactive "ghost members" on rosters.'
      ),
    ]),
    p([
      tr('3. Lack of Contribution Visibility: ', { bold: true }),
      tr(
        'Student leaders lack objective mechanisms to monitor individual output. Without verifiable task records, club leads cannot distinguish hardworking contributors from passive members when issuing certificates or leadership recommendations.'
      ),
    ]),
    p([
      tr('4. Unverified Club Value Delivery: ', { bold: true }),
      tr(
        'Prospective students have no transparent means to assess whether a club actively conducts advertised technical workshops, hackathons, and mentorship sessions, or whether it exists purely on paper.'
      ),
    ]),
    p([
      tr('5. Subjective Peer Evaluations and Bias: ', { bold: true }),
      tr(
        'Traditional club evaluations suffer from interpersonal favoritism. Honest feedback regarding toxic leadership or disorganization is rarely voiced openly due to fear of social friction or exclusion.'
      ),
    ]),
    p([
      tr('6. Fragmented Communication Tooling: ', { bold: true }),
      tr(
        'Clubs attempt to coordinate recruitment through Google Forms, task tracking via spreadsheets, and conversations across unorganized chat channels, resulting in lost files, missed deadlines, and complete absence of institutional memory.'
      ),
    ]),

    new PageBreak(), // -> PAGE 3

    // ------------------------------------------
    // PAGE 3: PROPOSED SOLUTION, OBJECTIVES & ARCHITECTURE
    // ------------------------------------------
    h1('3. Proposed Solution – ClubPulse Platform'),
    p(
      'ClubPulse provides a centralized, role-based platform that unifies campus club operations into three tightly integrated modules: (1) Club & Recruitment Service, (2) Task & Contribution Service, and (3) Club Feedback & Analytics. Operating as a Modular Monolith, the system maintains a unified data schema while cleanly isolating domain boundaries.'
    ),

    h2('3.1 Core Project Objectives'),
    p([
      tr('• Centralized Discovery & Transparent Recruitment: ', { bold: true }),
      tr('Provide students with a verified club catalog, standardized application forms, and an objective screening pipeline with anti-self-approval enforcement.'),
    ]),
    p([
      tr('• Equitable Task Delegation & Burnout Prevention: ', { bold: true }),
      tr('Implement a Kanban board where tasks carry priority levels, deadlines, and XP points, complemented by real-time workload telemetry that flags overloaded organizers.'),
    ]),
    p([
      tr('• Proof-of-Work Accountability: ', { bold: true }),
      tr('Record deliverable URLs and completion timestamps so that certificates, leadership roles, and activity points reflect verified output rather than passive attendance.'),
    ]),
    p([
      tr('• Anonymous Psychological Safety Loops: ', { bold: true }),
      tr('Provide periodic pulse surveys allowing members to submit candid feedback without fear of retaliation, surfaced to leads through aggregated analytics.'),
    ]),

    h2('3.2 System Architecture: Modular Monolithic Design'),
    p(
      'ClubPulse is structured as a Modular Monolith built with modern Next.js 15 and React 19. All services execute within a single deployment unit while maintaining distinct operational boundaries and sharing a common data layer.'
    ),

    // Architecture Table
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          tableHeader: true,
          children: [
            new TableCell({
              width: { size: 25, type: WidthType.PERCENTAGE },
              shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
              borders: thinBorder,
              children: [p([tr('Service Module', { bold: true, size: 20 })], { alignment: AlignmentType.CENTER })],
            }),
            new TableCell({
              width: { size: 40, type: WidthType.PERCENTAGE },
              shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
              borders: thinBorder,
              children: [p([tr('Domain Scope & Functionality', { bold: true, size: 20 })], { alignment: AlignmentType.CENTER })],
            }),
            new TableCell({
              width: { size: 35, type: WidthType.PERCENTAGE },
              shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
              borders: thinBorder,
              children: [p([tr('Key Entities & Metrics', { bold: true, size: 20 })], { alignment: AlignmentType.CENTER })],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              borders: thinBorder,
              children: [p([tr('Module 1: Club & Recruitment', { bold: true, size: 19 })])],
            }),
            new TableCell({
              borders: thinBorder,
              children: [p('Club profiles, manifesto, categorized discovery, application submission, screening pipeline, onboarding, member directory.', { size: 19 })],
            }),
            new TableCell({
              borders: thinBorder,
              children: [p('Clubs, Applications, Roles (Lead, Co-Lead, Core, General). Status: Pending, Under Review, Approved, Rejected.', { size: 19 })],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              borders: thinBorder,
              children: [p([tr('Module 2: Task & Contribution', { bold: true, size: 19 })])],
            }),
            new TableCell({
              borders: thinBorder,
              children: [p('Task Kanban board, deliverable submission links, two-party lead verification, XP rewards, workload distribution telemetry.', { size: 19 })],
            }),
            new TableCell({
              borders: thinBorder,
              children: [p('Tasks (Todo, In Progress, Review, Completed), Proof-of-Work Ledger, Priority Weights, XP Points (10-100 XP).', { size: 19 })],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              borders: thinBorder,
              children: [p([tr('Module 3: Feedback & Analytics', { bold: true, size: 19 })])],
            }),
            new TableCell({
              borders: thinBorder,
              children: [p('Anonymous periodic pulse surveys, Net Promoter Score (NPS), lead burnout radar, ghost member risk alerts, council reports.', { size: 19 })],
            }),
            new TableCell({
              borders: thinBorder,
              children: [p('Pulse Surveys, Burnout Index (0-100), Participation Rate, Ghost Flags (0 tasks / <20% activity), Governance Reports.', { size: 19 })],
            }),
          ],
        }),
      ],
    }),

    new PageBreak(), // -> PAGE 4

    // ------------------------------------------
    // PAGE 4: MODULE 1 – CLUB & RECRUITMENT SERVICE (WITH SCREENSHOTS)
    // ------------------------------------------
    h1('4. Module 1 – Club & Recruitment Service'),
    p(
      'The Club & Recruitment Service governs the gateway through which students discover organizations, submit credentials, and undergo structured admission. The module eliminates informal recruitment through an auditable pipeline with strict role-based governance.'
    ),

    imgParagraph(fig1Path, 410, 205),
    figureCaption(1, 'ClubPulse Main Dashboard with real-time KPI metrics, active clubs, and workload telemetry.'),
    p(
      'Figure 1 illustrates the ClubPulse executive dashboard tailored for a club lead. The interface presents key operational indicators including total active members, pending candidate applications, open task assignments, and the live Burnout Radar. Quick-action shortcuts allow leads to review applications and allocate tasks with a single click, providing comprehensive situational awareness.'
    ),

    imgParagraph(fig2Path, 410, 205),
    figureCaption(2, 'Club Discovery and Recruitment Interface displaying categorized campus organizations.'),
    p(
      'Figure 2 presents the public club directory. Students browse active student organizations with filtering by domain (Technology, Entrepreneurship, Robotics, Literature). Each card highlights active recruitment deadlines, founding year, member headcount, and verified achievements. Students click "Apply for Membership" to open a standardized application modal requiring a Statement of Purpose and skills.'
    ),

    new PageBreak(), // -> PAGE 5

    // ------------------------------------------
    // PAGE 5: MODULE 2 – TASK & CONTRIBUTION SERVICE (WITH SCREENSHOTS)
    // ------------------------------------------
    h1('5. Module 2 – Task & Contribution Service'),
    p(
      'The Task & Contribution Service addresses workload concentration and passive membership by establishing an accountable proof-of-work pipeline. Tasks are organized through an interactive Kanban board with strict dual-party verification rules.'
    ),

    imgParagraph(fig3Path, 410, 205),
    figureCaption(3, 'Club Member and Recruitment Management Pipeline showing applicant review and screening.'),
    p(
      'Figure 3 depicts the recruitment screening pipeline. Applications submitted by candidates (e.g., Arjun Mehta for Frontend Developer in GDSC) are listed with their academic department, year, Statement of Purpose, and portfolio links. Authorized club leads can inspect credentials and execute one-click "Approve" or "Reject" actions. An institutional integrity rule strictly prohibits leads from approving their own applications.'
    ),

    imgParagraph(fig4Path, 410, 205),
    figureCaption(4, 'Task Assignment and Progress Tracking Kanban board displaying task states, deadlines, and XP incentives.'),
    p(
      'Figure 4 shows the interactive Task Board organized across four swimlanes: Todo, In Progress, Under Review, and Completed. Each task card displays assigned assignee avatars, priority badges (Urgent, High, Medium, Low), due dates, and gamified XP rewards. When a student completes work, they submit evidence via GitHub or Drive URLs for lead review. The system enforces an anti-self-verification policy preventing self-approval.'
    ),

    new PageBreak(), // -> PAGE 6

    // ------------------------------------------
    // PAGE 6: MODULE 3 – CLUB FEEDBACK & ANALYTICS (WITH SCREENSHOTS)
    // ------------------------------------------
    h1('6. Module 3 – Club Feedback & Analytics'),
    p(
      'The Feedback & Analytics Service delivers continuous operational health monitoring. By aggregating member workload metrics and anonymous sentiment surveys, the platform identifies early signs of burnout and member disengagement before organizational failure occurs.'
    ),

    imgParagraph(fig5Path, 410, 205),
    figureCaption(5, 'Contribution and Workload Monitoring showing member participation index, ghost risks, and lead burnout.'),
    p(
      'Figure 5 displays the workload and burnout telemetry screen. The Burnout Radar algorithm computes an objective stress score (0–100) based on task concentration, overdue deliverables, and concurrent active assignments. Simultaneously, members with zero completed tasks and below 20% attendance are highlighted as "Ghost Risks", giving organizers timely empirical data to re-engage or reassign inactive students.'
    ),

    imgParagraph(fig6Path, 410, 205),
    figureCaption(6, 'Club Feedback and Analytics Dashboard displaying anonymous member pulse surveys and NPS scores.'),
    p(
      'Figure 6 illustrates the anonymous Pulse Survey interface. Club members periodically rate their club experience, mentorship quality, and psychological safety on a 1-to-5 scale and submit anonymous feedback. The system guarantees anonymity while computing aggregate club satisfaction scores, Net Promoter Scores (NPS), and sentiment trends accessible to club leads and university faculty.'
    ),

    new PageBreak(), // -> PAGE 7

    // ------------------------------------------
    // PAGE 7: TECHNICAL IMPLEMENTATION & INTEGRATION WORKFLOW
    // ------------------------------------------
    h1('7. Technical Implementation Details'),
    p(
      'Club.ing is engineered using modern, production-grade web technologies that deliver responsive client-side performance, strong type safety, and maintainable modular architecture.'
    ),

    // Tech Stack Table
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          tableHeader: true,
          children: [
            new TableCell({
              width: { size: 25, type: WidthType.PERCENTAGE },
              shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
              borders: thinBorder,
              children: [p([tr('Technology', { bold: true, size: 20 })], { alignment: AlignmentType.CENTER })],
            }),
            new TableCell({
              width: { size: 25, type: WidthType.PERCENTAGE },
              shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
              borders: thinBorder,
              children: [p([tr('Role in Architecture', { bold: true, size: 20 })], { alignment: AlignmentType.CENTER })],
            }),
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
              borders: thinBorder,
              children: [p([tr('Implementation & Academic Justification', { bold: true, size: 20 })], { alignment: AlignmentType.CENTER })],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              borders: thinBorder,
              children: [p([tr('Next.js 15', { bold: true, size: 19 })])],
            }),
            new TableCell({
              borders: thinBorder,
              children: [p('Full-Stack React Framework', { size: 19 })],
            }),
            new TableCell({
              borders: thinBorder,
              children: [p('App Router architecture, Server and Client Components, fast incremental page builds, route-level code splitting.', { size: 19 })],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              borders: thinBorder,
              children: [p([tr('React 19 & Context', { bold: true, size: 19 })])],
            }),
            new TableCell({
              borders: thinBorder,
              children: [p('UI & Client State Management', { size: 19 })],
            }),
            new TableCell({
              borders: thinBorder,
              children: [p('Declarative UI rendering, unified ClubPulseProvider context managing synchronous client state and MongoDB Atlas syncing.', { size: 19 })],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              borders: thinBorder,
              children: [p([tr('TypeScript 5', { bold: true, size: 19 })])],
            }),
            new TableCell({
              borders: thinBorder,
              children: [p('Static Type Safety', { size: 19 })],
            }),
            new TableCell({
              borders: thinBorder,
              children: [p('Enforces strict schemas for Clubs, Tasks, Applications, and Audit logs, catching runtime errors during compilation.', { size: 19 })],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              borders: thinBorder,
              children: [p([tr('Tailwind CSS', { bold: true, size: 19 })])],
            }),
            new TableCell({
              borders: thinBorder,
              children: [p('Design System & Layout', { size: 19 })],
            }),
            new TableCell({
              borders: thinBorder,
              children: [p('Professional high-contrast monochromatic design system (Slate/Black/White), fully responsive across desktop and mobile.', { size: 19 })],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              borders: thinBorder,
              children: [p([tr('Recharts & Lucide', { bold: true, size: 19 })])],
            }),
            new TableCell({
              borders: thinBorder,
              children: [p('Data Viz & Iconography', { size: 19 })],
            }),
            new TableCell({
              borders: thinBorder,
              children: [p('Interactive radar and bar charts for workload visualization and standardized academic UI icons.', { size: 19 })],
            }),
          ],
        }),
      ],
    }),

    h1('8. End-to-End Integration Workflow'),
    p(
      'The platform operationalizes a 9-step closed-loop lifecycle that seamlessly transitions students from initial discovery to active leadership:'
    ),

    p([
      tr('Step 1 (Discovery): ', { bold: true }),
      tr('A student navigates the club directory, inspects the GDSC manifesto, and clicks "Apply for Membership".'),
    ]),
    p([
      tr('Step 2 (Screening): ', { bold: true }),
      tr('The club lead reviews candidate statements, portfolio links, and moves the application through the review pipeline.'),
    ]),
    p([
      tr('Step 3 (Onboarding): ', { bold: true }),
      tr('Upon lead approval, the applicant is instantly enrolled into the club roster with "General Member" privileges.'),
    ]),
    p([
      tr('Step 4 (Task Delegation): ', { bold: true }),
      tr('The lead creates a deliverable on the Kanban board (e.g., "Build Fest Portal"), assigning priority, due date, and XP points.'),
    ]),
    p([
      tr('Step 5 (Execution & Review): ', { bold: true }),
      tr('The member moves the card to "Under Review" with a proof URL. The lead verifies the submission and marks it "Completed".'),
    ]),
    p([
      tr('Step 6 (Contribution Minting): ', { bold: true }),
      tr('The verified completion awards XP to the student and generates a permanent, tamper-evident contribution record.'),
    ]),
    p([
      tr('Step 7 (Telemetry & Governance): ', { bold: true }),
      tr('Workload charts update in real time. Inactive members are flagged, and members submit bi-weekly anonymous pulse surveys.'),
    ]),

    new PageBreak(), // -> PAGE 8

    // ------------------------------------------
    // PAGE 8: CONCLUSION, FUTURE SCOPE & REFERENCES
    // ------------------------------------------
    h1('9. Conclusion'),
    p(
      'Club.ing effectively addresses academic problem P18 (Ghost Members and Burnout Leads) by establishing a structured digital operating system for collegiate student organizations. By replacing ad-hoc communication channels with verifiable task pipelines, objective workload telemetry, and anonymous feedback loops, the platform safeguards student organizers from burnout while holding members accountable for tangible contributions. The implementation demonstrated in this capstone showcases how modern web engineering principles—specifically Modular Monolithic architecture, strict type safety, and user-centric design—can solve long-standing organizational challenges in university campus environments.'
    ),

    h1('10. Future Scope & Enhancements'),
    p(
      'While the current version provides a fully operational frontend demonstration synchronized with MongoDB Atlas, planned future milestones include:'
    ),

    p([
      tr('1. Relational Database Migration: ', { bold: true }),
      tr('Transitioning core ledger relations to PostgreSQL managed via Prisma ORM for ACID transactions across multi-club approvals.'),
    ]),
    p([
      tr('2. Real-Time Push Notifications: ', { bold: true }),
      tr('Integrating WebSocket (Socket.io) or Server-Sent Events (SSE) for instant alerts on task deadlines, approvals, and survey cycles.'),
    ]),
    p([
      tr('3. Automated PDF Certificate Generation: ', { bold: true }),
      tr('Generating digitally signed, QR-verifiable activity certificates and semester contribution transcripts endorsed by the University Dean.'),
    ]),
    p([
      tr('4. Mobile Cross-Platform Companion: ', { bold: true }),
      tr('Deploying a Progressive Web App (PWA) and React Native mobile application for mobile event check-ins and offline notifications.'),
    ]),

    h1('11. Academic & Technical References'),
    p([
      tr('[1] Next.js 15 Documentation: ', { bold: true }),
      tr('Vercel Inc. "Next.js App Router, Server Components & Route Handlers." Available at: https://nextjs.org/docs'),
    ]),
    p([
      tr('[2] React 19 Official Documentation: ', { bold: true }),
      tr('Meta Platforms, Inc. "React Hooks, Concurrent Features, and Context API." Available at: https://react.dev'),
    ]),
    p([
      tr('[3] TypeScript 5 Handbook: ', { bold: true }),
      tr('Microsoft Corporation. "The TypeScript Language Specification." Available at: https://www.typescriptlang.org/docs/'),
    ]),
    p([
      tr('[4] Tailwind CSS Documentation: ', { bold: true }),
      tr('Tailwind Labs Inc. "Utility-First CSS Framework Specification." Available at: https://tailwindcss.com/docs'),
    ]),
    p([
      tr('[5] Recharts Data Visualization: ', { bold: true }),
      tr('Recharts Group. "Composable Charting Library for React." Available at: https://recharts.org/en-US/'),
    ]),
    p([
      tr('[6] MongoDB & Mongoose Object Modeling: ', { bold: true }),
      tr('MongoDB, Inc. "Mongoose ODM & MongoDB Atlas Cluster Documentation." Available at: https://mongoosejs.com/docs/'),
    ]),
    p([
      tr('[7] Lovely Professional University Guidelines: ', { bold: true }),
      tr('Department of Computer Science & Engineering. "Guidelines for INT 257 Modern Web Application Development Capstone Projects." LPU Press, 2026.'),
    ]),
  ];

  // ==========================================
  // DOCUMENT DEFINITION (SINGLE ROBUST SECTION)
  // ==========================================
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              width: 11906, // A4 width in twips
              height: 16838, // A4 height in twips
            },
            margin: {
              top: 1080, // 0.75 in
              bottom: 1080,
              left: 1080,
              right: 1080,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { after: 120 },
                children: [
                  new TextRun({
                    text: 'INT 257: Modern Web Application Development | Project Report: Club.ing',
                    font: 'Times New Roman',
                    size: 18, // 9pt
                    color: '64748B',
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 120 },
                children: [
                  new TextRun({
                    text: 'Lovely Professional University - School of Computer Science & Engineering | Page ',
                    font: 'Times New Roman',
                    size: 18,
                    color: '64748B',
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: 'Times New Roman',
                    size: 18,
                    bold: true,
                    color: '0F172A',
                  }),
                  new TextRun({
                    text: ' of ',
                    font: 'Times New Roman',
                    size: 18,
                    color: '64748B',
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    font: 'Times New Roman',
                    size: 18,
                    bold: true,
                    color: '0F172A',
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          ...coverChildren,
          new PageBreak(),
          ...bodyChildren,
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);

  // Target output files
  const filename = 'Club.ing_Project_Report_INT257_Ashish_Shankar.docx';
  const outRoot = path.join(process.cwd(), filename);
  const outRootFinal = path.join(process.cwd(), 'Club.ing_Project_Report_INT257_Ashish_Shankar_FINAL.docx');
  const outDocs = path.join(process.cwd(), 'docs', filename);

  try {
    fs.writeFileSync(outRootFinal, buffer);
    console.log(`Saved: ${outRootFinal}`);
  } catch (err) {
    console.warn(`Could not write ${outRootFinal}:`, err.message);
  }

  try {
    fs.writeFileSync(outRoot, buffer);
    console.log(`Saved: ${outRoot}`);
  } catch (err) {
    console.warn(`Note: ${outRoot} is open/locked in Word (${err.code}).`);
  }

  try {
    fs.writeFileSync(outDocs, buffer);
    console.log(`Saved: ${outDocs}`);
  } catch (err) {
    console.warn(`Note: ${outDocs} is open/locked in Word (${err.code}).`);
  }

  console.log(`Report compilation complete! Size: ${(buffer.length / (1024 * 1024)).toFixed(2)} MB`);
}

buildLpuProjectReport().catch(console.error);
