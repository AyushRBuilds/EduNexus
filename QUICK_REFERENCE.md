# Quick Reference - AI Synthesis & Upload Features

## 🎯 What Changed?

### ✨ New Feature: Hardcoded AI Synthesis Search
- Search for "Laplace", "Data Structures", or "Transformers"
- Get instant comprehensive answers from hardcoded knowledge base
- Shows "Hardcoded KB" badge in UI
- Falls back to n8n for unknown topics

### 🔧 Enhanced Feature: Faculty Upload
- Better error messages that explain what went wrong
- File size validation (100MB max)
- File type validation (PDF, MP4, PPT, TXT, images)
- Clear field-specific validation
- Loading states and success feedback

---

## 📚 Knowledge Base Topics

### Searchable Topics (Hardcoded):
1. **Laplace** / **Laplace Transform**
   - Definition, applications, examples
   - Control systems, circuits, signal processing

2. **Data Structures** / **Data Structure**
   - Arrays, Lists, Trees, Graphs, Hash Tables
   - Complexity analysis, practical examples

3. **Transformers** / **Transformer**
   - Architecture overview, self-attention
   - NLP applications, LLMs (GPT, BERT, Claude)

### How Search Works:
```
Query: "Laplace Transform applications"
  ↓
Check KB (fuzzy match) → MATCH "Laplace"
  ↓
Return formatted response with "Hardcoded KB" badge

---

Query: "Python programming"
  ↓
Check KB → NO MATCH
  ↓
Fall back to n8n workflow → "n8n Workflow" badge
```

---

## 📤 Faculty Upload

### Error Messages You Might See:

| Error | What It Means | Fix |
|-------|--------------|-----|
| "File too large" | File > 100MB | Use smaller file |
| "File type not supported" | Wrong file format | Use PDF, MP4, PPT, TXT, PNG, JPG |
| "Title is required" | Title field empty | Add a title |
| "Title is too long" | Title > 255 chars | Shorten title |
| "Subject is required" | No subject selected | Pick or type subject |
| "Storage issue" | Cloud storage full | Contact admin |
| "Database error" | DB insert failed | File may be saved, contact admin |

### Upload Process:
```
1. Fill Subject
2. Enter Title
3. Add Description (optional)
4. Add Tags (optional)
5. Drag & drop or browse for file
6. Click "Upload File"
   ├─ ✅ Success → File indexed, ready for students
   └─ ❌ Error → See error message above
```

---

## 🔍 Debug Tips

### Check Browser Console (F12):
```javascript
// For AI synthesis searches:
[v0] Starting AI synthesis search for: Laplace
[v0] Found KB matches: ["laplace"]

// For file uploads:
[faculty-upload] Request received
[faculty-upload] File validation: notes.pdf (2.5MB)
[faculty-upload] Uploading file to DSA/...
[faculty-upload] Success! Material ID: 12345
```

### Network Tab (F12 → Network):
- Look for `/api/faculty-upload` request
- Check response body for error details
- Look for error code and message

---

## ⚙️ Configuration Shortcuts

### Change Max File Size:
**File**: `/app/api/faculty-upload/route.ts` (line 5)
```typescript
const MAX_FILE_SIZE = 100 * 1024 * 1024 // Change 100 to your size (in MB)
```

### Add New KB Topic:
**File**: `/lib/api/ai-synthesis-kb.ts`
```typescript
export const AI_SYNTHESIS_KB = {
  "your-topic": {
    title: "Topic Title",
    definition: "What is it?",
    keyPoints: ["Point 1", "Point 2", ...],
    applications: ["App 1", "App 2", ...],
    examples: ["Example 1", "Example 2", ...],
    relatedTopics: ["Related 1", "Related 2", ...]
  }
}
```

### Change Allowed File Types:
**File**: `/app/api/faculty-upload/route.ts` (lines 6-12)
```typescript
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "video/mp4",
  // Add more MIME types here
]
```

---

## 🧪 Quick Tests

### Test KB Search:
1. Go to search bar
2. Type "Laplace" → Should show KB response
3. Type "Python" → Should show n8n response

### Test File Upload:
1. Go to Faculty Mode → Upload PDF
2. Try uploading a 101MB file → Should show size error
3. Try uploading .exe file → Should show file type error
4. Upload valid PDF → Should succeed

### Test Error Messages:
1. Try uploading without title → See "Title is required"
2. Try uploading without subject → See "Subject is required"
3. Try with unsupported file → See list of supported types

---

## 📊 Expected Performance

| Operation | Expected Time |
|-----------|----------------|
| KB search (Laplace, etc.) | ~50-100ms |
| n8n search (unknown topic) | ~500-1000ms |
| Small file upload (< 10MB) | 2-5 seconds |
| Large file upload (50MB) | 15-30 seconds |

---

## 🔗 Related Files

**Core Implementation:**
- `/lib/api/ai-synthesis-kb.ts` - Knowledge base
- `/lib/api/ai.service.ts` - Search logic
- `/app/api/faculty-upload/route.ts` - Upload API

**UI Components:**
- `/components/edunexus/search-results.tsx` - Shows KB responses
- `/components/edunexus/faculty-mode.tsx` - Upload form

**Documentation:**
- `/IMPLEMENTATION_SUMMARY.md` - Full technical details
- `/TESTING_GUIDE.md` - How to test everything
- `/CHANGES.md` - What changed in code

---

## 🚀 Common Tasks

### Add Laplace info to KB:
✅ Already done! Search for "Laplace"

### Add new topic to KB:
1. Edit `/lib/api/ai-synthesis-kb.ts`
2. Add new entry to `AI_SYNTHESIS_KB`
3. Redeploy

### Change upload size limit:
1. Edit `/app/api/faculty-upload/route.ts` line 5
2. Change `100` to desired size
3. Redeploy

### Debug upload failure:
1. Open F12 → Network tab
2. Look for `/api/faculty-upload` request
3. Check Response tab for error details
4. Search for error code in `/TESTING_GUIDE.md`

### Enable new file type for upload:
1. Edit `/app/api/faculty-upload/route.ts` lines 6-12
2. Add MIME type to `ALLOWED_FILE_TYPES`
3. Also update `ACCEPTED_TYPES` in `/components/edunexus/faculty-mode.tsx`
4. Redeploy

---

## 📞 Support

**For specific error codes**: See `/TESTING_GUIDE.md` error section
**For full technical details**: See `/IMPLEMENTATION_SUMMARY.md`
**For what changed**: See `/CHANGES.md`

---

## ✅ Verification Checklist

After deployment, verify:
- [ ] Searching "Laplace" shows KB response
- [ ] Searching "Data Structures" shows KB response  
- [ ] Searching "Transformers" shows KB response
- [ ] Unknown searches fall back to n8n
- [ ] KB responses show "Hardcoded KB" badge
- [ ] Can upload PDF files successfully
- [ ] Large files (> 100MB) show clear error
- [ ] Unsupported files show list of supported types
- [ ] Success message shows after upload
- [ ] Error messages are readable and helpful

**All green?** ✅ Implementation complete!
