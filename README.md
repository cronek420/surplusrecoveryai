
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
- `.env` (Create this file and add: `API_KEY=your_gemini_key`)
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
- **Shadow-Trace**: Deep-thinking skip tracing logic.
- **Surv-01**: Geographic and property recon via Google Maps.
- **Live Strategist**: Real-time voice consultation for high-stakes decisions.
