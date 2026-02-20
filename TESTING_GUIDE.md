# Testing Guide - AI Synthesis Search & Faculty Upload

## Quick Start

### 1. Test Hardcoded AI Synthesis Search

#### Try These Searches:

**Exact Matches:**
- `"Laplace"` → Should return comprehensive Laplace Transform information
- `"Data Structures"` → Should return data structures overview and examples
- `"Transformers"` → Should return ML Transformers information

**Fuzzy Matches:**
- `"Laplace Transform applications"` → Fuzzy matches to "Laplace" entry
- `"Data Structure example"` → Fuzzy matches to "Data Structures" entry
- `"Transformers in AI"` → Fuzzy matches to "Transformers" entry

**Fallback Tests:**
- `"Linear Algebra"` → Not in KB, falls back to n8n workflow
- `"Python Programming"` → Not in KB, falls back to n8n workflow

#### Expected Response:
- Response should show **"Hardcoded KB"** badge for KB topics
- Response shows definition, key points, applications, examples
- Unknown topics show **"n8n Workflow"** badge instead

---

### 2. Test Faculty Upload with Error Handling

#### Open Faculty Mode:
1. Click on the Faculty Mode section in the admin panel
2. Go to "Upload PDF / Document Files" tab

#### Test Cases:

**✅ Successful Upload:**
```
- Subject: "Data Structures & Algorithms"
- Title: "Chapter 5: Sorting Algorithms"
- Description: "Covers merge sort, quick sort"
- Tags: "sorting, algorithms"
- File: Select any PDF file (< 100MB)
- Expected: Green success message with filename
```

**❌ File Too Large (100MB+ test):**
```
- Use a file larger than 100MB (or create one for testing)
- Click Upload
- Expected Error: "File too large (XXX.XX MB). Maximum is 100MB."
```

**❌ Missing Title:**
```
- Subject: "Data Structures"
- Title: [Leave empty]
- File: Select PDF
- Try to submit
- Expected Error: "Please provide a title for the material"
```

**❌ Unsupported File Type:**
```
- Subject: "Data Structures"
- Title: "Some title"
- File: Select .exe, .zip, or other unsupported file
- Click Upload
- Expected Error: "File type not supported. Supported: PDF, MP4, PPT, TXT, PNG, JPG"
```

**❌ Missing Subject:**
```
- Subject: [Leave empty]
- Title: "Some material"
- File: Select PDF
- Try to submit
- Expected Error: "Please select or specify a subject"
```

**❌ Title Too Long:**
```
- Subject: "Data Structures"
- Title: [Paste 300+ character text]
- File: Select PDF
- Try to submit
- Expected Error: "Title is too long (max 255 characters)"
```

---

## Browser Console Debugging

### Check AI Synthesis Logs:
Open Developer Tools (F12) → Console and you'll see:
```
[v0] Starting AI synthesis search for: Laplace
[v0] Found KB matches: ["laplace"]
```

### Check Faculty Upload Logs:
```
[faculty-upload] Request received
[faculty-upload] File validation: notes.pdf (2.5MB)
[faculty-upload] Uploading file to DSA/1708345600000_notes.pdf
[faculty-upload] File uploaded successfully: https://...
[faculty-upload] Inserting record for: Chapter 5 (PDF) under DSA
[faculty-upload] Success! Material ID: 12345
```

---

## API Response Examples

### Success Response (201):
```json
{
  "success": true,
  "material": {
    "id": "abc123",
    "faculty_email": "teacher@edu.com",
    "subject": "Data Structures",
    "type": "PDF",
    "title": "Chapter 5: Sorting",
    "description": "Sorting algorithms overview",
    "file_url": "https://...",
    "tags": ["sorting", "algorithms"],
    "created_at": "2024-02-20T12:00:00Z"
  },
  "message": "Material uploaded successfully!"
}
```

### Error Response (400/500):
```json
{
  "error": "File too large (125MB). Maximum is 100MB.",
  "code": "FILE_TOO_LARGE",
  "details": "Your file is 125.50MB"
}
```

### Error Response (415):
```json
{
  "error": "File type not supported. Allowed: PDF, MP4, PPT, TXT",
  "code": "INVALID_FILE_TYPE",
  "details": "Received file type: application/zip"
}
```

---

## Advanced Testing

### Test Knowledge Base Fuzzy Matching:

1. Edit `/lib/api/ai-synthesis-kb.ts`
2. Add a new topic:
```typescript
"machine learning": {
  title: "Machine Learning",
  definition: "...",
  keyPoints: [...],
  // ...
}
```

3. Test searches:
- `"Machine Learning basics"` → Should fuzzy match
- `"ML algorithms"` → Should fuzzy match (includes "learning")

### Test Multiple Providers:

1. Modify `aiSynthesisSearch()` to try multiple providers in sequence
2. Add logging to see which provider responds

### Simulate Storage Quota Error:

1. Use Supabase dashboard to set storage limits
2. Try uploading files
3. Should see: "Storage quota exceeded. Please contact administrator."

---

## Performance Testing

### Check Search Performance:
```javascript
// In browser console:
console.time("aiSearch");
await aiSynthesisSearch("Laplace Transform");
console.timeEnd("aiSearch");
```

**Expected:** < 100ms for hardcoded KB, < 1000ms for n8n

### Check Upload Performance:
- Small file (1MB): Should complete in 2-5 seconds
- Large file (50MB): Should complete in 10-30 seconds
- Show progress indication for files > 10MB (future enhancement)

---

## Troubleshooting

### Issue: Searches not matching KB
**Solution:** Check browser console for `[v0]` logs, ensure topic names match exactly

### Issue: Upload fails silently
**Solution:** Check network tab in DevTools, look for API response errors

### Issue: Error message shows generic message
**Solution:** Check response body in network tab to see actual error code and details

### Issue: n8n fallback not working
**Solution:** 
1. Check n8n webhook URL in `/lib/api/ai.service.ts`
2. Verify n8n workflow is running
3. Check CORS settings

---

## Success Criteria ✅

### Knowledge Base
- [x] Searches for "Laplace" return hardcoded information
- [x] Searches for "Data Structures" return hardcoded information
- [x] Searches for "Transformers" return hardcoded information
- [x] Unknown topics fall back to n8n
- [x] UI shows source badge (Hardcoded KB vs n8n)

### Faculty Upload
- [x] Valid uploads succeed with success message
- [x] File size > 100MB shows clear error
- [x] Unsupported file types show helpful error with supported list
- [x] Missing fields show field-specific errors
- [x] Network errors handled gracefully
- [x] User understands what went wrong

### User Experience
- [x] Error messages are clear and actionable
- [x] Loading states show what's happening
- [x] Success feedback is immediate
- [x] Forms clear after successful submission
