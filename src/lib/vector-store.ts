import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";

interface QueryReviewData {
  id: string;
  content: string;
  reviewId: number;
  professorId: number;
  subjectId?: number;
}

interface AddReviewData {
  id: string;
  content: string;
  reviewId: number;
  professorId: number;
  subjectId?: number;
}

interface AddReviewVector {
  id: string;
  values: number[];
  metadata: {
    content: string;
    reviewId: number;
    professorId: number;
    subjectId?: number;
  }
}

export const queryReviewsFromIndex = async (query: string, topK: number = 5): Promise<QueryReviewData[]> => {
  const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });
  const index = pc.index(process.env.PINECONE_INDEX_NAME!).namespace('ns1');

  const openai = new OpenAI();
  const embedding = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
    encoding_format: 'float',
  });

  const results = await index.query({
    topK: topK,
    includeMetadata: true,
    vector: embedding.data[0].embedding,
  });

  return results.matches.map((match) => {
    const metadata = match.metadata || {};
    return {
      id: match.id,
      content: metadata.content.toString(),
      reviewId: metadata.reviewId as number,
      professorId: metadata.professorId as number,
      subjectId: metadata.subjectId as number,
    } satisfies QueryReviewData;
  });
}

export const addReviewsToIndex = async (reviews: AddReviewData[]) => {
  const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });
  const index = pc.index(process.env.PINECONE_INDEX_NAME!).namespace('ns1');

  const openai = new OpenAI();
  const vectors: AddReviewVector[] = []
  
  for (const review of reviews) {
    const embedding = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: review.content,
      encoding_format: 'float',
    });
    vectors.push({
      id: review.id,
      values: embedding.data[0].embedding,
      metadata: {
        content: review.content,
        reviewId: review.reviewId,
        professorId: review.professorId,
        subjectId: review.subjectId,
      }
    });
  }

  await index.upsert(vectors);
}
