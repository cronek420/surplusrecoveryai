
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { AgentRole, Lead, PlaybookEntry } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Property Recon: Uses Maps Grounding to find property intelligence
 */
export const getPropertyInsights = async (address: string, lat?: number, lng?: number) => {
  const prompt = `Analyze this property address: ${address}. Provide: 1. Neighborhood demographic vibe, 2. Proximity to local courthouse, 3. Estimated property value range based on nearby sales. Ground your answer in Google Maps data.`;
  
  const response = await ai.models.generateContent({
    // Gemini 2.5 series is required for Maps Grounding.
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
  // Extracting URLs from groundingChunks as required by guidelines
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
 * OCR & Document Intelligence: Parses images of dockets or surplus lists
 * Correcting model for multimodal analysis (OCR) from generation model to flash model.
 */
export const analyzeDocumentImage = async (base64Image: string, mimeType: string) => {
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
 * Lead prioritizing logic with schema enforcement.
 */
export const calculatePriorityScore = async (lead: Lead) => {
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
 * Swarm orchestration strategy with deep reasoning.
 */
export const generateOrchestrationMap = async (lead?: Lead) => {
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
 * Advanced skip tracing logic using pro reasoning.
 */
export const optimizeSkipTracingStrategy = async (pastSuccesses: PlaybookEntry[], targetLead: Lead) => {
  const prompt = `Elite Skip Tracing Strategy for ${targetLead.ownerName} ($${targetLead.amount}).`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: { thinkingConfig: { thinkingBudget: 32768 } }
  });
  return response.text;
};

/**
 * High-precision surplus discovery with Search Grounding.
 */
export const scoutSurplusFunds = async (state: string, county: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `MISSION: High-precision discovery of unclaimed surplus funds in ${county}, ${state}.`,
    config: { tools: [{ googleSearch: {} }] },
  });

  const text = response.text || '';
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  // Extract website URLs from groundingChunks as required by guidelines
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
 * Multimodal extraction of lead data from unstructured input.
 */
export const analyzeLead = async (leadInfo: string) => {
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

/**
 * Outreach sequence generation with pro reasoning.
 */
export const generateOutreachPlan = async (lead: Lead) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Outreach plan for ${lead.ownerName}.`,
    config: { thinkingConfig: { thinkingBudget: 32768 } }
  });
  return response.text;
};

/**
 * Legal closing strategy with pro reasoning.
 */
export const generateClosingStrategy = async (lead: Lead) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Legal strategy for ${lead.ownerName}.`,
    config: { thinkingConfig: { thinkingBudget: 32768 } }
  });
  return response.text;
};

/**
 * Watchdog filing checklist with pro reasoning.
 */
export const generateFilingChecklist = async (lead: Lead) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Filing watchdog checklist for ${lead.ownerName}.`,
    config: { thinkingConfig: { thinkingBudget: 32768 } }
  });
  return response.text;
};

/**
 * Master blueprint generation with pro reasoning.
 */
export const generateMasterStrategy = async (lead: Lead) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Master blueprint for ${lead.ownerName}.`,
    config: { thinkingConfig: { thinkingBudget: 32768 } }
  });
  return response.text;
};

/**
 * Voice synthesis for agent communication.
 */
export const speakResponse = async (text: string) => {
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
