import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import ClubModel from '@/models/Club';
import TaskModel from '@/models/Task';
import ContributionModel from '@/models/Contribution';
import UserModel from '@/models/User';
import FeedbackModel from '@/models/Feedback';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const clubId = searchParams.get('clubId');

    const totalClubs = await ClubModel.countDocuments();
    const totalStudents = await UserModel.countDocuments({ role: 'student' });
    const totalTasks = await TaskModel.countDocuments();
    const completedTasks = await TaskModel.countDocuments({ status: 'completed' });
    const verifiedContributions = await ContributionModel.countDocuments();

    // Sum of all XP distributed across verified contributions
    const xpAggregation = await ContributionModel.aggregate([
      { $group: { _id: null, totalXp: { $sum: '$xpEarned' } } },
    ]);
    const totalXpAwarded = xpAggregation.length > 0 ? xpAggregation[0].totalXp : 0;

    // Contributions by Category
    const categoryAggregation = await ContributionModel.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, xp: { $sum: '$xpEarned' } } },
      { $sort: { count: -1 } },
    ]);

    // Top active contributors
    const topContributors = await ContributionModel.aggregate([
      {
        $group: {
          _id: '$userId',
          userName: { $first: '$userName' },
          contributionsCount: { $sum: 1 },
          totalXp: { $sum: '$xpEarned' },
        },
      },
      { $sort: { totalXp: -1 } },
      { $limit: 5 },
    ]);

    // Average campus satisfaction from feedback
    const feedbackAgg = await FeedbackModel.aggregate([
      {
        $group: {
          _id: null,
          avgSatisfaction: { $avg: '$overallSatisfaction' },
          avgWorkload: { $avg: '$workloadFairness' },
          avgFatigue: { $avg: '$eventFatigueScore' },
        },
      },
    ]);

    const platformSatisfaction =
      feedbackAgg.length > 0 ? Math.round(feedbackAgg[0].avgSatisfaction * 10) / 10 : 4.5;
    const platformWorkload =
      feedbackAgg.length > 0 ? Math.round(feedbackAgg[0].avgWorkload * 10) / 10 : 4.2;
    const platformFatigue =
      feedbackAgg.length > 0 ? Math.round(feedbackAgg[0].avgFatigue * 10) / 10 : 2.1;

    let clubSpecificData = null;
    if (clubId) {
      const club = await ClubModel.findOne({ id: clubId }).lean();
      if (club) {
        const clubTasks = await TaskModel.countDocuments({ clubId });
        const clubCompletedTasks = await TaskModel.countDocuments({ clubId, status: 'completed' });
        const clubContribs = await ContributionModel.countDocuments({ clubId });
        const clubXpAgg = await ContributionModel.aggregate([
          { $match: { clubId } },
          { $group: { _id: null, totalXp: { $sum: '$xpEarned' } } },
        ]);

        clubSpecificData = {
          clubId: club.id,
          name: club.name,
          memberCount: club.memberCount,
          totalTasks: clubTasks,
          completedTasks: clubCompletedTasks,
          verifiedContributions: clubContribs,
          totalXpEarned: clubXpAgg.length > 0 ? clubXpAgg[0].totalXp : 0,
          healthScore: club.healthScore,
          burnoutScore: club.burnoutScore,
        };
      }
    }

    return NextResponse.json({
      success: true,
      platformMetrics: {
        totalClubs,
        totalStudents,
        totalTasks,
        completedTasks,
        taskCompletionRate:
          totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100,
        verifiedContributions,
        totalXpAwarded,
        satisfactionRating: platformSatisfaction,
        workloadFairnessRating: platformWorkload,
        eventFatigueIndex: platformFatigue,
      },
      categoryBreakdown: categoryAggregation.map((c) => ({
        category: c._id,
        contributions: c.count,
        xp: c.xp,
      })),
      topContributors: topContributors.map((tc) => ({
        userId: tc._id,
        userName: tc.userName,
        contributionsCount: tc.contributionsCount,
        totalXp: tc.totalXp,
      })),
      clubSpecific: clubSpecificData,
    });
  } catch (error: unknown) {
    console.error('[ANALYTICS_GET_ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve analytics' },
      { status: 500 }
    );
  }
}
