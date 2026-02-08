
# 🛰️ SR-AI | Surplus Recovery Swarm - Local Installation

This "Workhorse" build is designed for high-speed local execution. Follow these steps to deploy the agentic swarm on your machine.

## 🛠️ Step-by-Step Launch

### 1. Create your Project Folder
Create a folder anywhere on your computer, e.g., `Documents/recovery-swarm`.

### 2. Save the Code
Create the following files in that folder and paste the corresponding code from our session:
- `package.json`
- `vite.config.ts`
- `types.ts`
- `geminiService.ts`
- `App.tsx`
- `index.tsx`
- `index.html`
- `metadata.json`
- `.env` (Create this file with API keys - see .env.example)
- `.env.example` (Reference file showing required API keys)
- Create a `components` folder and add:
  - `AgentCard.tsx`
  - `LeadTable.tsx`
  - `Terminal.tsx`
  - `ChatBot.tsx`
  - `IntelligenceHub.tsx`
  - `LeadDossier.tsx`
  - `LiveAudioController.tsx`
  - `TacticalMap.tsx`

### 3. Initialize via Command Line
Open your terminal/command prompt:
```bash
# Navigate to the folder
cd path/to/your/recovery-swarm

# Install the engine components
npm install

# Ignite the swarm
npm run dev
```

### 4. Access the Command Deck
The terminal will provide a link (usually `http://localhost:3000`). Open it in your browser to begin recovery operations.

## ⚡ Intelligence Overview
- **Scout-Net**: Real-time public record discovery.
- **Shadow-Trace**: Deep-thinking skip tracing logic with **Anymailfinder** & **Airscale** integration.
- **Surv-01**: Geographic and property recon via Google Maps and **Airscale** property data.
- **Echo-Sync**: Multi-channel outreach with **Anymailfinder** email verification.
- **Live Strategist**: Real-time voice consultation for high-stakes decisions.

## 🔑 API Configuration

Copy `.env.example` to `.env` and fill in your API keys:

```env
# Required
API_KEY=your_gemini_api_key

# Recommended (for enhanced skip-tracing and outreach)
ANYMAILFINDER_API_KEY=your_anymailfinder_key
AIRSCALE_API_KEY=your_airscale_key
```

**Get API Keys:**
- **Gemini**: https://cloud.google.com/docs/authentication/api-keys
- **Anymailfinder**: https://www.anymailfinder.com/api
- **Airscale**: https://api.airscale.io
