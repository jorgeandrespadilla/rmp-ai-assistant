import { ProfessorData, SchoolData, scrapeProfessorReviews } from '@/lib/scraper';
import { AddReviewData, addReviewsToIndex } from '@/lib/vector-store';
import { v4 as uuid } from 'uuid';
import prisma from '@/lib/db';
import { createSlug } from '@/lib/utils';
import OpenAI from 'openai';
import { Prisma } from '@prisma/client';

interface PartialDbCatalogData {
  id: number;
  slug: string;
  name: string;
}

const validSentiments = ['POSITIVE', 'NEGATIVE', 'NEUTRAL'] as const;
type Sentiment = typeof validSentiments[number];

const sentimentAnalysisPrompt = `
You are a review sentiment analysis agent that takes in review content and returns the sentiment of the review. Return the sentiment of the review as either ${validSentiments.join(', ')}. Do not include any other information or character in the response, only the sentiment.
`

const createOrReturnSchool = async (scrapedSchool: SchoolData | null): Promise<PartialDbCatalogData | null> => {
  if (!scrapedSchool) {
    return null;
  }
  const schoolSlug = createSlug(scrapedSchool.name);
  return await prisma.school.upsert({
    where: {
      slug: schoolSlug,
    },
    create: {
      slug: schoolSlug,
      name: scrapedSchool.name,
      rmpUrl: scrapedSchool.rmpUrl,
    },
    update: {
      name: scrapedSchool.name,
      rmpUrl: scrapedSchool.rmpUrl,
    }
  });
}

const createOrReturnProfessor = async (scrapedProfessor: ProfessorData): Promise<PartialDbCatalogData> => {
  const school = await createOrReturnSchool(scrapedProfessor.school);

  const professorSlug = createSlug(scrapedProfessor.name);
  const professor = await prisma.professor.findFirst({
    where: {
      slug: professorSlug,
      AND: {
        school: {
          slug: school?.slug ?? undefined,
        }
      }
    }
  });
  if (professor) {
    throw new Error("Professor already exists");
  }

  if (school) {
    return await prisma.professor.create({
      data: {
        slug: professorSlug,
        name: scrapedProfessor.name,
        rmpUrl: scrapedProfessor.rmpUrl,
        school: {
          connect: {
            id: school.id,
          }
        }
      }
    });
  }
  else {
    return await prisma.professor.create({
      data: {
        slug: professorSlug,
        name: scrapedProfessor.name,
        rmpUrl: scrapedProfessor.rmpUrl,
      }
    });
  }
}

const createOrReturnSubject = async (subjectName: string): Promise<PartialDbCatalogData> => {
  const subjectSlug = createSlug(subjectName);
  return await prisma.subject.upsert({
    where: {
      slug: subjectSlug,
    },
    create: {
      slug: subjectSlug,
      name: subjectName,
    },
    update: {
      name: subjectName,
    }
  });
}

const analyzeSentiment = async (reviewContent: string): Promise<Sentiment> => {
  const openai = new OpenAI();
  const completion = await openai.chat.completions.create({
    messages: [
      { role: 'system', content: sentimentAnalysisPrompt },
      { role: 'user', content: reviewContent },
    ],
    model: 'gpt-4o',
    stream: false,
  });
  const detectedSentiment = completion.choices[0].message.content?.toUpperCase();
  if (
    !detectedSentiment || 
    !validSentiments.includes(detectedSentiment as Sentiment)
  ) {
    return 'NEUTRAL';
  }
  return detectedSentiment as Sentiment;
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url) {
      return new Response("URL is required", { status: 400 })
    }

    const scrapedResult = await scrapeProfessorReviews(url);

    const professor = await createOrReturnProfessor(scrapedResult.professor);
    const subjects = scrapedResult.reviews.map((review) => review.subjectName);
    const insertedSubjects = await Promise.all(
      subjects.map((subjectName) => createOrReturnSubject(subjectName))
    );

    const reviewsWithSentiment = await Promise.all(
      scrapedResult.reviews.map(async (review) => {
        const sentiment = await analyzeSentiment(review.content);
        return {
          content: review.content,
          qualityRating: review.qualityRating,
          difficultyRating: review.difficultyRating,
          sentiment,
          publishedAt: review.publishedAt,
          professorId: professor.id,
          subjectId: insertedSubjects.find((subject) => subject.name === review.subjectName)!.id,
        } as Prisma.ReviewCreateManyInput;
      })
    );	

    const reviews = await prisma.review.createManyAndReturn({
      data: reviewsWithSentiment,
    });

    const reviewsForIndex = reviews.map(review => {
      return {
        id: uuid(),
        content: review.content,
        reviewId: review.id,
        professorId: review.professorId,
        subjectId: review.subjectId,
      } satisfies AddReviewData;
    });
    await addReviewsToIndex(reviewsForIndex);

    return Response.json({
      scrapedData: scrapedResult
    }, { status: 200 });
  } catch (error) {
    return Response.json({
      error: { message: (error as Error).message }
    }, { status: 400 });
  }
}
