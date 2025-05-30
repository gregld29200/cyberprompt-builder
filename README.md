# ⚡️ CYBERPROMPT BUILDER

_“Hack the prompt—own the output.”_  
CyberPrompt Builder is a slick, neon-lit web application that helps you craft **high-performance prompts** for Google Gemini while letting you **Bring Your Own API Key (BYOK)**.  
Think of it as a **cyber-deck for prompt engineering**: analyse your request, choose a protocol (MVP or AGENTIC), tune variables, and spawn a production-ready prompt in seconds.

---

## 🛰  1. What the App Does
1. **Request Analysis** – scans your plain-text idea, auto-detects domain & complexity.  
2. **Protocol Selection** – suggests **MVP** (simple) or **AGENTIC** (complex, self-evaluating).  
3. **Variable Calibration** – set role, mission, constraints, output length.  
4. **Prompt Synthesis** – sends a meta-prompt to Gemini and returns a battle-tested prompt.  
5. **Library** – save, tag, export, or reload any generated prompt locally.

All of this happens in a futuristic UI powered by React + Tailwind with glowing cyan & magenta vibes.

---

## 🚀  2. Key Features
| Feature | Description |
|---------|-------------|
| **🔑 BYOK System** | Input **your own Gemini API key** once, choose where to store it (Session / Local / Not stored). No server-side key handling. |
| **🌐 Dual-Language UI** | English 🇬🇧 & French 🇫🇷 interface and meta-prompts. |
| **⚙️ MVP & AGENTIC Modes** | Minimal prompts or autonomous, self-reviewing prompts. |
| **🧠 Smart Analysis** | Auto domain detection (technical, creative, etc.) + complexity estimation. |
| **💾 Local Library** | Prompts stored in browser – offline friendly. |
| **🎨 Cyber Theme** | Dark mode, neon accents, glitch/pulse animations (toggleable). |

---

## 🛠  3. Setup & Run

### Clone & Serve
```bash
git clone <your-fork> cyber-prompt-builder
cd cyber-prompt-builder
# any static server works – vite, http-server, serve, etc.
npx serve .
```
(or simply open `index.html` in a modern browser.)

> 💡 No backend needed – everything runs client-side.

### First Launch
1. Browser opens on **API Key Console**.  
2. Paste your **Gemini API key** ‑> choose storage ‑> “Initialize System”.  
3. If the key is valid you’re warped to the request screen – start hacking prompts.

---

## 🔑  4. How to Get a Gemini API Key
1. Sign in to Google Cloud & enable **Generative Language API**.  
2. Create an API key in **APIs & Services → Credentials**.  
3. Copy the key (looks like `AI...`).  
4. Paste it into CyberPrompt Builder.

Helpful link: <https://ai.google.dev>

---

## 🛡  5. Security Considerations
| Aspect | What We Do |
|--------|------------|
| **Local-Only** | The app is 100 % static; your key never hits our servers. |
| **Storage Choice** | • **Session** – wiped on tab close.  • **Local** – persists until cleared.  • **None** – keep in memory only. |
| **Validation Call** | A tiny “test prompt” is sent to Gemini once to validate. |
| **Open Source** | Skim the code – no hidden calls, no trackers. |

_Still paranoid?_ Keep storage **None** and refresh when finished.

---

## 🧬  6. Differences vs Original Prompt-Builder
| Original (TeachInspire) | CyberPrompt Builder |
|-------------------------|---------------------|
| Cloudflare Worker backend holds API key | 100 % client-side, BYOK |
| Academic pastel palette | Neon cyber-deck palette |
| Education-centric naming | Tech/cyber neutral naming |
| Only local-storage prompts | Added API-key manager & visual effects |
| Requires deploy to use | Works instantly from any static host |

---

## ⚙️  7. Tech Stack
- **React 18 + TypeScript** – UI logic  
- **Tailwind CSS** – utility-first styling (custom cyber palette)  
- **Lucide-React** – icons  
- **@google/generative-ai (ESM)** – Gemini client (browser)  
- **Vite / static server** – local dev (optional)  

_No build step necessary – modules loaded via `<script type="importmap">`._

---

## 🐛  8. Troubleshooting Guide

| Issue | Fix |
|-------|-----|
| **“API: INVALID”** badge | Check key length, ensure Generative Language API is enabled. |
| Key worked yesterday, fails today | Quota exhausted or key revoked. Create a new one or wait for quota reset. |
| Blank screen / console error | Clear browser cache, reload. If persistent, open dev-tools and file an issue with stack trace. |
| CORS errors | You’re serving with outdated HTTP server header. Use `npx serve` or similar that sets correct MIME-types. |
| Strange animation lag | Disable **Effects Toggle** (top-right). |
| Want to wipe everything | Click **Reset API Key** in footer and clear browser storage. |

---

## 🎉  Contribute / Feedback
PRs & suggestions welcome! Drop issues for bugs or feature requests.  
May your prompts be ever-synthetic and your outputs glitch-free.
