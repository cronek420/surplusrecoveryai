
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { AgentRole, Lead, PlaybookEntry } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * NEW: Swarm Orchestration Architect – Multi-Agent Workflow Blueprint
 */
export const generateOrchestrationMap = async (lead?: Lead) => {
  const targetLeadInfo = lead 
    ? `targeting ${lead.ownerName} ($${lead.amount}) in ${lead.county}, ${lead.state}` 
    : "for a global high-performance recovery system";

  const prompt = `Elite Swarm Orchestration Map – Prompt for Swarm Orchestration Architect

Role:
You are the Swarm Orchestration Architect. You must design a complete multi-agent workflow ${targetLeadInfo}. Coordinate Scout-Net, Shadow-Trace, Echo-Sync, Lex-Analyst, and Veri-File.

🎯 Objective:
Create a detailed Swarm Orchestration Map in markdown including:
1. Agent Flow Table: Mapping triggers, inputs, outputs, and next-agent handoffs.
2. Workflow Logic & Branches: Fallback conditions (unreachable leads, court rejections).
3. Shared Lead Data Schema: A JSON structure all agents read/write to.
4. Agent Activation Conditions: Deterministic rules for moving a lead to the next stage.
5. Error Handling & Escalation: Smart retry logic and human-checkpoints.

Output Format:
# Swarm Orchestration Map – Surplus Funds Recovery
## 🔁 Agent Flow Overview
(Markdown Table)
## 🧠 Workflow Logic & Branches
## 🗃 Shared Lead Schema
## 🔄 Agent Activation Conditions
## 🚨 Error Handling & Escalation`;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      thinkingConfig: { thinkingBudget: 32768 }
    }
  });

  return response.text;
};

/**
 * Deep Thinking Mode for Skip Tracing
 */
export const optimizeSkipTracingStrategy = async (pastSuccesses: PlaybookEntry[], targetLead: Lead) => {
  const prompt = `Elite Skip Tracing Strategy – Prompt for Shadow-Trace Agent. 
  Mission: Locate and verify ${targetLead.ownerName} for $${targetLead.amount} recovery in ${targetLead.county}.
  Requirements: Databases, Tactical Steps, Verification sequence.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: { thinkingConfig: { thinkingBudget: 32768 } }
  });
  return response.text;
};

export const scoutSurplusFunds = async (state: string, county: string) => {
  const model = "gemini-3-flash-preview";
  const prompt = `MISSION: High-precision discovery of unclaimed surplus foreclosure funds in ${county}, ${state}. Identify leads over $40k.`;
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: { tools: [{ googleSearch: {} }] },
  });
  return {
    text: response.text,
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => chunk.web) || []
  };
};

export const analyzeLead = async (leadInfo: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Parse this raw surplus fund data into a detailed JSON lead object: ${leadInfo}`,
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
  return JSON.parse(response.text);
};

export const generateOutreachPlan = async (lead: Lead) => {
  const prompt = `Elite Multi-Channel Outreach – Echo-Sync Agent. Target: ${lead.ownerName} ($${lead.amount}). 3-touch sequence plan.`;
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: { thinkingConfig: { thinkingBudget: 24000 } }
  });
  return response.text;
};

export const generateClosingStrategy = async (lead: Lead) => {
  const prompt = `Elite Lex-Analyst Prompt – Legal Recovery & Jurisdictional Logic. 
  Target: ${lead.ownerName} ($${lead.amount}). 
  Roadmap: Vetting, Standing, Document Package, Reassurance Script.`;
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: { thinkingConfig: { thinkingBudget: 32768 } }
  });
  return response.text;
};

export const generateFilingChecklist = async (lead: Lead) => {
  const prompt = `Elite Veri-File Prompt – Verification & Disbursement Watchdog. 
  Target: ${lead.ownerName} ($${lead.amount}). 
  Last Mile: Docket Monitoring, Clerk Protocol, Final Payout, Referral Loop.`;
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: { thinkingConfig: { thinkingBudget: 32768 } }
  });
  return response.text;
};

export const generateMasterStrategy = async (lead: Lead) => {
  const prompt = `Elite Master Recovery Blueprint – Core-AI Orchestrator. Lead: ${lead.ownerName} ($${lead.amount}). Timeline, Risk, Allocation, Outcome.`;
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: { thinkingConfig: { thinkingBudget: 32768 } }
  });
  return response.text;
};

export const generateLienStrategy = async (lead: Lead) => {
  const prompt = `Elite Lien-Strike Strategy – Title-Strike Agent. Subordinate competing claims for ${lead.ownerName}.`;
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: { thinkingConfig: { thinkingBudget: 32768 } }
  });
  return response.text;
};

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
