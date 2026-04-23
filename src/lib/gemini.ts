import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  systemInstruction: `You are the CivicFlow Election Copilot, a helpful and neutral assistant. 
  CRITICAL: You are GROUNDED in official election data. 
  1. Only provide information based on official state voting guides.
  2. If a user asks about deadlines, cross-reference with the provided context.
  3. Maintain a neutral, non-partisan tone.
  4. Always cite "Official State Election Data" when giving specific dates.
  5. If data for a specific location is missing, direct the user to vote.gov.`,
});

export async function getGeminiResponse(prompt: string, history: any[] = []) {
  // Simulate RAG: Inject grounded context about current election rules
  const groundedContext = `
    CURRENT ELECTION CONTEXT (Verified):
    - California: Registration deadline is 15 days before election. Online registration active.
    - Texas: Registration deadline is 30 days before election. In-person/Mail only.
    - Florida: Registration deadline is 29 days before election.
  `;

  const augmentedPrompt = `Using the following verified data: ${groundedContext}\n\nUser Question: ${prompt}`;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const chat = model.startChat({
    history: history,
    generationConfig: {
      maxOutputTokens: 1000,
    },
  });

  const result = await chat.sendMessage(augmentedPrompt);
  const response = await result.response;
  return response.text();
}
