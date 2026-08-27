import { AnalysisResult, PatientContext } from '../../types';
import { buildPatientPromptContext, CLINICAL_SYSTEM_INSTRUCTION } from './aiContextBuilder';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

/**
 * Fallback list of models to try if model list discovery is unavailable
 */
export const DEFAULT_FALLBACK_MODELS = [
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-pro-latest',
  'gemini-1.5-pro',
  'gemini-pro',
];

/**
 * Sanitizes API key by removing hidden non-ASCII characters, quotes,
 * LTR/RTL invisible Unicode marks, and whitespace.
 */
export const sanitizeApiKey = (rawKey: string): string => {
  if (!rawKey) return '';
  return rawKey
    .replace(/[\u200B-\u200D\uFEFF\u200E\u200F\u202A-\u202E]/g, '') // remove zero-width & directional marks
    .replace(/[^\x20-\x7E]/g, '') // keep only standard printable ASCII
    .replace(/["'\s]/g, '') // remove quotes and spaces
    .trim();
};

export const getStoredApiKey = (): string => {
  try {
    const raw = localStorage.getItem('medexplain_gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || '';
    return sanitizeApiKey(raw);
  } catch {
    return '';
  }
};

export const setStoredApiKey = (key: string): void => {
  try {
    const clean = sanitizeApiKey(key);
    if (clean) {
      localStorage.setItem('medexplain_gemini_api_key', clean);
    } else {
      localStorage.removeItem('medexplain_gemini_api_key');
      localStorage.removeItem('medexplain_active_gemini_model');
    }
  } catch {
    // Fallback
  }
};

export const getStoredActiveModel = (): string => {
  try {
    return localStorage.getItem('medexplain_active_gemini_model') || 'gemini-1.5-flash';
  } catch {
    return 'gemini-1.5-flash';
  }
};

export const setStoredActiveModel = (model: string): void => {
  try {
    localStorage.setItem('medexplain_active_gemini_model', model);
  } catch {
    // Fallback
  }
};

/**
 * Queries Google API to discover which models are available and active for this specific key
 */
export const fetchAvailableModelsForKey = async (apiKey: string): Promise<string[]> => {
  const cleanKey = sanitizeApiKey(apiKey);
  if (!cleanKey) return [];

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(cleanKey)}`;
  const response = await fetch(endpoint);

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data?.error?.message || response.statusText || 'שגיאת שרת';
    const errorCode = data?.error?.code || response.status;
    throw new Error(`[${errorCode}] ${errorMsg}`);
  }

  const models: string[] = (data?.models || [])
    .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
    .map((m: any) => m.name.replace(/^models\//, ''));

  return models;
};

/**
 * Direct browser REST call to Google Gemini endpoint.
 */
async function callGeminiRest(
  apiKey: string,
  model: string,
  systemInstruction: string,
  contents: Array<{ role: string; parts: Array<{ text: string }> }>,
  temperature = 0.3,
  maxOutputTokens = 1024
): Promise<string> {
  const cleanKey = sanitizeApiKey(apiKey);
  if (!cleanKey) {
    throw new Error('MISSING_API_KEY');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
    cleanKey
  )}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemInstruction }],
      },
      contents,
      generationConfig: {
        temperature,
        maxOutputTokens,
      },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data?.error?.message || response.statusText || 'שגיאת שרת לא ידועה';
    const errorCode = data?.error?.code || response.status;
    throw new Error(`[${errorCode}] ${errorMsg}`);
  }

  const text =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    data?.candidates?.[0]?.text ||
    '';

  return text;
}

/**
 * Quick validation ping that dynamically discovers models and tests connectivity
 */
export const validateGeminiApiKey = async (
  key: string
): Promise<{ valid: boolean; message: string; activeModel?: string }> => {
  const cleanKey = sanitizeApiKey(key);
  if (!cleanKey) {
    return { valid: false, message: 'נא להזין מפתח API תקין (אותיות ומספרים בלבד)' };
  }

  let candidateModels: string[] = [];

  // Step 1: Discover available models from the account
  try {
    const discovered = await fetchAvailableModelsForKey(cleanKey);
    if (discovered.length > 0) {
      // Prioritize flash models, then pro models
      const flashModels = discovered.filter((m) => m.includes('flash'));
      const otherModels = discovered.filter((m) => !m.includes('flash'));
      candidateModels = [...flashModels, ...otherModels];
    }
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    if (
      errMsg.includes('API_KEY_INVALID') ||
      errMsg.includes('400') ||
      errMsg.includes('403') ||
      errMsg.includes('PERMISSION_DENIED')
    ) {
      return { valid: false, message: 'המפתח שגוי או שאין לו הרשאה ל-Gemini API.' };
    }
    if (errMsg.includes('QUOTA_EXCEEDED') || errMsg.includes('429')) {
      return { valid: false, message: 'הגעת למגבלת הקריאות (Quota Exceeded) של המפתח.' };
    }
    candidateModels = DEFAULT_FALLBACK_MODELS;
  }

  if (candidateModels.length === 0) {
    candidateModels = DEFAULT_FALLBACK_MODELS;
  }

  // Step 2: Test ping on candidate models
  let lastError = '';

  for (const model of candidateModels) {
    try {
      const text = await callGeminiRest(
        cleanKey,
        model,
        'Reply with OK',
        [{ role: 'user', parts: [{ text: 'Ping test' }] }],
        0,
        10
      );

      if (text) {
        setStoredActiveModel(model);
        setStoredApiKey(cleanKey);
        return {
          valid: true,
          message: `המפתח תקין ומחובר בהצלחה למודל ${model}!`,
          activeModel: model,
        };
      }
    } catch (err: any) {
      lastError = err?.message || String(err);
      if (lastError.includes('404') || lastError.includes('not found') || lastError.includes('no longer available')) {
        continue;
      }
      if (
        lastError.includes('API_KEY_INVALID') ||
        lastError.includes('400') ||
        lastError.includes('403') ||
        lastError.includes('PERMISSION_DENIED')
      ) {
        return { valid: false, message: 'המפתח שגוי או שאין לו הרשאה ל-Gemini API.' };
      }
      if (lastError.includes('QUOTA_EXCEEDED') || lastError.includes('429')) {
        return { valid: false, message: 'הגעת למגבלת הקריאות (Quota Exceeded) של המפתח.' };
      }
    }
  }

  return { valid: false, message: `שגיאת חיבור: ${lastError.slice(0, 120)}` };
};

export const queryGeminiAssistant = async (
  userMessage: string,
  history: ChatMessage[],
  result?: AnalysisResult | null,
  patient?: PatientContext,
  customApiKey?: string
): Promise<string> => {
  const rawKey = customApiKey || getStoredApiKey();
  const apiKey = sanitizeApiKey(rawKey);

  if (!apiKey) {
    throw new Error('MISSING_API_KEY');
  }

  const patientContext = buildPatientPromptContext(result, patient);

  // Build conversational contents
  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: `[נתוני רקע של תוצאות הבדיקה הנוכחיות]:\n${patientContext}`,
        },
      ],
    },
    ...history.slice(-6).map((msg) => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    })),
    {
      role: 'user',
      parts: [{ text: userMessage }],
    },
  ];

  const preferredModel = getStoredActiveModel();
  const modelsToTry = [
    preferredModel,
    ...DEFAULT_FALLBACK_MODELS.filter((m) => m !== preferredModel),
  ];

  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const responseText = await callGeminiRest(
        apiKey,
        model,
        CLINICAL_SYSTEM_INSTRUCTION,
        contents,
        0.3,
        1500
      );

      if (responseText) {
        setStoredActiveModel(model);
        return responseText;
      }
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || String(err);
      if (
        errMsg.includes('404') ||
        errMsg.includes('not found') ||
        errMsg.includes('no longer available')
      ) {
        continue;
      }
      throw err;
    }
  }

  throw lastError || new Error('No compatible model found');
};
