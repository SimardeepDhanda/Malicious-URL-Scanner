# Malicious URL Scanner

A lightweight security tool that analyzes user-provided URLs and returns a risk classification, confidence score, and a list of indicators of compromise (IOCs). Uses Groq LLM inference to perform heuristic and contextual analysis.

## Features

- ⚡ **Fast Analysis**: Typical scan response time under 3 seconds
- 🎯 **Risk Classification**: Clear labels (Safe, Suspicious, Potential phishing, Potential malware, Unknown)
- 📊 **Confidence Score**: 0-100 confidence rating for each analysis
- 🔍 **Indicators of Compromise**: Detailed list of 3-10 risk indicators with severity levels
- 💡 **Recommendations**: Actionable security recommendations
- 📜 **Scan History**: Local browser storage of last 10 scans
- 📋 **Copy Report**: Export full JSON report and human-readable summary
- 📱 **Mobile Friendly**: Responsive design that works on all devices

## Architecture

### Frontend
- **Framework**: Next.js 14 with React
- **Styling**: Tailwind CSS
- **Storage**: Local browser storage for scan history

### Backend
- **Runtime**: Node.js with Express
- **LLM**: Groq API (Llama 3.1 70B)
- **Rate Limiting**: 30 requests per hour per IP
- **Type Safety**: TypeScript throughout

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Groq API key ([Get one here](https://console.groq.com/))

### Installation

1. **Clone the repository** (or navigate to the project directory)

2. **Install dependencies**:
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Groq API key:
   ```
   GROQ_API_KEY=your_groq_api_key_here
   ```

4. **Start the development servers**:
   ```bash
   npm run dev
   ```
   
   This will start:
   - Backend server on `http://localhost:3001`
   - Frontend server on `http://localhost:3000`

5. **Open your browser**:
   Navigate to `http://localhost:3000`

### Individual Server Commands

- **Backend only**: `npm run dev:backend`
- **Frontend only**: `npm run dev:frontend`

## Usage

1. Enter a URL in the input field (with or without `https://`)
2. Click "Scan" or press Enter
3. View the analysis results including:
   - Risk label and confidence score
   - Summary explanation
   - List of risk indicators
   - Recommended actions
4. Use "Copy Report" to export the full analysis
5. Access recent scans from the history panel

## API Endpoints

### POST /scan

Analyzes a URL and returns risk assessment.

**Request:**
```json
{
  "url": "https://example.com/path?x=1"
}
```

**Response:**
```json
{
  "url": "https://example.com/path?x=1",
  "final_label": "Suspicious",
  "confidence": 82,
  "summary": "The domain resembles a known brand but uses an unusual TLD...",
  "iocs": [
    {
      "indicator_type": "brand_impersonation",
      "description": "Domain appears similar to a legitimate brand name.",
      "severity": "high"
    }
  ],
  "recommendations": [
    "Do not click the link.",
    "Verify the sender independently."
  ],
  "model_metadata": {
    "model": "llama-3.1-70b-versatile",
    "latency_ms": 1200
  },
  "timestamp": "2025-11-24T19:05:00Z"
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "ok"
}
```

## Heuristic Approach

The scanner uses LLM-based heuristic analysis to identify security risks without actually visiting URLs. The analysis considers:

- **Domain Analysis**: TLD patterns, subdomain structure, brand impersonation
- **URL Structure**: Obfuscation, encoding, suspicious parameters
- **Pattern Recognition**: Known attack patterns, redirect chains, tracking markers
- **Contextual Signals**: Homoglyphs, punycode, IP addresses in URLs

The LLM is prompted to analyze these factors and return structured JSON with risk indicators, confidence scores, and recommendations.

## Error Handling

The system handles various error scenarios:

- **INVALID_URL**: Malformed or unsupported URL format
- **RATE_LIMITED**: Exceeded 30 requests per hour limit
- **GROQ_ERROR**: Groq API service unavailable
- **PARSE_ERROR**: Failed to parse LLM response (with automatic retry)
- **INTERNAL_ERROR**: Unexpected server errors

## Security & Privacy

- ✅ **No URL Fetching**: URLs are never visited or crawled
- ✅ **Privacy First**: Only domain names logged in production (not full URLs)
- ✅ **Local Storage**: Scan history stored only in browser
- ✅ **Input Sanitization**: All user input is validated and sanitized
- ✅ **Rate Limiting**: Prevents abuse and API overuse

## Testing

### Test URLs

**Safe URLs:**
- `google.com`
- `mcmaster.ca`
- `github.com`

**Suspicious URLs:**
- `paypaI.com` (homoglyph)
- `login-microsoft-secure-verify.xyz`
- `http://185.234.219.12/login` (IP address)
- `bit.ly/xyz123` (shortener)

## Project Structure

```
Malicious-URL-Scanner/
├── backend/
│   ├── src/
│   │   ├── index.ts          # Express server
│   │   ├── types.ts          # TypeScript types
│   │   └── utils/
│   │       ├── urlValidator.ts
│   │       └── groqClient.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── app/
│   │   ├── components/       # React components
│   │   ├── utils/            # API and storage utilities
│   │   ├── page.tsx          # Main page
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── package.json
│   └── next.config.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Future Enhancements

- VirusTotal or Google Safe Browsing integration
- Browser extension with one-click scan
- User accounts and cloud history
- Batch scanning from CSV upload
- Passive DNS and WHOIS lookup
- Fine-tuned small model for faster analysis

## License

This project is provided as-is for educational and security research purposes.

## Support

For issues or questions, please check the error messages in the UI or backend logs for detailed information.

