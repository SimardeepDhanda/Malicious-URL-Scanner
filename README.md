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
- **LLM**: Groq API (Llama 3.1 8B Instant)
- **Rate Limiting**: 30 requests per hour per IP
- **Type Safety**: TypeScript throughout

