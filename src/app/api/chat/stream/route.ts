import { getGeminiStream } from "@/lib/gemini";
import { NextRequest, NextResponse } from "next/server";

import { z } from "zod";

export const runtime = 'edge';

const ChatRequestSchema = z.object({
  prompt: z.string().min(1).max(2000),
  history: z.array(z.object({
    role: z.enum(["user", "model"]),
    parts: z.array(z.object({ text: z.string() }))
  })).optional()
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = ChatRequestSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: "Invalid request payload", details: result.error }, { status: 400 });
    }

    const { prompt, history: fullHistory } = result.data;


    // Industrial Standard: Truncate history to prevent token bloat and hallucination
    const optimizedHistory = (fullHistory || []).slice(-6); 



    // Create a TransformStream for streaming
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const geminiStream = getGeminiStream(prompt, optimizedHistory);
          for await (const chunk of geminiStream) {

            controller.enqueue(encoder.encode(chunk));
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Stream Route Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
