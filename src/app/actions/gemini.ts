"use server";

import { getGeminiResponse } from "@/lib/gemini";

export async function chatWithCopilot(prompt: string, history: { role: "user" | "model"; parts: { text: string }[] }[] = []) {
  try {
    const response = await getGeminiResponse(prompt, history);
    return { success: true, content: response };
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return { success: false, error: error.message || "Failed to get AI response" };
  }
}
