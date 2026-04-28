/**
 * @fileoverview Multimodal Voter ID Analysis API (AI-03).
 * Accepts base64-encoded images and analyzes them with Gemini multimodal.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const runtime = 'edge';

const AnalyzeRequestSchema = z.object({
  imageBase64: z.string().min(100),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  purpose: z.enum(['voter_id', 'registration', 'ballot']).optional().default('voter_id'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = AnalyzeRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request', details: parsed.error.issues }, { status: 400 });
    }

    const { imageBase64, mimeType, purpose } = parsed.data;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 503 });
    }

    const prompt = purpose === 'voter_id'
      ? `Analyze this voter ID document. Extract: 1) Document type (driver's license, state ID, passport, etc.), 2) Whether it appears to be a valid government-issued ID (yes/no/uncertain), 3) Any text you can read (name, address, ID number — respond with first letter only for privacy), 4) Any concerns or warnings. Respond as JSON: {"documentType": "...", "isValid": boolean, "extractedText": "...", "warnings": ["..."]}`
      : `Analyze this ${purpose} document and describe what you see. Respond as JSON.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inline_data: { mime_type: mimeType, data: imageBase64 } },
            ],
          }],
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          ],
        }),
      }
    );

    if (!response.ok) {
      return NextResponse.json({ error: 'AI analysis failed' }, { status: 502 });
    }

    const data = await response.json() as { candidates?: Array<{ content: { parts: Array<{ text: string }> } }> };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';

    let result;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) ?? text.match(/(\{[\s\S]*\})/);
      result = JSON.parse(jsonMatch ? jsonMatch[1] : text);
    } catch {
      result = { documentType: 'unknown', isValid: false, extractedText: text, warnings: ['Could not parse structured response'] };
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[Analyze Route Error]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
