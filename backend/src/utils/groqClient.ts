import Groq from "groq-sdk";
import { ScanResponse, RiskLabel, IOC, IndicatorType, Severity } from "../types";

// Lazy initialization of Groq client to ensure env vars are loaded
function getGroqClient(): Groq {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }
  return new Groq({
    apiKey: apiKey,
  });
}

// Model configuration - can be overridden via GROQ_MODEL env variable
// Available models: llama-3.1-8b-instant, llama3-70b-8192, mixtral-8x7b-32768
// Note: llama-3.1-70b-versatile has been decommissioned
const MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

function createAnalysisPrompt(url: string): string {
  return `Analyze the URL below. Do not visit it. Use only the URL string and common security heuristics.

Return a JSON object with this exact schema:

{
  "final_label": "Safe | Suspicious | Potential phishing | Potential malware | Unknown / unclear",
  "confidence": number,  // 0-100 integer
  "summary": string,     // 1-3 sentences
  "iocs": [
    {
      "indicator_type": "domain_mismatch | suspicious_tld | ip_address_url | url_obfuscation | punycode_or_homoglyph | excessive_subdomains | suspicious_path_or_params | tracking_or_redirect_pattern | missing_https | brand_impersonation | shortener_or_masking | known_attack_keywords | other",
      "description": string,
      "severity": "low | medium | high"
    }
  ],
  "recommendations": [string],
  "reasoning_notes": string  // short technical reasoning
}

Rules:
- Output must be strict JSON only with double quotes.
- iocs length 3-10.
- recommendations length 2-5.
- confidence must be integer.

URL: ${url}`;
}

function createRetryPrompt(url: string): string {
  return `Your previous response was not valid JSON. Output only valid JSON following the schema exactly for this URL: ${url}`;
}

function parseGroqResponse(text: string): ScanResponse | null {
  try {
    // Try to extract JSON from markdown code blocks if present
    let jsonText = text.trim();
    const jsonMatch = jsonText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    }

    // Remove any leading/trailing non-JSON text
    const firstBrace = jsonText.indexOf('{');
    const lastBrace = jsonText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      jsonText = jsonText.substring(firstBrace, lastBrace + 1);
    }

    const parsed = JSON.parse(jsonText);

    // Validate and transform to our schema
    const response: ScanResponse = {
      url: "", // Will be set by caller
      final_label: validateLabel(parsed.final_label),
      confidence: Math.max(0, Math.min(100, Math.round(Number(parsed.confidence) || 50))),
      summary: String(parsed.summary || ""),
      iocs: Array.isArray(parsed.iocs) 
        ? parsed.iocs
            .slice(0, 10)
            .map((ioc: any) => ({
              indicator_type: validateIndicatorType(ioc.indicator_type),
              description: String(ioc.description || ""),
              severity: validateSeverity(ioc.severity),
            }))
        : [],
      recommendations: Array.isArray(parsed.recommendations)
        ? parsed.recommendations.slice(0, 5).map((r: any) => String(r))
        : [],
      model_metadata: {
        model: MODEL,
        latency_ms: 0, // Will be set by caller
      },
      timestamp: new Date().toISOString(),
    };

    // Ensure IOCs count is 3-10
    if (response.iocs.length < 3) {
      // Add placeholder IOCs if needed
      while (response.iocs.length < 3) {
        response.iocs.push({
          indicator_type: "other",
          description: "Additional analysis pending",
          severity: "low",
        });
      }
    }

    // Ensure recommendations count is 2-5
    if (response.recommendations.length < 2) {
      response.recommendations.push("Exercise caution when accessing this URL.");
      response.recommendations.push("Verify the source through a trusted channel.");
    }

    return response;
  } catch (error) {
    console.error("JSON parse error:", error);
    return null;
  }
}

function validateLabel(label: any): RiskLabel {
  const validLabels: RiskLabel[] = [
    "Safe",
    "Suspicious",
    "Potential phishing",
    "Potential malware",
    "Unknown / unclear",
  ];
  return validLabels.includes(label) ? label : "Unknown / unclear";
}

function validateIndicatorType(type: any): IndicatorType {
  const validTypes: IndicatorType[] = [
    "domain_mismatch",
    "suspicious_tld",
    "ip_address_url",
    "url_obfuscation",
    "punycode_or_homoglyph",
    "excessive_subdomains",
    "suspicious_path_or_params",
    "tracking_or_redirect_pattern",
    "missing_https",
    "brand_impersonation",
    "shortener_or_masking",
    "known_attack_keywords",
    "other",
  ];
  return validTypes.includes(type) ? type : "other";
}

function validateSeverity(severity: any): Severity {
  const validSeverities: Severity[] = ["low", "medium", "high"];
  return validSeverities.includes(severity) ? severity : "medium";
}

export async function analyzeUrl(url: string): Promise<ScanResponse> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  // Debug log in development
  if (process.env.NODE_ENV === "development") {
    console.log("Using Groq model:", MODEL);
    console.log("API key present:", apiKey ? "Yes" : "No");
    console.log("API key length:", apiKey?.length || 0);
  }

  const startTime = Date.now();

  try {
    const groq = getGroqClient();
    
    // First attempt
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a cybersecurity URL risk analyzer. You must return valid JSON only.",
        },
        {
          role: "user",
          content: createAnalysisPrompt(url),
        },
      ],
      model: MODEL,
      temperature: 0.3,
      // Note: Groq may not support response_format, so we handle JSON parsing manually
    });

    const responseText = completion.choices[0]?.message?.content || "";
    let parsed = parseGroqResponse(responseText);

    // Retry once if parsing failed
    if (!parsed) {
      const retryCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a cybersecurity URL risk analyzer. You must return valid JSON only.",
          },
          {
            role: "user",
            content: createRetryPrompt(url),
          },
        ],
        model: MODEL,
        temperature: 0.1,
        // Note: Groq may not support response_format, so we handle JSON parsing manually
      });

      const retryText = retryCompletion.choices[0]?.message?.content || "";
      parsed = parseGroqResponse(retryText);
    }

    if (!parsed) {
      throw new Error("Failed to parse Groq response after retry");
    }

    const latency = Date.now() - startTime;
    parsed.model_metadata.latency_ms = latency;
    parsed.url = url;

    return parsed;
  } catch (error: any) {
    console.error("Groq API error details:", {
      message: error.message,
      status: error.status,
      code: error.code,
      type: error.constructor.name,
    });
    
    if (error.message?.includes("API key") || error.message?.includes("authentication") || error.status === 401) {
      throw new Error("Invalid or missing Groq API key");
    }
    
    if (error.status === 429) {
      throw new Error("Groq API rate limit exceeded. Please try again later.");
    }
    
    // Re-throw with more context
    throw new Error(`Groq API error: ${error.message || "Unknown error"}`);
  }
}

