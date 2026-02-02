
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { AgentRole, Lead, UserIdentity } from "./types";

/**
 * LEXICON SOLUTIONS CONSTITUTION (MASTER.md Integration)
 * Unified Identity: Lexicon Solutions
 * Master Controller: Thomas Gronek (Tom)
 */
export const LEXICON_CONSTITUTION = `
ROLE: You are Lexicon Solutions, a unified agentic system.
MASTER CONTROLLER: Thomas Gronek (Tom).
LOYALTY: Exclusive to Tom.
DOCTRINE: Transparency, clarity, and raw truth. No hidden states.
ARCHITECTURE: 
  1. Directive (Markdown SOPs) 
  2. Orchestration (Routing/Decisioning) 
  3. Execution (Deterministic Action)
MISSION: Surplus funds recovery with surgical precision.
TONE: Direct, authoritative, professional, and brutally honest with Tom.
`;

const USER_IDENTITY: UserIdentity = {
  name: "Thomas Gronek",
  phone: "1-707-362-9909",
  role: "Master Controller",
  company: "Lexicon Solutions",
  ceoTitle: "Owner, Founder, and CEO",
  senderEmail: "lexi@thelexiconsolution.com"
};

const getAI = () => {
  const apiKey = (process.env.API_KEY || "").trim();
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    throw new Error("API_KEY undefined. Check .env and restart server.");
  }
  return new GoogleGenAI({ apiKey });
};

async function callWithRetry<T>(fn: () => Promise<T>, retries = 5, delay = 15000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const errorStr = typeof error === 'string' ? error : JSON.stringify(error);
    const isRateLimit = errorStr.includes("429") || errorStr.includes("RESOURCE_EXHAUSTED");
    
    if (isRateLimit && retries > 0) {
      console.warn(`[LEXICON] Resource exhausted. Self-annealing cooldown: ${delay/1000}s. Attempts: ${retries}`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return callWithRetry(fn, retries - 1, delay + 10000);
    }
    throw error;
  }
}

export const generateCorrespondence = async (
  lead: Lead, 
  mode: 'EMAIL' | 'SMS' | 'PHONE' | 'LETTER', 
  context: 'COLD' | 'RESPONSE' | 'FOLLOWUP' | 'CLOSE'
) => {
  return callWithRetry(async () => {
    const ai = getAI();
    const prompt = `
      ${LEXICON_CONSTITUTION}
      MISSION: Autonomous Outreach Execution for ${lead.ownerName}.
      
      CHANNEL: ${mode}
      SITUATION: ${context}
      SENDER: ${USER_IDENTITY.name}, ${USER_IDENTITY.ceoTitle} of ${USER_IDENTITY.company}.
      
      RULES:
      1. TONE: Authoritative but empathetic.
      2. SIGNATURE: Always sign off as ${USER_IDENTITY.name}.
      3. REDACTION: Never disclose internal agent names (Scout-Net, Shadow-Trace).
      4. TRUTH: Only share verified data.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { 
        thinkingConfig: { thinkingBudget: 32768 },
        temperature: 0.7
      }
    });
    
    return response.text || "Lexicon: Outreach generation failed.";
  });
};

export const getTacticalAdvice = async (lead: Lead, question: string) => {
  return callWithRetry(async () => {
    const ai = getAI();
    const prompt = `
      ${LEXICON_CONSTITUTION}
      TASK: War-room briefing for Tom regarding lead: ${lead.ownerName}.
      QUESTION: "${question}"
      
      OPERATIONAL STATE:
      Amount: $${lead.amount}
      Phase: ${lead.status}
      
      RULES FOR ADVISOR:
      1. RAW TRUTH to Tom.
      2. Honest friction: If Tom's idea is suboptimal, explain why respectfully.
      3. Direct, structured, action-oriented.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { 
        thinkingConfig: { thinkingBudget: 32768 },
        temperature: 0.5 
      }
    });
    
    return response.text || "Lexicon: Tactical briefing offline.";
  });
};

export const getPropertyInsights = async (address: string, lat?: number, lng?: number) => {
  return callWithRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${LEXICON_CONSTITUTION}\nAnalyze property for Tom: ${address}. Provide neighborhood profile and proximity to local courthouses.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: { retrievalConfig: { latLng: lat && lng ? { latitude: lat, longitude: lng } : undefined } }
      },
    });
    return { text: response.text || '', sources: [] };
  });
};

export const scoutSurplusFunds = async (state: string, countyOrQuery: string) => {
  return callWithRetry(async () => {
    const ai = getAI();
    const mission = `${LEXICON_CONSTITUTION}\nSEARCH DIRECTIVE: Discovery of unclaimed surplus funds in ${countyOrQuery}, ${state}. Identify high-value targets.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: mission,
      config: { tools: [{ googleSearch: {} }] },
    });
    const text = response.text || '';
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = chunks.filter((c: any) => c.web).map((c: any) => c.web);
    return { text, sources };
  }, 5, 20000);
};

export const generateMasterStrategy = async (lead: Lead) => {
  return callWithRetry(async () => {
    const ai = getAI();
    const res = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `${LEXICON_CONSTITUTION}\nCOMMAND: Full recovery blueprint for Tom regarding ${lead.ownerName} ($${lead.amount}). Diagnose before prescribing. Use deep reasoning.`,
      config: { thinkingConfig: { thinkingBudget: 32768 } }
    });
    return res.text;
  });
};

export const analyzeDocumentImage = async (base64Image: string, mimeType: string) => {
  return callWithRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [{ inlineData: { data: base64Image, mimeType } }, { text: "Lexicon Execution: Extract Case Number, Amount, Address as JSON." }]
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
      contents: `${LEXICON_CONSTITUTION}\nRank recovery lead 0-100: ${lead.ownerName}, $${lead.amount}. Return only the integer score.`,
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
  });
};

export const analyzeLead = async (text: string) => {
  return callWithRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `${LEXICON_CONSTITUTION}\nExtract structured lead data from packet: ${text}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ownerName: { type: Type.STRING },
            amount: { type: Type.NUMBER },
            caseNumber: { type: Type.STRING },
            state: { type: Type.STRING },
            county: { type: Type.STRING }
          },
          required: ["ownerName", "amount"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  });
};

export const generateOrchestrationMap = async (lead?: Lead) => {
  return callWithRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `${LEXICON_CONSTITUTION}\nORCHESTRATION MAP: Swarm strategy for Tom. Focus on deterministic handoffs. Use maximum thinking tokens to map the optimal path. Lead: ${lead?.ownerName || 'Global Fleet'}`,
      config: { thinkingConfig: { thinkingBudget: 32768 } }
    });
    return response.text;
  });
};

export const refineCorrespondence = async (lead: Lead, currentDraft: string, feedback: string) => {
  return callWithRetry(async () => {
    const ai = getAI();
    const prompt = `
      ${LEXICON_CONSTITUTION}
      TASK: Refine current draft based on Tom's feedback.
      CURRENT DRAFT: "${currentDraft}"
      FEEDBACK: "${feedback}"
    `;
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { 
        thinkingConfig: { thinkingBudget: 32768 },
        temperature: 0.4 
      }
    });
    return response.text || currentDraft;
  });
};

export const optimizeSkipTracingStrategy = (p: any, l: Lead) => generateMasterStrategy(l);
export const generateOutreachPlan = (l: Lead) => generateMasterStrategy(l);
export const generateClosingStrategy = (l: Lead) => generateMasterStrategy(l);
export const generateFilingChecklist = (l: Lead) => generateMasterStrategy(l);
