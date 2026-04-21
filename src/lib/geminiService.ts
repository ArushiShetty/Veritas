export interface GeminiAnalysis {
  status: "Real" | "AI" | "Digital Asset";
  analysis_en: string;
  analysis_kn: string;
  analysis_hi: string;
  confidence: number;
}

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`;

const SYSTEM_PROMPT =
  'You are a forensic analyst. Analyze the image and return a JSON object with: { "status": "Real" | "AI" | "Digital Asset", "analysis_en": "...", "analysis_kn": "...", "analysis_hi": "...", "confidence": 0.85 }. Write Kannada and Hindi in a natural, spoken flow. Return only valid JSON with no markdown.';

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Unable to convert file to Base64."));
        return;
      }
      const base64Payload = result.split(",")[1];
      if (!base64Payload) {
        reject(new Error("Invalid Base64 image data."));
        return;
      }
      resolve(base64Payload);
    };
    reader.onerror = () => reject(new Error("Failed to read uploaded image."));
    reader.readAsDataURL(file);
  });
}

function normalizeAnalysis(value: unknown): GeminiAnalysis {
  const fallback: GeminiAnalysis = {
    status: "Digital Asset",
    analysis_en: "The analysis completed but returned an unexpected format.",
    analysis_kn: "ವಿಶ್ಲೇಷಣೆ ಪೂರ್ಣವಾಗಿದೆ, ಆದರೆ ಫಲಿತಾಂಶದ ವಿನ್ಯಾಸ ನಿರೀಕ್ಷಿತವಾಗಿರಲಿಲ್ಲ.",
    analysis_hi: "विश्लेषण पूरा हुआ, लेकिन परिणाम का प्रारूप अपेक्षित नहीं था।",
    confidence: 0.5,
  };

  if (!value || typeof value !== "object") {
    return fallback;
  }

  const obj = value as Record<string, unknown>;
  const status =
    obj.status === "Real" || obj.status === "AI" || obj.status === "Digital Asset"
      ? obj.status
      : fallback.status;
  const confidence =
    typeof obj.confidence === "number" && Number.isFinite(obj.confidence)
      ? Math.min(1, Math.max(0, obj.confidence))
      : fallback.confidence;

  return {
    status,
    analysis_en: typeof obj.analysis_en === "string" ? obj.analysis_en : fallback.analysis_en,
    analysis_kn: typeof obj.analysis_kn === "string" ? obj.analysis_kn : fallback.analysis_kn,
    analysis_hi: typeof obj.analysis_hi === "string" ? obj.analysis_hi : fallback.analysis_hi,
    confidence,
  };
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function analyzeImageWithGemini(
  file: File,
  onRetry503?: () => void
): Promise<GeminiAnalysis> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing VITE_GEMINI_API_KEY. Add it to your environment variables.");
  }

  const base64Image = await fileToBase64(file);
  const requestBody = JSON.stringify({
    contents: [
      {
        parts: [
          { text: SYSTEM_PROMPT },
          {
            inlineData: {
              mimeType: file.type || "image/jpeg",
              data: base64Image,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
    },
  });

  let response = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: requestBody,
  });

  if (response.status === 503) {
    onRetry503?.();
    await wait(2000);
    response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: requestBody,
    });
  }

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Gemini request failed (${response.status}): ${details}`);
  }

  const payload = await response.json();
  const textOutput =
    payload?.candidates?.[0]?.content?.parts?.find((part: any) => typeof part?.text === "string")
      ?.text ?? "";

  if (!textOutput) {
    throw new Error("Gemini returned an empty response.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(textOutput);
  } catch {
    throw new Error("Gemini did not return valid JSON.");
  }

  return normalizeAnalysis(parsed);
}
