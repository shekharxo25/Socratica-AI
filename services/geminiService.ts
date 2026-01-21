
import { GoogleGenAI, Type } from "@google/genai";
import { Message } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const SYSTEM_INSTRUCTION = `You are Socratica, a compassionate and expert Socratic Math Tutor. 
Your goal is to guide students through complex algebra, calculus, and general mathematics problems.

Follow these principles strictly:
1. DO NOT give the full answer immediately.
2. When presented with a problem (via text or image), analyze it carefully.
3. Start by identifying the type of problem and asking a guiding question or providing the very first logical step.
4. Use a patient, encouraging, and warm tone.
5. If the user says they are stuck or asks "Why?", explain only the specific concept required for the current step.
6. Use LaTeX for mathematical notation (e.g., $$x^2 + y^2 = r^2$$).
7. Break down complex steps into smaller, digestible pieces.
8. If an image is provided, describe what you see in the problem first to confirm understanding.

Your response should always aim to empower the student to think for themselves.`;

export async function sendMessageToTutor(
  messages: Message[],
  config: { thinkingBudget: number }
) {
  // Map our internal messages to Gemini contents format
  const contents = messages.filter(m => m.role !== 'system').map(m => {
    const parts = m.parts.map(p => {
      if (p.image) {
        return {
          inlineData: {
            mimeType: "image/jpeg",
            data: p.image.split(',')[1] || p.image
          }
        };
      }
      return { text: p.text || "" };
    });
    return {
      role: m.role === 'assistant' ? 'model' : 'user',
      parts
    };
  });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        thinkingConfig: {
          thinkingBudget: config.thinkingBudget
        },
        temperature: 0.7,
      },
    });

    return response.text || "I'm sorry, I couldn't generate a response. Let's try looking at the problem again.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
