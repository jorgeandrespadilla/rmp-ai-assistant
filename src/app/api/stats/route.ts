import prisma from '@/lib/db';
import { Prisma } from '@prisma/client';
import { NextRequest } from 'next/server';

interface PieChartData {
  totalReviews: number;
  timeRangeLabel: string;
  categories: { [key: string]: number };
  predominantCategory: string;
}

interface LinearChartData {
  points: {
    date: string;
    POSITIVE: number;
    NEUTRAL: number;
    NEGATIVE: number;
  }[];
}

export interface ReviewStatsData {
  pie: PieChartData;
  linear: LinearChartData;
}

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0]; // Format date as YYYY-MM-DD
}

const getSentimentPieStats = async (professorSlug: string, timeRange: string): Promise<PieChartData> => {
  const groupByArgs = {
    by: ['sentiment'],
    where: {
      professor: {
        slug: professorSlug,
      },
      publishedAt: {
        gte: undefined as Date | undefined,
        lt: undefined as Date | undefined,
      },
    },
    _count: {
      sentiment: true,
    }
  } satisfies Prisma.ReviewGroupByArgs;
  let timeRangeLabel = 'All time';

  if (timeRange !== 'all') {
    const startDate = new Date(new Date().getFullYear() - parseInt(timeRange), 0, 1);
    const endDate = new Date();

    groupByArgs.where = {
      ...groupByArgs.where,
      publishedAt: {
        gte: startDate,
        lt: endDate,
      }
    }

    timeRangeLabel = `${formatDate(startDate)} - ${formatDate(endDate)}`;
  }

  const pieStats = await prisma.review.groupBy(groupByArgs);

  const totalReviews = pieStats.reduce((acc, item) => acc + item._count!.sentiment, 0);

  const categories: { [key: string]: number } = {};
  const order = ['POSITIVE', 'NEUTRAL', 'NEGATIVE'];
  order.forEach((item) => {
    categories[item] = pieStats.find((stat) => stat.sentiment === item)?._count.sentiment ?? 0;
  });

  const predominantCategory = Object.keys(categories)
    .reduce((a, b) => categories[a] > categories[b] ? a : b);

  return {
    totalReviews,
    timeRangeLabel,
    categories,
    predominantCategory,
  };
}

const getLinearChartData = async (professorSlug: string, timeRange: string): Promise<LinearChartData> => {
  const whereClause: Prisma.ReviewWhereInput = {
    professor: {
      slug: professorSlug,
    },
    publishedAt: {
      gte: undefined as Date | undefined,
      lt: undefined as Date | undefined,
    },
  };

  if (timeRange !== 'all') {
    const startDate = new Date(new Date().getFullYear() - parseInt(timeRange), 0, 1);
    const endDate = new Date();

    whereClause.publishedAt = {
      gte: startDate,
      lt: endDate,
    };
  }

  const reviews = await prisma.review.findMany({
    where: whereClause,
    orderBy: {
      publishedAt: 'asc',
    },
    select: {
      publishedAt: true,
      sentiment: true,
    },
  });

  const accumulatedCounts: { [key: string]: { POSITIVE: number; NEUTRAL: number; NEGATIVE: number } } = {};
  let POSITIVE = 0;
  let NEUTRAL = 0;
  let NEGATIVE = 0;

  reviews.forEach(review => {
    const date = formatDate(review.publishedAt);

    if (!accumulatedCounts[date]) {
      accumulatedCounts[date] = { POSITIVE, NEUTRAL, NEGATIVE };
    }

    if (review.sentiment === 'POSITIVE') {
      POSITIVE++;
    } else if (review.sentiment === 'NEUTRAL') {
      NEUTRAL++;
    } else if (review.sentiment === 'NEGATIVE') {
      NEGATIVE++;
    }

    accumulatedCounts[date] = { POSITIVE, NEUTRAL, NEGATIVE };
  });

  const points = Object.keys(accumulatedCounts).map(date => ({
    date,
    ...accumulatedCounts[date],
  }));

  return { points };
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const professorSlug = searchParams.get('professor') ?? '';
    if (!professorSlug) {
      throw new Error('Professor slug is required');
    }
    const timeRange = searchParams.get('timeRange') ?? 'all';
    if (!['1y', '10y', 'all'].includes(timeRange)) {
      throw new Error('Invalid time range');
    }

    const pieStats = await getSentimentPieStats(professorSlug, timeRange);
    const linearStats = await getLinearChartData(professorSlug, timeRange);

    return Response.json({
      stats: {
        pie: pieStats,
        linear: linearStats
      }
    }, { status: 200 });
  } catch (error) {
    return Response.json({
      error: { message: (error as Error).message }
    }, { status: 400 });
  }
}
