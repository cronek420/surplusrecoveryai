
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { AgentRole, Lead, PlaybookEntry } from "./types";

// Helper to get fresh AI instance following the required SDK initialization pattern
const getAI = () => {
  const apiKey = (process.env.API_KEY || "").trim();
  
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    const errorMsg = "API_KEY is undefined. Ensure you have a file named '.env' (not 'env.env' or '.env.txt') and restart your npm dev server.";
    console.error("Diagnostic Check:", {
      providedKeyLength: apiKey.length,
      isEnvVarSet: !!process.env.API_KEY,
    });
    throw new Error(errorMsg);
  }
  
  return new GoogleGenAI({ apiKey: process.env.API_KEY as string });
};

/**
 * Property Recon: Uses Maps Grounding to find property intelligence
 * Maps grounding requires Gemini 2.5 series.
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
    .map((chunk: any) => {
      let snippet = "";
      if (chunk.maps.placeAnswerSources?.reviewSnippets) {
        snippet = ` - ${chunk.maps.placeAnswerSources.reviewSnippets.join(', ')}`;
      }
      return `\n- [${chunk.maps.title || 'Source'}](${chunk.maps.uri})${snippet}`;
    })
    .join('');

  return {
    text: text + (links ? '\n\nSources:\n' + links : ''),
    sources: chunks.filter((chunk: any) => chunk.maps).map((chunk: any) => chunk.maps) || []
  };
};

/**
 * OCR & Document Intelligence
 * Uses gemini-3-flash-preview for high speed analysis
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
  const prompt = `Elite Swarm Orchestration Map. Coordinate Scout-Net, Shadow-Trace, Echo-Sync, Lex-Analyst, and Veri-File. Focus on $ value optimization.${lead ? ` Target Lead: ${lead.ownerName}, Amount: $${lead.amount}` : ''}`;

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
  const prompt = `Elite Skip Tracing Strategy for ${targetLead.ownerName} ($${targetLead.amount}). Location: ${targetLead.lastKnownAddress}, ${targetLead.county}, ${targetLead.state}.`;
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
    contents: `MISSION: High-precision discovery of unclaimed surplus funds in ${county}, ${state}. Provide a few potential leads with estimated amounts and case numbers if available.`,
    config: { tools: [{ googleSearch: {} }] },
  });

  const text = response.text || '';
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const sources = chunks
    .filter((chunk: any) => chunk.web)
    .map((chunk: any) => chunk.web);

  return { text, sources };
};

/**
 * Extracting structured lead data from unstructured search results
 */
export const analyzeLead = async (text: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: text,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          ownerName: { type: Type.STRING },
          amount: { type: Type.NUMBER },
          lastKnownAddress: { type: Type.STRING },
          propertyAddress: { type: Type.STRING },
          caseNumber: { type: Type.STRING }
        },
        required: ["ownerName", "amount"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

/**
 * Generate outreach plan
 */
export const generateOutreachPlan = async (lead: Lead) => {
  const ai = getAI();
  const prompt = `Generate an optimized outreach sequence for ${lead.ownerName} regarding a $${lead.amount} recovery. Include email, phone, and mail strategy.`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: { thinkingConfig: { thinkingBudget: 32768 } }
  });
  return response.text;
};

/**
 * Generate closing strategy
 */
export const generateClosingStrategy = async (lead: Lead) => {
  const ai = getAI();
  const prompt = `Legal closing strategy for ${lead.ownerName} surplus recovery. Include required documents and potential hurdles.`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: { thinkingConfig: { thinkingBudget: 32768 } }
  });
  return response.text;
};

/**
 * Generate master strategy
 */
export const generateMasterStrategy = async (lead: Lead) => {
  const ai = getAI();
  const prompt = `Comprehensive recovery blueprint for ${lead.ownerName} ($${lead.amount}). Cover discovery to payout.`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: { thinkingConfig: { thinkingBudget: 32768 } }
  });
  return response.text;
};

/**
 * Generate filing checklist
 */
export const generateFilingChecklist = async (lead: Lead) => {
  const ai = getAI();
  const prompt = `Technical filing checklist for ${lead.ownerName} in ${lead.county}, ${lead.state}.`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: { thinkingConfig: { thinkingBudget: 32768 } }
  });
  return response.text;
};
