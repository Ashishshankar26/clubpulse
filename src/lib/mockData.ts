import { User, Club, Application, Task, Contribution, ClubFeedback, NotificationItem } from '@/types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr_aarav',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@college.edu',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    department: 'Computer Science & Engineering',
    year: '3rd Year (Sophomore)',
    bio: 'Full-stack developer passionate about open source, Next.js, and campus tech community.',
    skills: ['React', 'Next.js', 'TypeScript', 'Node.js', 'UI/UX'],
    clubsJoined: ['club_gdsc', 'club_robocrafters'],
    xpPoints: 340,
  },
  {
    id: 'usr_priya',
    name: 'Priya Patel',
    email: 'priya.patel@college.edu',
    role: 'club_lead',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    department: 'Information Technology',
    year: '4th Year (Senior)',
    bio: 'Lead organizer for GDSC, ex-Hackathon lead. Working to solve club burnout and task delegation.',
    skills: ['Leadership', 'System Architecture', 'Event Operations', 'Sponsorships', 'Python'],
    clubsJoined: ['club_gdsc', 'club_ecell'],
    xpPoints: 890,
  },
  {
    id: 'usr_dean_rajesh',
    name: 'Dr. Rajesh Kumar',
    email: 'rajesh.kumar@college.edu',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    department: 'Dean of Student Affairs & Student Councils',
    year: 'Faculty & Council Board',
    bio: 'Overseeing all registered campus student organizations, activity credits, and compliance.',
    skills: ['Governance', 'Budget Allocation', 'Policy', 'Student Mentorship'],
    clubsJoined: [],
    xpPoints: 1200,
  },
  {
    id: 'usr_rohan',
    name: 'Rohan Mehta',
    email: 'rohan.mehta@college.edu',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    department: 'Electronics & Communication',
    year: '2nd Year',
    skills: ['Figma', 'Graphic Design', 'Motion Design'],
    clubsJoined: ['club_designhub'],
    xpPoints: 180,
  },
  {
    id: 'usr_ananya',
    name: 'Ananya Iyer',
    email: 'ananya.iyer@college.edu',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    department: 'Computer Science',
    year: '3rd Year',
    skills: ['Python', 'Machine Learning', 'Data Analysis'],
    clubsJoined: ['club_gdsc', 'club_robocrafters'],
    xpPoints: 420,
  },
  {
    id: 'usr_tanvi',
    name: 'Tanvi Verma',
    email: 'tanvi.verma@college.edu',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    department: 'Business & Management',
    year: '3rd Year',
    skills: ['Marketing', 'Pitch Decks', 'Public Relations'],
    clubsJoined: ['club_ecell'],
    xpPoints: 260,
  },
  {
    id: 'usr_kabir',
    name: 'Kabir Singh',
    email: 'kabir.singh@college.edu',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    department: 'Mechanical Engineering',
    year: '4th Year',
    skills: ['CAD Design', 'ROS', 'Microcontrollers'],
    clubsJoined: ['club_robocrafters'],
    xpPoints: 510,
  },
  {
    id: 'usr_siddharth',
    name: 'Siddharth Joshi',
    email: 'siddharth.j@college.edu',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    department: 'English Literature & Media',
    year: '2nd Year',
    skills: ['Debating', 'Editorial', 'Event Emcee', 'Content'],
    clubsJoined: ['club_illuminati'],
    xpPoints: 310,
  }
];

export const INITIAL_CLUBS: Club[] = [
  {
    id: 'club_gdsc',
    name: 'Google Developer Student Club',
    shortName: 'GDSC',
    tagline: 'Empowering student developers to build solutions for local communities.',
    description: 'GDSC is a university-based community group for students interested in Google developer technologies. We host hands-on workshops, campus hackathons, technical speaker sessions, and project building sprints.',
    category: 'Technology',
    logo: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=120&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&auto=format&fit=crop&q=80',
    leadId: 'usr_priya',
    leadName: 'Priya Patel',
    leadEmail: 'priya.patel@college.edu',
    leadAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    foundedYear: 2021,
    memberCount: 38,
    activeRecruitment: true,
    recruitmentDeadline: '2026-11-15',
    recruitmentRoles: ['Web Dev Lead', 'Cloud Specialist', 'UI/UX Designer', 'Event Ops Coordinator'],
    meetingSchedule: 'Every Wednesday at 5:30 PM (Tech Lab 302)',
    burnoutScore: 68, // High load on lead
    healthScore: 82,
    achievements: [
      'Top 10 Global Solution Challenge Finalist 2025',
      'Hosted HackSpire 2025 with 600+ campus participants',
      'Published 4 open-source community utilities'
    ],
    upcomingEvents: [
      {
        id: 'ev_1',
        title: 'Android & Jetpack Compose Workshop',
        date: '2026-11-04',
        location: 'Audi 2 & YouTube Live',
        description: 'Hands-on live coding workshop building a modern declarative Android app.'
      },
      {
        id: 'ev_2',
        title: 'Google Cloud Study Jams: Week 1',
        date: '2026-11-12',
        location: 'Virtual Classroom 4',
        description: 'Guided labs through generative AI on Vertex AI.'
      }
    ],
    socialLinks: {
      github: 'https://github.com/gdsc-campus',
      linkedin: 'https://linkedin.com',
      discord: 'https://discord.gg/gdsc'
    },
    members: [
      {
        userId: 'usr_priya',
        userName: 'Priya Patel',
        userEmail: 'priya.patel@college.edu',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        clubRole: 'Lead',
        joinedDate: '2023-08-15',
        tasksCompleted: 24,
        participationRate: 98,
        xpEarned: 890,
      },
      {
        userId: 'usr_aarav',
        userName: 'Aarav Sharma',
        userEmail: 'aarav.sharma@college.edu',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
        clubRole: 'Core Member',
        joinedDate: '2024-09-01',
        tasksCompleted: 9,
        participationRate: 85,
        xpEarned: 340,
      },
      {
        userId: 'usr_ananya',
        userName: 'Ananya Iyer',
        userEmail: 'ananya.iyer@college.edu',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        clubRole: 'Core Member',
        joinedDate: '2024-02-10',
        tasksCompleted: 11,
        participationRate: 92,
        xpEarned: 420,
      },
      {
        userId: 'usr_ghost_1',
        userName: 'Karan Mehra',
        userEmail: 'karan.m@college.edu',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        clubRole: 'General Member',
        joinedDate: '2024-09-12',
        tasksCompleted: 0,
        participationRate: 12,
        isGhostRisk: true,
        xpEarned: 10,
      },
      {
        userId: 'usr_ghost_2',
        userName: 'Rhea Kapoor',
        userEmail: 'rhea.k@college.edu',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        clubRole: 'General Member',
        joinedDate: '2024-09-15',
        tasksCompleted: 1,
        participationRate: 18,
        isGhostRisk: true,
        xpEarned: 30,
      }
    ]
  },
  {
    id: 'club_designhub',
    name: 'DesignHub - Product & UX Guild',
    shortName: 'DesignHub',
    tagline: 'Bridging empathy and digital interaction through modern product craft.',
    description: 'DesignHub brings together UI/UX designers, design researchers, 3D artists, and creative technologists. We conduct design critiques, wireframing marathons, and provide branding design support for all campus events.',
    category: 'Design & Creative',
    logo: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=120&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=1200&auto=format&fit=crop&q=80',
    leadId: 'usr_rohan',
    leadName: 'Rohan Mehta',
    leadEmail: 'rohan.mehta@college.edu',
    leadAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    foundedYear: 2022,
    memberCount: 22,
    activeRecruitment: true,
    recruitmentDeadline: '2026-11-20',
    recruitmentRoles: ['Product Designer', 'Motion Designer', 'Design Systems Specialist'],
    meetingSchedule: 'Every Friday at 4:00 PM (Design Studio 1)',
    burnoutScore: 42,
    healthScore: 89,
    achievements: [
      'Redesigned university student portal mockups',
      'Winner of National Campus Designthon 2025'
    ],
    upcomingEvents: [
      {
        id: 'ev_dh1',
        title: 'Figma Auto-Layout & Component Masterclass',
        date: '2026-11-08',
        location: 'Design Studio 1',
        description: 'Advanced design systems, design tokens, and developer handoff best practices.'
      }
    ],
    socialLinks: {
      github: 'https://github.com/designhub',
      instagram: 'https://instagram.com/designhub'
    },
    members: [
      {
        userId: 'usr_rohan',
        userName: 'Rohan Mehta',
        userEmail: 'rohan.mehta@college.edu',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        clubRole: 'Lead',
        joinedDate: '2023-08-10',
        tasksCompleted: 16,
        participationRate: 95,
        xpEarned: 520,
      }
    ]
  },
  {
    id: 'club_ecell',
    name: 'E-Cell - Entrepreneurship & Innovation',
    shortName: 'E-Cell',
    tagline: 'Fostering the next generation of founders, builders, and venture catalysts.',
    description: 'E-Cell facilitates startup incubation, seed grant mentorship, Angel Pitch Days, and networking with prominent alumni venture capitalists.',
    category: 'Entrepreneurship',
    logo: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=120&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&auto=format&fit=crop&q=80',
    leadId: 'usr_tanvi',
    leadName: 'Tanvi Verma',
    leadEmail: 'tanvi.verma@college.edu',
    leadAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    foundedYear: 2020,
    memberCount: 30,
    activeRecruitment: true,
    recruitmentDeadline: '2026-11-18',
    recruitmentRoles: ['Sponsorship Executive', 'Pitch Deck Analyst', 'Community Evangelist'],
    meetingSchedule: 'Every Monday at 6:00 PM (Incubation Centre)',
    burnoutScore: 55,
    healthScore: 84,
    achievements: [
      'Facilitated $40K in student startup micro-grants',
      'Annual E-Summit attracted 15+ angel investors'
    ],
    upcomingEvents: [
      {
        id: 'ev_ec1',
        title: 'Pitch Tank 2026: Qualifying Round',
        date: '2026-11-22',
        location: 'Main Auditorium',
        description: '10 student teams pitch their MVP to campus judges and alumni investors.'
      }
    ],
    socialLinks: {
      linkedin: 'https://linkedin.com/ecell',
      website: 'https://ecell-campus.org'
    },
    members: [
      {
        userId: 'usr_tanvi',
        userName: 'Tanvi Verma',
        userEmail: 'tanvi.verma@college.edu',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        clubRole: 'Lead',
        joinedDate: '2023-09-01',
        tasksCompleted: 14,
        participationRate: 91,
        xpEarned: 480,
      }
    ]
  },
  {
    id: 'club_robocrafters',
    name: 'RoboCrafters - Autonomous Systems Guild',
    shortName: 'RoboCrafters',
    tagline: 'Designing micro-rovers, combat bots, and automated edge-intelligence.',
    description: 'RoboCrafters brings together hardware hackers and software developers to engineer real-world mechatronics, drones, and autonomous rovers for national robotics leagues.',
    category: 'Robotics & AI',
    logo: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=120&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
    leadId: 'usr_kabir',
    leadName: 'Kabir Singh',
    leadEmail: 'kabir.singh@college.edu',
    leadAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    foundedYear: 2019,
    memberCount: 26,
    activeRecruitment: false,
    recruitmentRoles: [],
    meetingSchedule: 'Tuesdays & Thursdays at 5:00 PM (Robotics Workshop Bay)',
    burnoutScore: 61,
    healthScore: 78,
    achievements: [
      '1st Place at Robowars National Techfest 2025',
      'Developed autonomous campus mail rover prototype'
    ],
    upcomingEvents: [
      {
        id: 'ev_rc1',
        title: 'LiDAR & SLAM Navigation Sprint',
        date: '2026-11-14',
        location: 'Bay 2 Robotics Lab',
        description: 'Tuning ROS2 nodes for autonomous obstacle avoidance on physical rover.'
      }
    ],
    socialLinks: {
      github: 'https://github.com/robocrafters',
      discord: 'https://discord.gg/robocrafters'
    },
    members: [
      {
        userId: 'usr_kabir',
        userName: 'Kabir Singh',
        userEmail: 'kabir.singh@college.edu',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        clubRole: 'Lead',
        joinedDate: '2022-10-12',
        tasksCompleted: 19,
        participationRate: 94,
        xpEarned: 610,
      },
      {
        userId: 'usr_aarav',
        userName: 'Aarav Sharma',
        userEmail: 'aarav.sharma@college.edu',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
        clubRole: 'Core Member',
        joinedDate: '2024-03-01',
        tasksCompleted: 5,
        participationRate: 78,
        xpEarned: 190,
      }
    ]
  },
  {
    id: 'club_illuminati',
    name: 'Illuminati - Literary & Debating Society',
    shortName: 'Illuminati',
    tagline: 'Articulating nuance, civil discourse, and parliamentary debate.',
    description: 'The premier debating and literary society on campus. We train delegates for Model UNs, Parliamentary Debates, slam poetry, and publish the biannual student anthology.',
    category: 'Literary & Arts',
    logo: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=120&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1200&auto=format&fit=crop&q=80',
    leadId: 'usr_siddharth',
    leadName: 'Siddharth Joshi',
    leadEmail: 'siddharth.j@college.edu',
    leadAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    foundedYear: 2018,
    memberCount: 35,
    activeRecruitment: true,
    recruitmentDeadline: '2026-11-25',
    recruitmentRoles: ['Parliamentary Debater', 'Chief Editor', 'MUN Delegations Coordinator'],
    meetingSchedule: 'Every Saturday at 3:00 PM (Council Hall)',
    burnoutScore: 35,
    healthScore: 92,
    achievements: [
      'Best Delegation Award at Inter-Varsity Parliamentary Debate 2025',
      'Published Edition XIV of "The Inkpot" Anthology'
    ],
    upcomingEvents: [
      {
        id: 'ev_il1',
        title: 'British Parliamentary Debate Mock Session',
        date: '2026-11-06',
        location: 'Seminar Room B',
        description: 'Impromptu motion reveal with 15-minute prep and adjudicator feedback.'
      }
    ],
    socialLinks: {
      instagram: 'https://instagram.com/illuminati_debsoc'
    },
    members: [
      {
        userId: 'usr_siddharth',
        userName: 'Siddharth Joshi',
        userEmail: 'siddharth.j@college.edu',
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
        clubRole: 'Lead',
        joinedDate: '2023-07-20',
        tasksCompleted: 13,
        participationRate: 93,
        xpEarned: 430,
      }
    ]
  }
];

export const INITIAL_APPLICATIONS: Application[] = [
  {
    id: 'app_101',
    clubId: 'club_designhub',
    clubName: 'DesignHub - Product & UX Guild',
    userId: 'usr_aarav',
    userName: 'Aarav Sharma',
    userEmail: 'aarav.sharma@college.edu',
    userAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    appliedRole: 'Product Designer',
    statementOfPurpose: 'I have been developing web apps in Next.js and want to deepen my product design craft. I want to build accessible, elegant design systems for student events.',
    skills: ['Figma', 'Prototyping', 'User Research', 'Tailwind CSS'],
    portfolioUrl: 'https://aarav-designs.framer.website',
    status: 'under_review',
    appliedDate: '2026-10-24',
    notes: 'Strong frontend portfolio, review design samples.'
  },
  {
    id: 'app_102',
    clubId: 'club_gdsc',
    clubName: 'Google Developer Student Club',
    userId: 'usr_vikram',
    userName: 'Vikram Rathore',
    userEmail: 'vikram.r@college.edu',
    userAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    department: 'Information Technology',
    year: '2nd Year',
    appliedRole: 'Web Dev Lead',
    statementOfPurpose: 'Passionate about full-stack web applications and mentoring juniors. Built our college fest attendance scanner app.',
    skills: ['React', 'Node.js', 'MongoDB', 'REST APIs', 'Git'],
    portfolioUrl: 'https://github.com/vikram-tech',
    status: 'pending',
    appliedDate: '2026-10-25',
  },
  {
    id: 'app_103',
    clubId: 'club_gdsc',
    clubName: 'Google Developer Student Club',
    userId: 'usr_devika',
    userName: 'Devika Nair',
    userEmail: 'devika.nair@college.edu',
    userAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    department: 'Artificial Intelligence & Data Science',
    year: '2nd Year',
    appliedRole: 'Cloud Specialist',
    statementOfPurpose: 'Completed Google Cloud Associate Engineer training and eager to run community study jams and workshops.',
    skills: ['GCP', 'Docker', 'Kubernetes', 'Python', 'Terraform'],
    portfolioUrl: 'https://linkedin.com/in/devika-cloud',
    status: 'interview_scheduled',
    appliedDate: '2026-10-22',
    interviewDate: '2026-10-29 04:00 PM',
    notes: 'Outstanding cloud certifications. Great fit for GDSC cloud tracks.'
  },
  {
    id: 'app_104',
    clubId: 'club_ecell',
    clubName: 'E-Cell - Entrepreneurship & Innovation',
    userId: 'usr_meera',
    userName: 'Meera Krishnan',
    userEmail: 'meera.k@college.edu',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    department: 'Economics & Commerce',
    year: '3rd Year',
    appliedRole: 'Sponsorship Executive',
    statementOfPurpose: 'Brought 4 corporate sponsorships worth $6k for last semester model UN. Keen on corporate outreach for E-Summit.',
    skills: ['Cold Outreach', 'Negotiation', 'Pitching', 'CRM'],
    status: 'approved',
    appliedDate: '2026-10-18',
    reviewedDate: '2026-10-22',
    reviewedBy: 'Tanvi Verma'
  },
  {
    id: 'app_105',
    clubId: 'club_illuminati',
    clubName: 'Illuminati - Literary & Debating Society',
    userId: 'usr_rahul',
    userName: 'Rahul Bajaj',
    userEmail: 'rahul.b@college.edu',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    department: 'Mechanical Engineering',
    year: '1st Year',
    appliedRole: 'Parliamentary Debater',
    statementOfPurpose: 'High school debate captain and state level speaker. Looking forward to inter-varsity circuits.',
    skills: ['Public Speaking', 'Rebuttals', 'Policy Research'],
    status: 'rejected',
    appliedDate: '2026-10-15',
    reviewedDate: '2026-10-19',
    reviewedBy: 'Siddharth Joshi',
    notes: 'Did not attend the preliminary mock debate round.'
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task_001',
    clubId: 'club_gdsc',
    clubName: 'Google Developer Student Club',
    title: 'Build Live Hackathon Registration Portal',
    description: 'Develop the frontend submission portal with team registration, QR badge generator, and track selection in Next.js & Tailwind.',
    status: 'in_progress',
    priority: 'urgent',
    assigneeId: 'usr_aarav',
    assigneeName: 'Aarav Sharma',
    assigneeAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    creatorId: 'usr_priya',
    creatorName: 'Priya Patel',
    dueDate: '2026-10-30',
    estimatedHours: 12,
    tags: ['Frontend', 'Hackathon', 'Next.js'],
    xpReward: 120,
    activities: [
      {
        id: 'act_1',
        timestamp: '2026-10-24 10:00 AM',
        userId: 'usr_priya',
        userName: 'Priya Patel',
        action: 'Created task and assigned to Aarav Sharma'
      },
      {
        id: 'act_2',
        timestamp: '2026-10-25 03:30 PM',
        userId: 'usr_aarav',
        userName: 'Aarav Sharma',
        action: 'Moved status from To Do to In Progress',
        note: 'Completed UI scaffolding, integrating form state now.'
      }
    ]
  },
  {
    id: 'task_002',
    clubId: 'club_gdsc',
    clubName: 'Google Developer Student Club',
    title: 'Finalize Sponsorship Deck for Techfest 2026',
    description: 'Revise tier packages ($500, $1500, $3000), update past reach statistics, and create one-pager PDF for corporate outreach.',
    status: 'under_review',
    priority: 'high',
    assigneeId: 'usr_ananya',
    assigneeName: 'Ananya Iyer',
    assigneeAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    creatorId: 'usr_priya',
    creatorName: 'Priya Patel',
    dueDate: '2026-10-28',
    estimatedHours: 6,
    tags: ['Sponsorship', 'Operations'],
    xpReward: 90,
    submissionNote: 'Completed the 12-page pitch deck with revised metrics and student demographics.',
    submissionLink: 'https://drive.google.com/file/d/sponsorship-deck-v2/view',
    submittedAt: '2026-10-26 06:15 PM',
    activities: [
      {
        id: 'act_3',
        timestamp: '2026-10-23 11:00 AM',
        userId: 'usr_priya',
        userName: 'Priya Patel',
        action: 'Assigned task to Ananya Iyer'
      },
      {
        id: 'act_4',
        timestamp: '2026-10-26 06:15 PM',
        userId: 'usr_ananya',
        userName: 'Ananya Iyer',
        action: 'Submitted task for lead review',
        note: 'Ready for Priya to approve or request amendments.'
      }
    ]
  },
  {
    id: 'task_003',
    clubId: 'club_gdsc',
    clubName: 'Google Developer Student Club',
    title: 'Coordinate Food & Beverage Logistics for Workshop',
    description: 'Secure 120 meal boxes and refreshment drinks for Saturday workshop attendees from approved campus vendors.',
    status: 'todo',
    priority: 'medium',
    assigneeId: 'usr_priya', // Lead taking this directly -> contributing to burnout
    assigneeName: 'Priya Patel',
    assigneeAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    creatorId: 'usr_priya',
    creatorName: 'Priya Patel',
    dueDate: '2026-11-02',
    estimatedHours: 4,
    tags: ['Logistics', 'Operations'],
    xpReward: 50,
    activities: [
      {
        id: 'act_5',
        timestamp: '2026-10-25 09:00 AM',
        userId: 'usr_priya',
        userName: 'Priya Patel',
        action: 'Created task'
      }
    ]
  },
  {
    id: 'task_004',
    clubId: 'club_gdsc',
    clubName: 'Google Developer Student Club',
    title: 'Social Media Teaser Video & Instagram Carousel',
    description: 'Design 3 reel cutdowns and 10-slide carousel announcing Cloud Study Jams.',
    status: 'completed',
    priority: 'medium',
    assigneeId: 'usr_aarav',
    assigneeName: 'Aarav Sharma',
    assigneeAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    creatorId: 'usr_priya',
    creatorName: 'Priya Patel',
    dueDate: '2026-10-20',
    estimatedHours: 5,
    tags: ['Design', 'Social Media'],
    xpReward: 80,
    submissionNote: 'Exported at 1080x1350 and 9:16 aspect ratio. Posted and scheduled.',
    submissionLink: 'https://instagram.com/p/C1294871',
    submittedAt: '2026-10-19 02:00 PM',
    completedAt: '2026-10-20 10:30 AM',
    activities: [
      {
        id: 'act_6',
        timestamp: '2026-10-20 10:30 AM',
        userId: 'usr_priya',
        userName: 'Priya Patel',
        action: 'Approved task and awarded 80 XP'
      }
    ]
  },
  {
    id: 'task_005',
    clubId: 'club_gdsc',
    clubName: 'Google Developer Student Club',
    title: 'University Dean Room Approval Permission Letter',
    description: 'Draft official permission letter to Dean of Student Affairs for reserving Audi 2 on Nov 4.',
    status: 'blocked',
    priority: 'urgent',
    assigneeId: 'usr_priya',
    assigneeName: 'Priya Patel',
    assigneeAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    creatorId: 'usr_priya',
    creatorName: 'Priya Patel',
    dueDate: '2026-10-25', // Overdue!
    estimatedHours: 3,
    tags: ['Governance', 'Urgent'],
    xpReward: 60,
    activities: [
      {
        id: 'act_7',
        timestamp: '2026-10-25 04:00 PM',
        userId: 'usr_priya',
        userName: 'Priya Patel',
        action: 'Marked Blocked: Waiting on Dean Office stamp and signature'
      }
    ]
  },
  {
    id: 'task_006',
    clubId: 'club_designhub',
    clubName: 'DesignHub - Product & UX Guild',
    title: 'Design System Figma Library v2.0 Components',
    description: 'Standardize typography scale, color tokens, and button interactive states in Figma community template.',
    status: 'in_progress',
    priority: 'high',
    assigneeId: 'usr_rohan',
    assigneeName: 'Rohan Mehta',
    assigneeAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    creatorId: 'usr_rohan',
    creatorName: 'Rohan Mehta',
    dueDate: '2026-11-05',
    estimatedHours: 15,
    tags: ['Figma', 'Design Systems'],
    xpReward: 150,
    activities: []
  },
  {
    id: 'task_007',
    clubId: 'club_ecell',
    clubName: 'E-Cell - Entrepreneurship & Innovation',
    title: 'Venture Capitalist Outreach List (25 Firms)',
    description: 'Compile verified contact database of angel investors focused on early student incubations.',
    status: 'completed',
    priority: 'high',
    assigneeId: 'usr_tanvi',
    assigneeName: 'Tanvi Verma',
    assigneeAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    creatorId: 'usr_tanvi',
    creatorName: 'Tanvi Verma',
    dueDate: '2026-10-21',
    estimatedHours: 8,
    tags: ['Investor Relations', 'Research'],
    xpReward: 100,
    completedAt: '2026-10-21 05:00 PM',
    activities: []
  },
  {
    id: 'task_008',
    clubId: 'club_robocrafters',
    clubName: 'RoboCrafters - Autonomous Systems Guild',
    title: 'Solder Motor Driver PCBs for Rover Chassis',
    description: 'Assemble dual H-bridge driver circuit and test voltage regulation with 4S LiPo batteries.',
    status: 'todo',
    priority: 'urgent',
    assigneeId: 'usr_kabir',
    assigneeName: 'Kabir Singh',
    assigneeAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    creatorId: 'usr_kabir',
    creatorName: 'Kabir Singh',
    dueDate: '2026-10-29',
    estimatedHours: 7,
    tags: ['Hardware', 'Soldering'],
    xpReward: 90,
    activities: []
  }
];

export const INITIAL_CONTRIBUTIONS: Contribution[] = [
  {
    id: 'contrib_1',
    userId: 'usr_aarav',
    userName: 'Aarav Sharma',
    clubId: 'club_gdsc',
    clubName: 'Google Developer Student Club',
    taskId: 'task_004',
    taskTitle: 'Social Media Teaser Video & Instagram Carousel',
    date: '2026-10-20',
    xpEarned: 80,
    category: 'Content',
    verifiedBy: 'Priya Patel (Lead)',
    verifiedAt: '2026-10-20 10:30 AM',
    certificateHash: 'CP-GDSC-8F92A-VERIFIED'
  },
  {
    id: 'contrib_2',
    userId: 'usr_aarav',
    userName: 'Aarav Sharma',
    clubId: 'club_gdsc',
    clubName: 'Google Developer Student Club',
    taskId: 'task_prev_1',
    taskTitle: 'Landing Page Redesign for Orientation 2026',
    date: '2026-09-18',
    xpEarned: 140,
    category: 'Development',
    verifiedBy: 'Priya Patel (Lead)',
    verifiedAt: '2026-09-18 04:00 PM',
    certificateHash: 'CP-GDSC-3E41B-VERIFIED'
  },
  {
    id: 'contrib_3',
    userId: 'usr_aarav',
    userName: 'Aarav Sharma',
    clubId: 'club_robocrafters',
    clubName: 'RoboCrafters - Autonomous Systems Guild',
    taskId: 'task_prev_2',
    taskTitle: 'Telemetry Dashboard GUI for Rover Sensor Feeds',
    date: '2026-08-28',
    xpEarned: 120,
    category: 'Development',
    verifiedBy: 'Kabir Singh (Lead)',
    verifiedAt: '2026-08-28 07:15 PM',
    certificateHash: 'CP-ROBO-9C12E-VERIFIED'
  },
  {
    id: 'contrib_4',
    userId: 'usr_ananya',
    userName: 'Ananya Iyer',
    clubId: 'club_gdsc',
    clubName: 'Google Developer Student Club',
    taskId: 'task_prev_3',
    taskTitle: 'AI Prompt Engineering Workshop Curriculum',
    date: '2026-10-04',
    xpEarned: 160,
    category: 'Mentorship',
    verifiedBy: 'Priya Patel (Lead)',
    verifiedAt: '2026-10-04 03:00 PM',
    certificateHash: 'CP-GDSC-7A88C-VERIFIED'
  },
  {
    id: 'contrib_5',
    userId: 'usr_tanvi',
    userName: 'Tanvi Verma',
    clubId: 'club_ecell',
    clubName: 'E-Cell - Entrepreneurship & Innovation',
    taskId: 'task_007',
    taskTitle: 'Venture Capitalist Outreach List (25 Firms)',
    date: '2026-10-21',
    xpEarned: 100,
    category: 'Sponsorship',
    verifiedBy: 'Tanvi Verma (Lead)',
    verifiedAt: '2026-10-21 05:00 PM',
    certificateHash: 'CP-ECLL-4D21X-VERIFIED'
  }
];

export const INITIAL_FEEDBACK: ClubFeedback[] = [
  {
    id: 'fb_1',
    clubId: 'club_gdsc',
    clubName: 'Google Developer Student Club',
    userId: 'usr_aarav',
    isAnonymous: false,
    userName: 'Aarav Sharma',
    overallSatisfaction: 5,
    workloadFairness: 4,
    leadershipSupport: 5,
    eventFatigueScore: 2,
    feedbackText: 'The workshops and technical exposure have been fantastic. Priya is an incredible mentor, though I feel the core leads are shouldering too much logistics work. We should delegate more tasks to newer members!',
    submittedDate: '2026-10-22',
    sentiment: 'positive',
    responded: true,
    responseNote: 'Thank you Aarav! We are rolling out ClubPulse task boards specifically to distribute the logistics load.'
  },
  {
    id: 'fb_2',
    clubId: 'club_gdsc',
    clubName: 'Google Developer Student Club',
    isAnonymous: true,
    overallSatisfaction: 3,
    workloadFairness: 2,
    leadershipSupport: 4,
    eventFatigueScore: 4,
    feedbackText: 'Felt a bit overwhelmed last week with back-to-back event rehearsals right before mid-terms. Need clearer deadlines and advance notice for logistics shifts.',
    submittedDate: '2026-10-24',
    sentiment: 'concerning',
    responded: false
  },
  {
    id: 'fb_3',
    clubId: 'club_designhub',
    clubName: 'DesignHub - Product & UX Guild',
    isAnonymous: false,
    userName: 'Rohan Mehta',
    overallSatisfaction: 5,
    workloadFairness: 5,
    leadershipSupport: 5,
    eventFatigueScore: 1,
    feedbackText: 'The asynchronous design critiques in Figma have been extremely productive. Great balance of creativity without mandatory late night meetings.',
    submittedDate: '2026-10-25',
    sentiment: 'positive',
    responded: true,
    responseNote: 'Thrilled to hear this! Keeping synchronous meetings short is our priority.'
  },
  {
    id: 'fb_4',
    clubId: 'club_ecell',
    clubName: 'E-Cell - Entrepreneurship & Innovation',
    isAnonymous: true,
    overallSatisfaction: 4,
    workloadFairness: 3,
    leadershipSupport: 4,
    eventFatigueScore: 3,
    feedbackText: 'Great networking opportunities with founders. Would love more structured guidance for junior members making cold outreach calls.',
    submittedDate: '2026-10-23',
    sentiment: 'neutral',
    responded: false
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    userId: 'usr_priya',
    title: 'Burnout Risk Warning: Task Concentration',
    message: 'You are currently assigned 65% of all active GDSC tasks with 2 overdue items. Consider delegating to 4 available core members.',
    type: 'burnout_alert',
    link: '/workload',
    createdAt: '2 hours ago',
    read: false
  },
  {
    id: 'notif_2',
    userId: 'usr_priya',
    title: 'New Member Application Received',
    message: 'Vikram Rathore applied for "Web Dev Lead" in GDSC with 5 portfolio repositories.',
    type: 'recruitment',
    link: '/recruitment',
    createdAt: '5 hours ago',
    read: false
  },
  {
    id: 'notif_3',
    userId: 'usr_priya',
    title: 'Task Submitted for Review',
    message: 'Ananya Iyer submitted "Finalize Sponsorship Deck for Techfest 2026" for your approval.',
    type: 'task',
    link: '/tasks',
    createdAt: '1 day ago',
    read: false
  },
  {
    id: 'notif_4',
    userId: 'usr_aarav',
    title: 'Task Assigned by Priya Patel',
    message: 'You were assigned "Build Live Hackathon Registration Portal" (120 XP). Due in 3 days.',
    type: 'task',
    link: '/tasks',
    createdAt: '1 day ago',
    read: false
  },
  {
    id: 'notif_5',
    userId: 'usr_aarav',
    title: 'Application Status Update',
    message: 'Your application for "Product Designer" at DesignHub is now Under Review.',
    type: 'recruitment',
    link: '/clubs/club_designhub',
    createdAt: '2 days ago',
    read: true
  },
  {
    id: 'notif_6',
    userId: 'usr_dean_rajesh',
    title: 'Campus Club Health Summary Available',
    message: 'Quarterly compliance and member participation index updated for 5 student organizations.',
    type: 'system',
    link: '/analytics',
    createdAt: '3 days ago',
    read: false
  }
];
