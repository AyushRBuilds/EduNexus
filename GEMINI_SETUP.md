# Gemini AI Integration for Smart Search

## Overview

EduNexus now integrates Google Gemini 2.0 Flash as the primary AI engine for smart search. When users search, Gemini provides comprehensive answers while automatically showing the uploaded documents that informed the response.

## Features

### 1. **Gemini-Powered Smart Search**
- Processes complex educational queries using Gemini 2.0 Flash model
- Provides detailed, well-structured answers similar to ChatGPT
- Context-aware responses based on uploaded faculty materials

### 2. **Document Source Attribution**
- Automatically identifies which uploaded materials informed the answer
- Displays relevant documents alongside the Gemini response
- Users can download referenced materials directly

### 3. **Fallback Chain**
1. **Primary**: Gemini AI with document context
2. **Secondary**: n8n Workflow (if Gemini fails)
3. **Tertiary**: Backend AI Explain service

## Setup Instructions

### Step 1: Get Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy your API key

### Step 2: Add Environment Variable

Add the following to your `.env.local`:

```bash
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
```

### Step 3: Install Google Generative AI Package

```bash
npm install @google/generative-ai
# or
pnpm add @google/generative-ai
```

### Step 4: Verify Integration

1. Navigate to Smart Search
2. Enter a test query (e.g., "Explain Laplace Transform")
3. Check:
   - AI Explanation appears
   - Source shows "Gemini AI"
   - Related documents are displayed below

## How It Works

### Search Flow

```
User Query
    ↓
[Gemini Service]
    ├─ Fetch relevant materials from Supabase
    ├─ Build document context (top 5 relevant docs)
    ├─ Query Gemini with context
    └─ Return answer + source attribution
    ↓
[Display]
    ├─ Show Gemini answer
    ├─ Display source documents
    └─ Allow downloads
```

### Document Selection

The system automatically:
1. Scores all uploaded materials against the search query
2. Selects top 5 most relevant documents (score > 30)
3. Extracts title and description
4. Passes context to Gemini
5. Tracks which documents influenced the answer

## Code Structure

### New Files

- **`lib/api/gemini.service.ts`**: Gemini API client
  - `queryGemini()`: Simple query without context
  - `queryGeminiWithDocuments()`: Query with document context

### Modified Files

- **`components/edunexus/search-results.tsx`**: 
  - Added Gemini response state management
  - Integrated document source display
  - Updated answer priority chain

- **`components/edunexus/hero-search.tsx`**: 
  - No changes (works with updated search-results)

## API Reference

### queryGemini(query: string, context?: string)

Query Gemini for a simple answer without document context.

```typescript
const response = await queryGemini("What is photosynthesis?")
console.log(response.answer) // Gemini's response
```

### queryGeminiWithDocuments(query: string, documentContext: Array)

Query Gemini with context from uploaded documents.

```typescript
const response = await queryGeminiWithDocuments(
  "Explain quantum computing",
  [
    {
      title: "Quantum Computing Basics.pdf",
      content: "Extracted text from document...",
      source: "file_url_or_external_url"
    }
  ]
)

console.log(response.answer) // Gemini's response
console.log(response.sources) // Attribution URLs
```

## Configuration

### Gemini Model Settings

The integration uses `gemini-2.0-flash` with:
- **Max Tokens**: 1024
- **Temperature**: 0.7 (balanced creativity/accuracy)
- **Safety Settings**: Medium (blocks high-severity harms only)

### Document Context

- **Top N Documents**: 5 most relevant materials
- **Relevance Threshold**: Score > 30
- **Context Length**: First 500 characters per document

## Troubleshooting

### "Gemini API is not configured"

**Solution**: Add `NEXT_PUBLIC_GEMINI_API_KEY` to `.env.local`

### "Error querying Gemini"

**Possible Causes**:
1. Invalid API key
2. API quota exceeded
3. Network connectivity issue
4. API service down

**Solution**: Check [Google Cloud Console](https://console.cloud.google.com/) for quota/errors

### Gemini not showing document sources

**Cause**: No documents matched the search relevance threshold

**Solution**: Upload more materials related to the search topic

### Slow response times

**Cause**: Too many or large documents in context

**Solution**: 
- System automatically limits to 5 documents
- Increase relevance threshold if needed
- Check Gemini API quota usage

## Performance Metrics

- **Typical Response Time**: 2-4 seconds (Gemini API call)
- **Document Scoring**: < 100ms
- **Total Latency**: ~3-5 seconds per search

## Best Practices

1. **Upload Relevant Materials**
   - Ensures better context for Gemini
   - Improves answer accuracy
   - Enables source attribution

2. **Use Descriptive Titles**
   - Better relevance scoring
   - Clearer source attribution
   - Improved user experience

3. **Tag Materials**
   - Helps with query matching
   - Improves context selection
   - Better organization

4. **Monitor API Usage**
   - Check Gemini API dashboard
   - Track quota consumption
   - Plan for scaling

## Security Considerations

- API key stored in client (NEXT_PUBLIC_*) - Consider security implications
- Content passed to Gemini follows safety policies
- No sensitive data should be in document descriptions
- Materials are only from authenticated sources (faculty uploads)

## Future Enhancements

- [ ] Streaming responses for faster display
- [ ] Extended context windows for longer answers
- [ ] Custom model fine-tuning
- [ ] Multi-language support
- [ ] Caching of common queries
- [ ] Analytics dashboard for search insights

## Support

For issues or questions:
1. Check debug logs: `console.log("[v0]")` statements
2. Verify API key configuration
3. Check Gemini API status page
4. Review uploaded materials relevance

## Changelog

### v1.0 (Current)
- Initial Gemini 2.0 Flash integration
- Document context support
- Source attribution display
- Fallback chain implementation
