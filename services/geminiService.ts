import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ImageSize, AspectRatio } from "../types";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing from environment variables.");
    throw new Error("API Key missing");
  }
  return new GoogleGenAI({ apiKey });
};

// --- Text Generation Models ---

export const generateTopicIdeas = async (major: string, direction: string, research?: string): Promise<string> => {
  const ai = getAiClient();
  const prompt = `Generate 3 potential thesis topics for a student in Major: ${major}, Research Direction: ${direction}. 
  ${research ? `Specific Research Interest: ${research}` : ''}.
  Return the result as a JSON array where each object has "title" and "overview" properties. 
  Ensure all content (title and overview) is in Simplified Chinese.
  Do not use Markdown formatting in the response, just raw JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });
    return response.text || "[]";
  } catch (error) {
    console.error("Error generating topics:", error);
    return "[]";
  }
};

export const analyzeTopicDocs = async (promptText: string): Promise<string> => {
  const ai = getAiClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the provided context regarding a thesis proposal. User prompt: ${promptText}. Provide a constructive critique and understanding of the direction. Please respond in Simplified Chinese.`,
    });
    return response.text || "";
  } catch (error) {
    console.error("Error analyzing docs:", error);
    return "Error generating analysis.";
  }
};

export const generateOutline = async (topicTitle: string, topicOverview: string): Promise<string> => {
  const ai = getAiClient();
  const prompt = `Create a structured thesis outline for the topic: "${topicTitle}". Overview: ${topicOverview}. 
  Return a JSON array where each object has "title" (the section header) and "content" (a brief overview of that section, approx 50 words).
  Ensure all content is in Simplified Chinese.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });
    return response.text || "[]";
  } catch (error) {
    console.error("Error generating outline:", error);
    return "[]";
  }
};

export const regenerateSection = async (currentContent: string, instruction: string): Promise<string> => {
  const ai = getAiClient();
  const prompt = `Rewrite the following thesis section content based on the user's instruction.
  
  Original Content: "${currentContent}"
  
  Instruction: "${instruction}"
  
  Provide only the rewritten text in Simplified Chinese.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || currentContent;
  } catch (error) {
    console.error("Error regenerating section:", error);
    return currentContent;
  }
};

export const generateRefinementSuggestions = async (content: string): Promise<string> => {
  const ai = getAiClient();
  const prompt = `Act as a thesis advisor. Review the following text and provide 3 specific suggestions for improvement (e.g., missing citations, weak theoretical grounding).
  Return a JSON array where each object has "text" (the specific sentence or phrase to highlight) and "comment" (your suggestion).
  Ensure all comments are in Simplified Chinese.
  
  Text to review: "${content.substring(0, 5000)}..."`; // Truncate to avoid huge context for demo

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });
    return response.text || "[]";
  } catch (error) {
    console.error("Error generating suggestions:", error);
    return "[]";
  }
};

// --- Image Generation Models (Nano Banana Pro / gemini-3-pro-image-preview) ---

export const generateThesisImage = async (prompt: string, size: ImageSize): Promise<string | null> => {
  const ai = getAiClient();
  try {
    // Note: The SDK currently returns inlineData or a URI depending on config.
    // For browser environment, we usually get base64.
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          imageSize: size, // 1K, 2K, 4K
          aspectRatio: "4:3" // Standard for papers
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};

// --- Image Editing (Nano Banana / gemini-2.5-flash-image) ---

export const editThesisImage = async (base64Image: string, editPrompt: string): Promise<string | null> => {
  const ai = getAiClient();
  // Remove data:image/png;base64, prefix if present for the API call payload
  const cleanBase64 = base64Image.split(',')[1] || base64Image;
  const mimeType = base64Image.split(';')[0].split(':')[1] || 'image/png';

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType
            }
          },
          { text: editPrompt }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error editing image:", error);
    throw error;
  }
};