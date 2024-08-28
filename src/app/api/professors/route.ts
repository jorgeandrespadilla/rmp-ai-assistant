import prisma from '@/lib/db';

interface ProfessorCatalogData {
  id: number;
  slug: string;
  name: string;
  school: string | null;
}

export async function GET(req: Request) {
  try {
    const professors = await prisma.professor.findMany({
      include: {
        school: true,
      }
    });

    return Response.json({
      professors: professors.map((professor) => ({
        id: professor.id,
        slug: professor.slug,
        name: professor.name,
        school: professor.school?.name ?? null,
      } satisfies ProfessorCatalogData))
    }, { status: 200 });
  } catch (error) {
    return Response.json({
      error: { message: (error as Error).message }
    }, { status: 400 });
  }
}
