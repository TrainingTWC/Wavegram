
import { GoogleGenAI } from "@google/genai";

const getAI = () => {
  const apiKey = process.env.API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing");
  }
  return new GoogleGenAI({ apiKey });
};

export const generatePostContent = async (topic: string): Promise<string> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a world-class barista and social media manager for "Wavegram", a premium third-wave coffee community. Write a short, aesthetic "Wave" post (max 280 characters) about this topic: "${topic}". Use an engaging, slightly sophisticated yet passionate tone about the art of the perfect pour. Include relevant emojis (like ☕, ✨, 🌿, 🧊) and 1-2 coffee-related hashtags.`,
      config: {
        temperature: 0.8,
        topP: 0.95,
      }
    });
    return response.text || "Failed to brew content.";
  } catch (error) {
    console.error("AI Generation error:", error);
    return "The milk is frothing... try again in a bit.";
  }
};

export const suggestReply = async (postContent: string): Promise<string[]> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Given the following coffee-related post: "${postContent}", suggest 3 short, enthusiastic replies from the perspective of an expert barista. Return only the replies separated by double pipes (||).`,
    });
    const text = response.text || "";
    return text.split('||').map(s => s.trim()).filter(Boolean);
  } catch (error) {
    console.error("AI Reply error:", error);
    return ["Love this brew!", "Drop the recipe!", "Coffee goals! ✨"];
  }
};
