# Gemini AI Integration Implementation Guide

## Overview
Gemini 2.0 Flash has been successfully integrated into EduNexus Smart Search to provide AI-powered answers with automatic document source attribution.

## What Was Implemented

### 1. Gemini Service (`lib/api/gemini.service.ts`)
- **Query Interface**: `queryGemini()` for general questions
- **Document Context**: `queryGeminiWithDocuments()` for search with material context
- **Response Type**: Includes answer text and source document references
- **Safety Settings**: Configured to block only high-risk harmful content
- **Model**: Gemini 2.0 Flash for fast, efficient responses

### 2. Search Results Enhancement (`components/edunexus/search-results.tsx`)
- **Gemini as Primary Source**: Queries Gemini first with document context
- **Fallback Chain**: n8n → Backend AI if Gemini fails
- **Document Sources Display**: Shows which uploaded materials influenced the answer
- **Automatic Source Attribution**: Links answers back to faculty-uploaded documents

### 3. Query Flow
```
User enters search query
    ↓
Smart Search finds relevant faculty materials
    ↓
Builds document context from top 5 matches
    ↓
Sends to Gemini with documents
    ↓
Gemini generates answer based on materials
    ↓
Display answer + linked source documents
    ↓
If fails, fallback to n8n workflow
```

## Key Features

### Answer Generation
- Comprehensive, well-structured answers
- Based on uploaded course materials
- Technical accuracy maintained
- Clear examples and explanations

### Source Attribution
- Automatically identifies documents mentioned in answer
- Shows material title, faculty name, subject
- Direct download link to each source document
- Visual indicator showing "Based on Uploaded Materials"

### Error Handling
- Graceful fallback if Gemini API fails
- Clear error messages if API key missing
- Automatic retry with n8n workflow
- Console logging for debugging

## Environment Configuration

### Required Variable
```
NEXT_PUBLIC_GEMINI_API_KEY
```

### How to Get Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com)
2. Click "Get API Key"
3. Create a new API key for your project
4. Copy and paste in v0 Vars section

## Testing the Implementation

### Test Case 1: Basic Search with Documents
1. Upload a PDF about "Machine Learning"
2. Search for "What is machine learning?"
3. Expected: Answer from Gemini referencing the uploaded PDF
4. Check: Document appears under "Based on Uploaded Materials"

### Test Case 2: Multiple Document Sources
1. Upload 3 related documents (e.g., ML basics, neural networks, deep learning)
2. Search for a comprehensive question
3. Expected: Answer synthesizing information from all documents
4. Check: All relevant documents listed as sources

### Test Case 3: Fallback Behavior
1. Temporarily remove GEMINI_API_KEY
2. Perform a search
3. Expected: System falls back to n8n workflow
4. Check: Answer still provided, source shows "n8n Workflow"

## Performance Metrics

| Metric | Value |
|--------|-------|
| Gemini Response Time | 500-2000ms |
| Context Size | ~2500 characters per document |
| Max Documents | 5 materials per query |
| Model | gemini-2.0-flash |
| Temperature | 0.7 (balanced) |
| Max Output Tokens | 1024 |

## Debugging

### Enable Debug Logs
Check browser console for:
```javascript
[v0] Querying Gemini with: { query, hasContext, docCount }
[v0] Gemini response with docs received, sources: [...]
```

### Common Issues

**Issue**: "Gemini API is not configured"
- **Solution**: Add NEXT_PUBLIC_GEMINI_API_KEY to environment variables

**Issue**: Answers don't reference documents
- **Solution**: Check that materials have descriptions; Gemini needs content to reference

**Issue**: Fallback always triggers
- **Solution**: Verify API key is correct; check browser console for errors

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│         User Smart Search Query                         │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│    Search Materials & Score Relevance (top 5)           │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Build Document Context with Title & Description       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │  Query Gemini API      │
        │  (gemini-2.0-flash)    │
        └────────────┬───────────┘
                     │
          ┌──────────┴──────────┐
          │                     │
          ▼ Success             ▼ Failure
    ┌──────────────┐      ┌──────────────┐
    │ Return Answer│      │ Query n8n    │
    │ + Sources    │      │ Workflow     │
    └──────────────┘      └──────────────┘
          │                     │
          │          ┌──────────┘
          │          │
          ▼          ▼
    ┌─────────────────────────┐
    │ Display in Search View   │
    │ - Answer Text           │
    │ - Source Documents      │
    │ - Download Links        │
    └─────────────────────────┘
```

## Configuration Details

### Gemini API Settings
```javascript
{
  model: 'gemini-2.0-flash',        // Fast inference
  maxOutputTokens: 1024,             // Concise answers
  temperature: 0.7,                  // Balanced creativity
  safetySettings: [                  // Content safety
    HARASSMENT: BLOCK_ONLY_HIGH,
    HATE_SPEECH: BLOCK_ONLY_HIGH
  ]
}
```

### Document Scoring
- Matching keywords: 50-100 points
- Subject relevance: 30-50 points  
- Recent materials: 10-20 bonus points
- Top 5 materials selected for context

## Integration with Existing Features

### Supabase Integration
- Materials fetched from `faculty_materials` table
- Supports PDF, Video, PPT, Notes types
- File URLs retrieved from storage

### Faculty Upload
- Documents uploaded via Faculty Studio
- Automatically indexed for search
- Available as context for Gemini queries

### Student Demo
- Demo account has access to test materials
- Can search and receive Gemini-powered answers
- Perfect for showcasing smart search

## Next Steps (Optional Enhancements)

1. **Streaming Responses**: Show answer as it's generated
2. **Custom Prompts**: Let faculty customize answer format
3. **Citation Tracking**: Count how often each document is used
4. **Multi-Language**: Support queries in multiple languages
5. **RAG Optimization**: Improve document relevance scoring

## Support & Troubleshooting

### Quick Fixes
- Refresh page if no answer appears
- Check API key is valid
- Verify materials have descriptions
- Check browser console for errors

### Common Errors
- **429 Too Many Requests**: Rate limit hit, wait a moment
- **403 Forbidden**: Invalid API key
- **500 Internal Error**: Gemini service temporary issue

### Getting Help
1. Check GEMINI_SETUP.md for configuration
2. Review GEMINI_CHECKLIST.md for verification steps
3. Enable debug logs in browser console
4. Check Vercel deployment logs
