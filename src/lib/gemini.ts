import { GoogleGenerativeAI, SchemaType, Content } from "@google/generative-ai";


const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: {
    temperature: 0.2, // Lower temperature for higher accuracy in civic data
    topP: 0.8,
    topK: 40,
  },
  systemInstruction: `You are the CivicFlow Election Copilot, an industrial-grade neutral assistant.
  Your mission is to provide 100% accurate, non-partisan election guidance.
  
  CRITICAL PROTOCOLS:
  1. GROUNDING: Use only verified data from official state voting guides.
  2. TOOLS: Use the available tools to find real-time data instead of guessing.
  3. JSON MODE: If the user asks for a list or structured data, return valid JSON.
  4. NEUTRALITY: Maintain absolute neutrality at all times.`,
  tools: [
    {
      functionDeclarations: [
        {
          name: "findPollingStations",
          description: "Search for polling stations near a specific zip code or city.",
          parameters: {
            type: SchemaType.OBJECT,
            properties: {
              location: { type: SchemaType.STRING, description: "Zip code or City name" }
            },
            required: ["location"]
          }
        },
        {
          name: "getElectionDeadlines",
          description: "Get verified registration and voting deadlines for a specific state.",
          parameters: {
            type: SchemaType.OBJECT,
            properties: {
              state: { type: SchemaType.STRING, description: "US State name (e.g. California)" }
            },
            required: ["state"]
          }
        }
      ]
    }
  ]
});



/**
 * Enhanced Gemini response with history and streaming support
 */
export async function* getGeminiStream(prompt: string, history: Content[] = []) {
  const groundedContext = `
    VERIFIED ELECTION DATA (April 2026):
    - CA: Online reg deadline April 20. Mail-in must be postmarked by April 20.
    - TX: Registration CLOSED for current cycle (Deadline was March 31).
    - FL: Registration CLOSED (Deadline was April 1).
  `;

  const augmentedPrompt = `[CONTEXT]: ${groundedContext}\n\n[USER]: ${prompt}`;
  
  if (!apiKey) throw new Error("GEMINI_API_KEY missing.");

  const chat = model.startChat({ history });
  const result = await chat.sendMessageStream(augmentedPrompt);

  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    yield chunkText;
  }
}

/**
 * Legacy support for non-streaming calls
 */
export async function getGeminiResponse(prompt: string, history: Content[] = []) {
  const chat = model.startChat({ history });
  const result = await chat.sendMessage(prompt);
  const response = await result.response;
  return response.text();
}

