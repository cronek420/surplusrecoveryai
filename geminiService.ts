
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

/**
 * AIRSCALE INTEGRATION - Property Data & Real Estate Intelligence
 * Provides comprehensive property profiles, ownership history, and valuation
 */
const getAirscaleKey = () => {
  const key = (process.env.AIRSCALE_API_KEY || "").trim();
  if (!key) {
    console.warn("[LEXICON] AIRSCALE_API_KEY not configured. Property intelligence degraded.");
  }
  return key;
};

/**
 * ANYMAILFINDER INTEGRATION - Email Discovery & Verification
 * Locates professional email addresses and verifies deliverability
 */
const getAnymailfinderKey = () => {
  const key = (process.env.ANYMAILFINDER_API_KEY || "").trim();
  if (!key) {
    console.warn("[LEXICON] ANYMAILFINDER_API_KEY not configured. Email discovery degraded.");
  }
  return key;
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

/**
 * ANYMAILFINDER: Discover professional email addresses
 * Inputs: name, company, domain
 * Output: email, deliverability score, confidence level
 */
export const findEmailViaAnymailfinder = async (firstName: string, lastName: string, companyName?: string, domain?: string) => {
  const apiKey = getAnymailfinderKey();
  if (!apiKey) {
    return { success: false, email: null, reason: "ANYMAILFINDER_API_KEY not configured" };
  }

  return callWithRetry(async () => {
    const queryParams = new URLSearchParams();
    queryParams.append('first_name', firstName);
    queryParams.append('last_name', lastName);
    if (companyName) queryParams.append('company_name', companyName);
    if (domain) queryParams.append('domain', domain);

    const response = await fetch(`https://api.anymailfinder.com/v5/findEmail?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'X-API-Key': apiKey,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Anymailfinder API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: data.success,
      email: data.email,
      confidence: data.confidence,
      deliverability: data.deliverability,
      sources: data.sources,
      reason: data.reason
    };
  });
};

/**
 * ANYMAILFINDER: Verify email address validity
 * Used before sending outreach to confirm active email
 */
export const verifyEmailViaAnymailfinder = async (email: string) => {
  const apiKey = getAnymailfinderKey();
  if (!apiKey) {
    return { valid: null, reason: "ANYMAILFINDER_API_KEY not configured" };
  }

  return callWithRetry(async () => {
    const response = await fetch(`https://api.anymailfinder.com/v5/verifyEmail`, {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });

    if (!response.ok) {
      throw new Error(`Anymailfinder verification error: ${response.status}`);
    }

    const data = await response.json();
    return {
      valid: data.valid,
      smtp_status: data.smtp_status,
      confidence: data.confidence,
      reason: data.reason
    };
  });
};

/**
 * AIRSCALE: Property Intelligence & Ownership Data
 * Returns: ownership history, property tax info, market valuation, lien records
 */
export const getPropertyIntelligenceViaAirscale = async (address: string, state: string) => {
  const apiKey = getAirscaleKey();
  if (!apiKey) {
    return { success: false, reason: "AIRSCALE_API_KEY not configured" };
  }

  return callWithRetry(async () => {
    const response = await fetch('https://api.airscale.io/v1/properties/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        address,
        state,
        include_ownership: true,
        include_tax: true,
        include_valuation: true,
        include_liens: true
      })
    });

    if (!response.ok) {
      throw new Error(`Airscale API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      property: data.property,
      ownership: data.ownership,
      tax_info: data.tax_info,
      valuation: data.valuation,
      liens: data.liens,
      market_comparables: data.market_comparables
    };
  });
};

/**
 * AIRSCALE: Owner Contact Information
 * Leverages property data to locate current owner contact details
 */
export const getOwnerContactViaAirscale = async (propertyId: string) => {
  const apiKey = getAirscaleKey();
  if (!apiKey) {
    return { success: false, reason: "AIRSCALE_API_KEY not configured" };
  }

  return callWithRetry(async () => {
    const response = await fetch(`https://api.airscale.io/v1/properties/${propertyId}/owner-contact`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Airscale owner contact error: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      owner_name: data.owner_name,
      owner_emails: data.owner_emails,
      owner_phones: data.owner_phones,
      mailing_address: data.mailing_address,
      confidence_score: data.confidence_score
    };
  });
};

export const generateCorrespondence = async (
  lead: Lead, 
  mode: 'EMAIL' | 'SMS' | 'PHONE' | 'LETTER', 
  context: 'COLD' | 'RESPONSE' | 'FOLLOWUP' | 'CLOSE'
) => {
  return callWithRetry(async () => {
    const ai = getAI();
    
    // LAYER 1: If mode is EMAIL and we don't have a verified email, attempt Anymailfinder discovery
    let emailVerified = false;
    let discoveredEmail = lead.email;
    
    if (mode === 'EMAIL' && !lead.email) {
      const emailSearchResult = await findEmailViaAnymailfinder(
        lead.ownerName.split(' ')[0],
        lead.ownerName.split(' ').slice(1).join(' ')
      );
      if (emailSearchResult.success && emailSearchResult.email) {
        discoveredEmail = emailSearchResult.email;
        console.log(`[LEXICON] Email discovered via Anymailfinder: ${discoveredEmail} (confidence: ${emailSearchResult.confidence})`);
      }
    } else if (mode === 'EMAIL' && lead.email) {
      // Verify existing email
      const verifyResult = await verifyEmailViaAnymailfinder(lead.email);
      emailVerified = verifyResult.valid === true;
      if (!emailVerified) {
        console.warn(`[LEXICON] Email verification failed for ${lead.email}. Attempting to find alternative.`);
        const altSearch = await findEmailViaAnymailfinder(
          lead.ownerName.split(' ')[0],
          lead.ownerName.split(' ').slice(1).join(' ')
        );
        if (altSearch.success && altSearch.email) {
          discoveredEmail = altSearch.email;
        }
      }
    }

    const prompt = `
      ${LEXICON_CONSTITUTION}
      MISSION: Autonomous Outreach Execution for ${lead.ownerName}.
      
      CHANNEL: ${mode}
      SITUATION: ${context}
      SENDER: ${USER_IDENTITY.name}, ${USER_IDENTITY.ceoTitle} of ${USER_IDENTITY.company}.
      EMAIL_VERIFIED: ${emailVerified}
      TARGET_EMAIL: ${discoveredEmail || 'UNKNOWN'}
      
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
    // LAYER 1: Attempt Airscale property intelligence (deterministic data)
    let airscaleData = null;
    const state = address.match(/[A-Z]{2}\s*\d{5}/) ? address.split(',').pop()?.trim() : 'Unknown';
    
    try {
      airscaleData = await getPropertyIntelligenceViaAirscale(address, state);
    } catch (e) {
      console.warn("[LEXICON] Airscale lookup failed, proceeding with Gemini + Google Maps");
    }

    // LAYER 2: Gemini + Google Maps for AI-driven insights
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${LEXICON_CONSTITUTION}\nAnalyze property for Tom: ${address}. Provide neighborhood profile and proximity to local courthouses.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: { retrievalConfig: { latLng: lat && lng ? { latitude: lat, longitude: lng } : undefined } }
      },
    });
    
    return { 
      text: response.text || '', 
      sources: [],
      airscaleData: airscaleData?.success ? airscaleData : null
    };
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

export const optimizeSkipTracingStrategy = async (lead: Lead) => {
  return callWithRetry(async () => {
    // SHADOW-TRACE: Multi-layer skip tracing using Anymailfinder + Airscale + Gemini
    
    const results: any = {
      lead: lead.ownerName,
      timestamp: new Date().toISOString(),
      layers: []
    };

    // LAYER 1: AIRSCALE - Get owner contact from property
    if (lead.propertyAddress && lead.state) {
      try {
        const propertyIntel = await getPropertyIntelligenceViaAirscale(
          lead.propertyAddress,
          lead.state
        );
        if (propertyIntel.success && propertyIntel.property?.id) {
          const ownerContact = await getOwnerContactViaAirscale(propertyIntel.property.id);
          results.layers.push({
            name: 'AIRSCALE_PROPERTY_OWNER',
            success: ownerContact.success,
            data: ownerContact
          });
        }
      } catch (e) {
        console.warn("[LEXICON] Airscale skip-trace layer failed");
      }
    }

    // LAYER 2: ANYMAILFINDER - Email discovery
    if (lead.ownerName) {
      try {
        const nameParts = lead.ownerName.split(' ');
        const emailResult = await findEmailViaAnymailfinder(
          nameParts[0],
          nameParts.slice(1).join(' ')
        );
        results.layers.push({
          name: 'ANYMAILFINDER_EMAIL_DISCOVERY',
          success: emailResult.success,
          data: {
            email: emailResult.email,
            confidence: emailResult.confidence,
            deliverability: emailResult.deliverability,
            sources: emailResult.sources
          }
        });
      } catch (e) {
        console.warn("[LEXICON] Anymailfinder email discovery failed");
      }
    }

    // LAYER 3: GEMINI DEEP-THINKING - Synthesize all intel and generate strategy
    const ai = getAI();
    const synthesisPrompt = `
      ${LEXICON_CONSTITUTION}
      TASK: SHADOW-TRACE synthesis for Tom.
      
      TARGET: ${lead.ownerName}
      AMOUNT: $${lead.amount}
      PROPERTY: ${lead.propertyAddress}
      
      MULTI-LAYER INTEL COLLECTED:
      ${JSON.stringify(results.layers, null, 2)}
      
      COMMAND: Synthesize all signals. Provide:
      1. Highest-confidence contact method
      2. Recommended outreach sequence
      3. Risk factors for this lead
      4. Suggested next action for Tom
      
      Use deep reasoning to connect signals and identify the optimal path forward.
    `;

    const strategicResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: synthesisPrompt,
      config: { 
        thinkingConfig: { thinkingBudget: 32768 },
        temperature: 0.5 
      }
    });

    return {
      ...results,
      strategy: strategicResponse.text,
      agent: 'SHADOW-TRACE'
    };
  });
};

export const generateOutreachPlan = async (lead: Lead) => {
  // Leverage skip-tracing strategy with email verification
  const tracingResult = await optimizeSkipTracingStrategy(lead);
  return tracingResult.strategy;
};

export const generateClosingStrategy = (l: Lead) => generateMasterStrategy(l);
export const generateFilingChecklist = (l: Lead) => generateMasterStrategy(l);
