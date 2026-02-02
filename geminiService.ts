import { GoogleGenAI, Type, Modality } from "@google/genai";
import { AgentRole, Lead, PlaybookEntry } from "./types";

// Helper to get fresh AI instance
const getAI = () => {
  const apiKey = (process.env.API_KEY || "").trim();
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    throw new Error("API_KEY undefined. Check .env and restart server.");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Robust Wrapper for API Calls
 * Detects 429 (Rate Limit) and retries after a delay
 */
async function callWithRetry<T>(fn: () => Promise<T>, retries = 3, delay = 5000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const isRateLimit = error.message?.includes("429") || error.message?.includes("RESOURCE_EXHAUSTED");
    if (isRateLimit && retries > 0) {
      console.warn(`Rate limit hit. Retrying in ${delay/1000}s... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return callWithRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export const getPropertyInsights = async (address: string, lat?: number, lng?: number) => {
  return callWithRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze property: ${address}. Provide neighborhood vibe, proximity to courthouse, and value range.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: { retrievalConfig: { latLng: lat && lng ? { latitude: lat, longitude: lng } : undefined } }
      },
    });
    return { text: response.text || '', sources: [] };
  });
};

export const analyzeDocumentImage = async (base64Image: string, mimeType: string) => {
  return callWithRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [{ inlineData: { data: base64Image, mimeType } }, { text: "Extract Case Number, Amount, Address as JSON." }]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            caseNumber: { type: Type.STRING },
            amount: { type: Type.NUMBER },
            address: { type: Type.STRING }
          },
          required: ["caseNumber", "amount", "address"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  });
};

export const calculatePriorityScore = async (lead: Lead) => {
  return callWithRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Rank recovery lead 0-100: ${lead.ownerName}, $${lead.amount}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: { type: Type.OBJECT, properties: { score: { type: Type.INTEGER } } }
      }
    });
    return JSON.parse(response.text || '{"score":0}').score;
  });
};

export const scoutSurplusFunds = async (state: string, county: string) => {
  return callWithRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `MISSION: Find unclaimed surplus funds in ${county}, ${state}. Provide leads with estimated amounts.`,
      config: { tools: [{ googleSearch: {} }] },
    });
    const text = response.text || '';
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = chunks.filter((c: any) => c.web).map((c: any) => c.web);
    return { text, sources };
  });
};

export const analyzeLead = async (text: string) => {
  return callWithRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Extract lead info from: ${text}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ownerName: { type: Type.STRING },
            amount: { type: Type.NUMBER },
            caseNumber: { type: Type.STRING }
          },
          required: ["ownerName", "amount"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  });
};

// ... Orchestration and specialized tasks follow same pattern
export const generateOrchestrationMap = async (lead?: Lead) => {
  return callWithRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Swarm strategy for lead: ${lead?.ownerName || 'Generic'}`,
      config: { thinkingConfig: { thinkingBudget: 24576 } }
    });
    return response.text;
  });
};

export const generateMasterStrategy = async (lead: Lead) => {
  return callWithRetry(async () => {
    const ai = getAI();
    const res = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Full recovery plan for ${lead.ownerName}`,
      config: { thinkingConfig: { thinkingBudget: 24576 } }
    });
    return res.text;
  });
};

export const optimizeSkipTracingStrategy = (p: any, l: Lead) => generateMasterStrategy(l);
export const generateOutreachPlan = (l: Lead) => generateMasterStrategy(l);
export const generateClosingStrategy = (l: Lead) => generateMasterStrategy(l);
export const generateFilingChecklist = (l: Lead) => generateMasterStrategy(l);
