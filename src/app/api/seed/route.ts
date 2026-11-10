import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import UserModel from '@/models/User';
import ClubModel from '@/models/Club';
import TaskModel from '@/models/Task';
import ApplicationModel from '@/models/Application';
import ContributionModel from '@/models/Contribution';
import FeedbackModel from '@/models/Feedback';
import { hashPassword } from '@/lib/auth';
import { INITIAL_USERS, INITIAL_CLUBS, INITIAL_TASKS } from '@/lib/mockData';

export async function GET() {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { success: false, message: 'MONGODB_URI not defined in .env.local' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const defaultHashedPassword = await hashPassword('college123');

    // 1. Seed or Upgrade Users with Bcrypt Hashing
    let usersCreated = 0;
    let usersUpdated = 0;
    for (const u of INITIAL_USERS) {
      const existing = await UserModel.findOne({
        $or: [{ registrationNumber: u.registrationNumber }, { email: u.email }],
      });
      if (!existing) {
        await UserModel.create({
          name: u.name,
          registrationNumber: u.registrationNumber,
          email: u.email,
          password: defaultHashedPassword,
          role: u.role,
          avatar: u.avatar,
          department: u.department,
          year: u.year,
          bio: u.bio || '',
          skills: u.skills,
          clubsJoined: u.clubsJoined,
          xpPoints: u.xpPoints,
          status: 'active',
        });
        usersCreated++;
      } else {
        // Ensure password is safe bcrypt hash
        if (existing.password && !existing.password.startsWith('$2')) {
          existing.password = defaultHashedPassword;
          existing.status = 'active';
          await existing.save();
          usersUpdated++;
        }
      }
    }

    // 2. Seed Clubs
    let clubsCreated = 0;
    for (const c of INITIAL_CLUBS) {
      const existing = await ClubModel.findOne({ id: c.id });
      if (!existing) {
        await ClubModel.create({
          id: c.id,
          name: c.name,
          shortName: c.shortName,
          tagline: c.tagline,
          description: c.description,
          category: c.category,
          logo: c.logo,
          banner: c.banner,
          leadId: c.leadId,
          leadName: c.leadName,
          leadEmail: c.leadEmail,
          leadAvatar: c.leadAvatar,
          foundedYear: c.foundedYear,
          memberCount: c.memberCount,
          activeRecruitment: c.activeRecruitment,
          recruitmentDeadline: c.recruitmentDeadline,
          recruitmentRoles: c.recruitmentRoles,
          meetingSchedule: c.meetingSchedule,
          burnoutScore: c.burnoutScore,
          healthScore: c.healthScore,
          achievements: c.achievements,
          members: c.members,
        });
        clubsCreated++;
      }
    }

    // 3. Seed Tasks
    let tasksCreated = 0;
    for (const t of INITIAL_TASKS) {
      const existing = await TaskModel.findOne({ id: t.id });
      if (!existing) {
        await TaskModel.create({
          id: t.id,
          clubId: t.clubId,
          clubName: t.clubName,
          title: t.title,
          description: t.description,
          assigneeId: t.assigneeId,
          assigneeName: t.assigneeName,
          assigneeAvatar: t.assigneeAvatar,
          priority: t.priority,
          status: t.status,
          dueDate: t.dueDate,
          estimatedHours: t.estimatedHours,
          actualHours: (t as any).actualHours,
          tags: t.tags,
          xpReward: t.xpReward,
          submissionNote: t.submissionNote,
          submissionLink: t.submissionLink,
          proofHash: (t as any).proofHash,
        });
        tasksCreated++;
      }
    }

    // 4. Seed Applications (Module A)
    let applicationsCreated = 0;
    const existingApps = await ApplicationModel.countDocuments();
    if (existingApps === 0) {
      await ApplicationModel.create([
        {
          clubId: 'club_gdsc',
          clubName: 'Google Developer Student Club',
          userId: 'usr_arjun',
          userName: 'Arjun Mehta',
          userEmail: 'arjun.mehta@college.edu',
          department: 'Computer Science',
          year: '2nd Year',
          appliedRole: 'Frontend Developer',
          statementOfPurpose: 'Passionate about web performance, React, and creating open-source campus tools.',
          skills: ['React', 'Next.js', 'Tailwind CSS'],
          portfolioUrl: 'https://github.com/arjun-dev',
          status: 'pending',
          appliedDate: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
        },
        {
          clubId: 'club_e_cell',
          clubName: 'Entrepreneurship Cell',
          userId: 'usr_rohan',
          userName: 'Rohan Verma',
          userEmail: 'rohan.v@college.edu',
          department: 'Mechanical Engineering',
          year: '3rd Year',
          appliedRole: 'Sponsorship Lead',
          statementOfPurpose: 'Previously closed 3 corporate sponsorships for TechFest 2024.',
          skills: ['Pitching', 'Negotiations', 'Budgeting'],
          status: 'under_review',
          appliedDate: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
        },
      ]);
      applicationsCreated = 2;
    }

    // 5. Seed Contributions (Module B)
    let contributionsCreated = 0;
    const existingContribs = await ContributionModel.countDocuments();
    if (existingContribs === 0) {
      await ContributionModel.create([
        {
          userId: 'usr_arjun',
          userName: 'Arjun Mehta',
          clubId: 'club_gdsc',
          clubName: 'Google Developer Student Club',
          taskId: 'task_001',
          taskTitle: 'Revamp GDSC Website Landing Page',
          date: '2026-10-15',
          xpEarned: 150,
          category: 'Development',
          verifiedBy: 'usr_lead_priya',
          verifiedAt: '2026-10-16T14:30:00Z',
          certificateHash: 'sha256-a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
        },
      ]);
      contributionsCreated = 1;
    }

    // 6. Seed Anonymous Feedback (Module C)
    let feedbackCreated = 0;
    const existingFeedback = await FeedbackModel.countDocuments();
    if (existingFeedback === 0) {
      await FeedbackModel.create([
        {
          clubId: 'club_gdsc',
          clubName: 'Google Developer Student Club',
          isAnonymous: true,
          eligibilityHash: 'anon_hash_sample_member_1',
          overallSatisfaction: 4,
          workloadFairness: 4,
          leadershipSupport: 5,
          eventFatigueScore: 2,
          feedbackText: 'Great mentoring from Priya! Deadlines during midterms were handled flexibly.',
          sentiment: 'positive',
          submittedDate: '2026-10-20',
        },
        {
          clubId: 'club_gdsc',
          clubName: 'Google Developer Student Club',
          isAnonymous: true,
          eligibilityHash: 'anon_hash_sample_member_2',
          overallSatisfaction: 3,
          workloadFairness: 2,
          leadershipSupport: 4,
          eventFatigueScore: 4,
          feedbackText: 'Too many meetings in the last week before hackathon, feeling slightly burned out.',
          sentiment: 'concerning',
          submittedDate: '2026-10-25',
        },
      ]);
      feedbackCreated = 2;
    }

    const totalUsers = await UserModel.countDocuments();
    const totalClubs = await ClubModel.countDocuments();
    const totalTasks = await TaskModel.countDocuments();
    const totalApps = await ApplicationModel.countDocuments();
    const totalContribs = await ContributionModel.countDocuments();
    const totalFeedback = await FeedbackModel.countDocuments();

    return NextResponse.json({
      success: true,
      message: 'MongoDB Atlas database populated with production-grade schemas, bcrypt hashing, and audit trails!',
      stats: {
        usersCreated,
        usersUpdated,
        clubsCreated,
        tasksCreated,
        applicationsCreated,
        contributionsCreated,
        feedbackCreated,
        totalInDb: {
          users: totalUsers,
          clubs: totalClubs,
          tasks: totalTasks,
          applications: totalApps,
          contributions: totalContribs,
          feedback: totalFeedback,
        },
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Database sync failed';
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
