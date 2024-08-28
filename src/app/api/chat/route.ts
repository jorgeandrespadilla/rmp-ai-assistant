import { NextResponse } from 'next/server';
import { queryReviewsFromIndex } from '@/lib/vector-store';
import prisma from '@/lib/db';
import OpenAI from 'openai';

interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

const systemPrompt = `
You are a rate my professor agent to help students find classes, that takes in user questions and answers them.
For every user question, the top 3 professors that match the user question are returned.
Use them to answer the question if needed. Don't invent fake professors. Just use the information you have. If you don't have the information, just say so. Always be helpful and polite. Use markdown to format your responses. Always delimit each review so that the user can easily read them.
`;

export async function POST(req: Request) {
    const data = await req.json();
    const lastMessage: ChatMessage = data[data.length - 1];

    const indexResults = await queryReviewsFromIndex(lastMessage.content);
    const resultReviewIds = indexResults.map((match) => match.reviewId);
    
    const dbResults = await prisma.review.findMany({
        where: {
          id: {
            in: resultReviewIds,
          }
        },
        include: {
          professor: true,
          subject: true,
        }
    });

    let resultString = 'Similar Results:';
    dbResults.forEach((match) => {
        resultString += `
        \n\n
        Professor: ${match.professor.name}
        Subject: ${match.subject.name}
        Review: ${match.content}
        Quality Rating: ${match.qualityRating}
        Difficulty Rating: ${match.difficultyRating}
        `;
    });

    const lastMessageContent = lastMessage.content + resultString;
    const lastDataWithoutLastMessage = data.slice(0, data.length - 1).map((msg: any) => ({
        role: msg.role as 'system' | 'user' | 'assistant',
        content: msg.content,
    }));

    const openai = new OpenAI();
    const completion = await openai.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          ...lastDataWithoutLastMessage,
          { role: 'user', content: lastMessageContent },
        ],
        model: 'gpt-4o',
        stream: true,
    });

    const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          try {
            for await (const chunk of completion) {
              const content = chunk.choices[0]?.delta?.content;
              if (content) {
                const text = encoder.encode(content);
                controller.enqueue(text);
              }
            }
          } catch (err) {
            controller.error(err);
          } finally {
            controller.close();
          }
        },
    });
    return new NextResponse(stream);
}
