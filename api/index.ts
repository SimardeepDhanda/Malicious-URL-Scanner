// Vercel serverless function entry point
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import { validateAndNormalizeUrl, sanitizeForLogging } from "../backend/src/utils/urlValidator";
import { analyzeUrl } from "../backend/src/utils/groqClient";
import { ErrorResponse } from "../backend/src/types";

// Load environment variables
dotenv.config();

const app = express();

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
    console.log(`Scan request for domain: ${sanitizeForLogging(normalizedUrl)}`);

    // Analyze URL with Groq
    try {
      const result = await analyzeUrl(normalizedUrl);
      
      // Log result (domain and label only)
      console.log(`Scan result: ${sanitizeForLogging(normalizedUrl)} - ${result.final_label}`);

      return res.json(result);
    } catch (groqError: any) {
      console.error("Groq error:", groqError);

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

      // Generic Groq error
      const errorMessage = "Analysis service temporarily unavailable. Please try again later.";
      
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

// Export for Vercel serverless
export default app;

