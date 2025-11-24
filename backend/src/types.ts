export type RiskLabel = 
  | "Safe"
  | "Suspicious"
  | "Potential phishing"
  | "Potential malware"
  | "Unknown / unclear";

export type IndicatorType =
  | "domain_mismatch"
  | "suspicious_tld"
  | "ip_address_url"
  | "url_obfuscation"
  | "punycode_or_homoglyph"
  | "excessive_subdomains"
  | "suspicious_path_or_params"
  | "tracking_or_redirect_pattern"
  | "missing_https"
  | "brand_impersonation"
  | "shortener_or_masking"
  | "known_attack_keywords"
  | "other";

export type Severity = "low" | "medium" | "high";

export interface IOC {
  indicator_type: IndicatorType;
  description: string;
  severity: Severity;
}

export interface ScanRequest {
  url: string;
}

export interface ScanResponse {
  url: string;
  final_label: RiskLabel;
  confidence: number;
  summary: string;
  iocs: IOC[];
  recommendations: string[];
  model_metadata: {
    model: string;
    latency_ms: number;
  };
  timestamp: string;
}

export interface ErrorResponse {
  error: {
    code: "INVALID_URL" | "RATE_LIMITED" | "GROQ_ERROR" | "PARSE_ERROR" | "INTERNAL_ERROR";
    message: string;
  };
}

