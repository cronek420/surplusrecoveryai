
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { AgentRole, Lead, PlaybookEntry } from "./types";

// Helper to get fresh AI instance
const getAI = () => {
  const apiKey = process.env.API_KEY;
  
  // Specific checks for common local setup issues
  if (!apiKey) {
    throw new Error("API_KEY is undefined. Ensure you have a file named '.env' (not 'env.env' or '.env.txt') and restart your npm dev server.");
  }
  
  if (apiKey === "your_gemini_api_key_here") {
    throw new Error("API_KEY is still the placeholder. Please replace 'your_gemini_api_key_here' in your .env file with a real key from AI Studio.");
  }
  
  return new GoogleGenAI({ apiKey });
};

/**
 * Property Recon: Uses Maps Grounding to find property intelligence
 */
export const getPropertyInsights = async (address: string, lat?: number, lng?: number) => {
  const ai = getAI();
  const prompt = `Analyze this property address: ${address}. Provide: 1. Neighborhood demographic vibe, 2. Proximity to local courthouse, 3. Estimated property value range based on nearby sales. Ground your answer in Google Maps data.`;
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: {
          latLng: lat && lng ? { latitude: lat, longitude: lng } : undefined
        }
      }
    },
  });

  const text = response.text || '';
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const links = chunks
    .filter((chunk: any) => chunk.maps)
    .map((chunk: any) => `\n- [${chunk.maps.title || 'Source'}](${chunk.maps.uri})`)
    .join('');

  return {
    text: text + (links ? '\n\nSources:\n' + links : ''),
    sources: chunks.filter((chunk: any) => chunk.maps).map((chunk: any) => chunk.maps) || []
  };
};

/**
 * OCR & Document Intelligence
 */
export const analyzeDocumentImage = async (base64Image: string, mimeType: string) => {
  const ai = getAI();
  const prompt = "Act as a Court Clerk Specialist. Analyze this document image and extract: 1. Case Number, 2. Exact Surplus Amount, 3. Property Address, 4. Any Lienholders mentioned. Format as clean JSON.";
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType } },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          caseNumber: { type: Type.STRING },
          amount: { type: Type.NUMBER },
          address: { type: Type.STRING },
          liens: { type: Type.ARRAY, items: { type: Type.STRING } },
          confidence: { type: Type.NUMBER }
        },
        required: ["caseNumber", "amount", "address"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

/**
 * Lead prioritizing logic
 */
export const calculatePriorityScore = async (lead: Lead) => {
  const ai = getAI();
  const prompt = `Rank this recovery lead from 0-100 based on 'Ease of Recovery' vs 'Amount'. 
  Lead: ${lead.ownerName}, Amount: $${lead.amount}, Status: ${lead.status}, Location: ${lead.county}, ${lead.state}.
  Return only an integer.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: { score: { type: Type.INTEGER } },
        required: ["score"]
      }
    }
  });
  return JSON.parse(response.text || '{"score":0}').score;
};

/**
 * Swarm orchestration strategy
 */
export const generateOrchestrationMap = async (lead?: Lead) => {
  const ai = getAI();
  const prompt = `Elite Swarm Orchestration Map. Coordinate Scout-Net, Shadow-Trace, Echo-Sync, Lex-Analyst, and Veri-File. Focus on $ value optimization.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      thinkingConfig: { thinkingBudget: 32768 }
    }
  });

  return response.text;
};

/**
 * Advanced skip tracing logic
 */
export const optimizeSkipTracingStrategy = async (pastSuccesses: PlaybookEntry[], targetLead: Lead) => {
  const ai = getAI();
  const prompt = `Elite Skip Tracing Strategy for ${targetLead.ownerName} ($${targetLead.amount}).`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: { thinkingConfig: { thinkingBudget: 32768 } }
  });
  return response.text;
};

/**
 * High-precision surplus discovery with Search Grounding
 */
export const scoutSurplusFunds = async (state: string, county: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `MISSION: High-precision discovery of unclaimed surplus funds in ${county}, ${state}. Provide a few potential leads with estimated amounts.`,
    config: { tools: [{ googleSearch: {} }] },
  });

  const text = response.text || '';
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const links = chunks
    .filter((chunk: any) => chunk.web)
    .map((chunk: any) => `\n- [${chunk.web.title || 'Source'}](${chunk.web.uri})`)
    .join('');

  return {
    text: text + (links ? '\n\nSources:\n' + links : ''),
    sources: chunks.filter((chunk: any) => chunk.web).map((chunk: any) => chunk.web) || []
  };
};

/**
 * Multimodal extraction of lead data
 */
export const analyzeLead = async (leadInfo: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Parse surplus fund data: ${leadInfo}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          ownerName: { type: Type.STRING },
          amount: { type: Type.NUMBER },
          lastKnownAddress: { type: Type.STRING },
          propertyAddress: { type: Type.STRING },
          county: { type: Type.STRING },
          state: { type: Type.STRING },
          courtCounty: { type: Type.STRING }
        },
        required: ["ownerName", "amount"]
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const generateOutreachPlan = async (lead: Lead) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Outreach plan for ${lead.ownerName}.`,
    config: { thinkingConfig: { thinkingBudget: 32768 } }
  });
  return response.text;
};

export const generateClosingStrategy = async (lead: Lead) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Legal strategy for ${lead.ownerName}.`,
    config: { thinkingConfig: { thinkingBudget: 32768 } }
  });
  return response.text;
};

export const generateFilingChecklist = async (lead: Lead) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Filing watchdog checklist for ${lead.ownerName}.`,
    config: { thinkingConfig: { thinkingBudget: 32768 } }
  });
  return response.text;
};

export const generateMasterStrategy = async (lead: Lead) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Master blueprint for ${lead.ownerName}.`,
    config: { thinkingConfig: { thinkingBudget: 32768 } }
  });
  return response.text;
};

export const speakResponse = async (text: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
};
