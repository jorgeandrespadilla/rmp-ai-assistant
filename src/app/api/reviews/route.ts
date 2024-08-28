import prisma from '@/lib/db';
import { Prisma } from '@prisma/client';
import { NextRequest } from 'next/server';

export interface ReviewData {
  content: string
  qualityRating: number
  difficultyRating: number
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'
  publishedAt: string
  subject?: {
    name: string
  }
}

const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

const getReviews = async (professorSlug: string, timeRange: string): Promise<ReviewData[]> => {
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
    const endDate = new Date();
    const startDate = new Date(endDate.getFullYear() - parseInt(timeRange), endDate.getMonth(), 1); // Start from the same month
    // const startDate = new Date(endDate.getFullYear() - parseInt(timeRange), 0, 1); // Start from January

    whereClause.publishedAt = {
      gte: startDate,
      lt: endDate,
    };
  }

  const reviews = await prisma.review.findMany({
    where: whereClause,
    orderBy: {
      publishedAt: 'desc',
    },
    include: {
      subject: true,
    },
  });

  return reviews.map((review) => ({
    content: review.content,
    qualityRating: review.qualityRating,
    difficultyRating: review.difficultyRating,
    sentiment: review.sentiment!,
    publishedAt: formatDate(review.publishedAt),
    subject: review.subject ? { name: review.subject.name } : undefined,
  } satisfies ReviewData));
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

    const reviews = await getReviews(professorSlug, timeRange);

    return Response.json({
      reviews,
    }, { status: 200 });
  } catch (error) {
    return Response.json({
      error: { message: (error as Error).message }
    }, { status: 400 });
  }
}
