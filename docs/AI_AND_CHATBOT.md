# MedExplain AI — Dual-Engine AI Assistant & Chatbot

This document details the AI architecture, model discovery mechanism, prompt safety guardrails, and offline clinical reasoning engine.

---

## 1. Dual-Engine Architecture

```
                    ┌───────────────────────────────┐
                    │      Active Patient Data      │
                    │   (Values, Synergy, Trends)   │
                    └───────────────┬───────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │     aiContextBuilder.ts       │
                    └───────────────┬───────────────┘
                                    │
                 ┌──────────────────┴──────────────────┐
                 │                                     │
                 ▼                                     ▼
  ┌──────────────────────────────┐      ┌──────────────────────────────┐
  │ Mode A: Offline Engine       │      │ Mode B: Google Gemini API    │
  │ - 0s latency                 │      │ - Dynamic Model Discovery    │
  │ - Deterministic & safe       │      │ - gemini-2.0-flash / 1.5     │
  │ - No API key or internet req │      │ - Stored in browser only     │
  └──────────────┬───────────────┘      └──────────────┬───────────────┘
                 │                                     │
                 └──────────────────┬──────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │ Compassionate Hebrew Response │
                    └───────────────────────────────┘
```

---

## 2. Dynamic Model Discovery (`geminiService.ts`)

Instead of hardcoding a single Gemini model string that might change or require specific account permissions, `geminiService.ts` implements **Dynamic Model Discovery**:

1. Sends a `GET https://generativelanguage.googleapis.com/v1beta/models?key=...` request to Google API.
2. Filters models supporting `generateContent` (prioritizing `gemini-2.0-flash`, `gemini-1.5-flash-latest`, `gemini-1.5-flash`, `gemini-pro`).
3. Executes a test ping and caches the working model in `localStorage`.
4. Bypasses browser header encoding issues by passing the sanitized ASCII key directly in the REST query parameter.

---

## 3. Medical Safety & Prompt Guardrails

The system instruction (`CLINICAL_SYSTEM_INSTRUCTION`) strictly enforces:
- **Educational Framing**: Explains concepts in accessible language; never delivers definitive medical diagnoses.
- **Doctor Preparation**: Translates complex lab findings into focused, actionable questions for the general practitioner.
- **Emergency Protocols**: Immediately prompts the user to seek emergency medical attention (MADA 101) if red-flag symptoms are described.

