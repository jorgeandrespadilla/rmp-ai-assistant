import { ProfessorData, SchoolData, scrapeProfessorReviews } from '@/lib/scraper';
import { AddReviewData, addReviewsToIndex } from '@/lib/vector-store';
import { v4 as uuid } from 'uuid';
import prisma from '@/lib/db';
import { createSlug } from '@/lib/utils';

interface PartialDbCatalogData {
  id: number;
  slug: string;
  name: string;
}

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
    },
    update: {
      name: scrapedSchool.name,
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

    const reviews = await prisma.review.createManyAndReturn({
      data: scrapedResult.reviews.map((review) => ({
        content: review.content,
        qualityRating: review.qualityRating,
        difficultyRating: review.difficultyRating,
        sentiment: 'NEUTRAL', // TODO: Add sentiment analysis
        publishedAt: review.publishedAt,
        professorId: professor.id,
        subjectId: insertedSubjects.find((subject) => subject.name === review.subjectName)!.id,
      })),
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
