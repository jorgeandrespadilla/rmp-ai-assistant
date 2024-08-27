import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";

interface QueryReviewData {
  id: string;
  professorId: string;
  subjectId?: string;
  content: string;
}

interface AddReviewData {
  id: string;
  content: string;
  professorId: string;
  subjectId?: string;
}

interface AddReviewVector {
  id: string;
  values: number[];
  metadata: {
    content: string;
    professorId: string;
    subjectId?: string;
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
    topK: 5,
    includeMetadata: true,
    vector: embedding.data[0].embedding,
  });

  return results.matches.map((match) => {
    const metadata = match.metadata || {};
    return {
      id: match.id,
      professorId: metadata.professorId.toString(),
      subjectId: metadata.subjectId?.toString(),
      content: metadata.content.toString(),
    } satisfies QueryReviewData;
  });
}

export const addReviewsToIndex = async (review: AddReviewData) => {
  const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });
  const index = pc.index(process.env.PINECONE_INDEX_NAME!).namespace('ns1');

  const openai = new OpenAI();
  const embedding = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: review.content,
    encoding_format: 'float',
  });

  const vector: AddReviewVector = {
    id: review.id,
    values: embedding.data[0].embedding,
    metadata: {
      content: review.content,
      professorId: review.professorId,
      subjectId: review.subjectId,
    }
  };

  await index.upsert([vector]);
}
