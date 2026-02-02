
# 🚀 SR-AI | Surplus Recovery Swarm - Local Setup

This "Workhorse" application is built to run entirely in the browser using the Gemini API.

## 🛠️ How to Run Locally

1.  **Clone the directory** to your local machine.
2.  **Serve the files** using any local web server. Since it uses ESM modules, you need a server (not just opening `index.html`).
    ```bash
    # Option A: If you have Node.js
    npx serve .

    # Option B: If you have Python
    python -m http.server 8000
    ```
3.  **Open in Browser**: Visit `http://localhost:3000` (or `8000`).
4.  **API Key**: The application expects `process.env.API_KEY` to be available. In a local environment, you may need to hardcode it in `index.html` within the `importmap` area or use a proxy. However, in this specific preview environment, it is automatically injected.

## 📁 Key Features
- **Scout-Net**: Automatic web scanning for surplus lists.
- **Tactical Map**: Geographic visualization of recovery bounities.
- **Dossier System**: High-fidelity OCR and agentic intelligence sessions.
- **Voice Strategist**: Real-time native audio conversation via Gemini Live.

## ⚖️ Disclaimer
This tool is for educational purposes. Always ensure compliance with local jurisdictional laws regarding surplus recovery and solicitation.
