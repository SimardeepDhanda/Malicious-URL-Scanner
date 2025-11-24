import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import rateLimit from "express-rate-limit";
import { validateAndNormalizeUrl, sanitizeForLogging } from "./utils/urlValidator";
import { analyzeUrl } from "./utils/groqClient";
import { ErrorResponse } from "./types";

// Load .env from project root (works in both dev and production)
// Try project root first, then fall back to current directory
const projectRoot = path.resolve(__dirname, "../..");
const envPath = path.join(projectRoot, ".env");
dotenv.config({ path: envPath });
// Also try loading from current directory as fallback
dotenv.config();

// Verify API key is loaded (in development)
if (process.env.NODE_ENV !== "production") {
  const apiKey = process.env.GROQ_API_KEY;
  if (apiKey) {
    console.log(`✓ Groq API key loaded (length: ${apiKey.length}, starts with: ${apiKey.substring(0, 4)}...)`);
  } else {
    console.warn(`⚠️  WARNING: GROQ_API_KEY not found in environment`);
    console.warn(`   Tried loading from: ${envPath}`);
    console.warn(`   Current working directory: ${process.cwd()}`);
  }
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting: 30 requests per hour per IP
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30,
  message: {
    error: {
      code: "RATE_LIMITED",
      message: "Too many requests. Please try again later.",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/scan", limiter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Scan endpoint
app.post("/scan", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || typeof url !== "string") {
      const errorResponse: ErrorResponse = {
        error: {
          code: "INVALID_URL",
          message: "Please provide a valid URL.",
        },
      };
      return res.status(400).json(errorResponse);
    }

    // Validate and normalize URL
    const validation = validateAndNormalizeUrl(url);
    if (!validation.valid || !validation.url) {
      const errorResponse: ErrorResponse = {
        error: {
          code: "INVALID_URL",
          message: validation.error || "Please enter a valid URL.",
        },
      };
      return res.status(400).json(errorResponse);
    }

    const normalizedUrl = validation.url;

    // Log only domain in production
    if (process.env.NODE_ENV === "production") {
      console.log(`Scan request for domain: ${sanitizeForLogging(normalizedUrl)}`);
    } else {
      console.log(`Scan request for URL: ${normalizedUrl}`);
    }

    // Analyze URL with Groq
    try {
      const result = await analyzeUrl(normalizedUrl);
      
      // Log result in production (domain and label only)
      if (process.env.NODE_ENV === "production") {
        console.log(`Scan result: ${sanitizeForLogging(normalizedUrl)} - ${result.final_label}`);
      }

      return res.json(result);
    } catch (groqError: any) {
      console.error("Groq error:", groqError);
      console.error("Error details:", {
        message: groqError.message,
        stack: groqError.stack,
      });

      // Check if it's an API key error
      if (groqError.message?.includes("API key") || groqError.message?.includes("authentication")) {
        const errorResponse: ErrorResponse = {
          error: {
            code: "GROQ_ERROR",
            message: "Invalid or missing Groq API key. Please check your configuration.",
          },
        };
        return res.status(500).json(errorResponse);
      }

      // Check if it's a rate limit error
      if (groqError.message?.includes("rate limit")) {
        const errorResponse: ErrorResponse = {
          error: {
            code: "GROQ_ERROR",
            message: "API rate limit exceeded. Please try again later.",
          },
        };
        return res.status(429).json(errorResponse);
      }

      // Check if it's a parse error
      if (groqError.message?.includes("parse") || groqError.message?.includes("JSON")) {
        const errorResponse: ErrorResponse = {
          error: {
            code: "PARSE_ERROR",
            message: "Unable to analyze URL. Please try again.",
          },
        };
        return res.status(500).json(errorResponse);
      }

      // Generic Groq error with more detail in development
      const errorMessage = process.env.NODE_ENV === "development" 
        ? `Analysis service error: ${groqError.message || "Unknown error"}`
        : "Analysis service temporarily unavailable. Please try again later.";
      
      const errorResponse: ErrorResponse = {
        error: {
          code: "GROQ_ERROR",
          message: errorMessage,
        },
      };
      return res.status(500).json(errorResponse);
    }
  } catch (error: any) {
    console.error("Internal error:", error);
    const errorResponse: ErrorResponse = {
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred. Please try again.",
      },
    };
    return res.status(500).json(errorResponse);
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  if (!process.env.GROQ_API_KEY) {
    console.warn("⚠️  WARNING: GROQ_API_KEY not set in environment variables");
  }
});

