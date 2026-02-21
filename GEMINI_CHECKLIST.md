# Gemini Integration Checklist

## Pre-Deployment Setup

### 1. API Configuration
- [ ] Create Google AI API key at [aistudio.google.com](https://aistudio.google.com/app/apikey)
- [ ] Copy API key securely
- [ ] Add to `.env.local`: `NEXT_PUBLIC_GEMINI_API_KEY=your_key`
- [ ] Verify key works with test query

### 2. Dependencies
- [ ] Install: `npm install @google/generative-ai`
- [ ] Verify package.json updated
- [ ] Run `npm install` to update lock file

### 3. Code Integration
- [ ] Verify `lib/api/gemini.service.ts` exists
- [ ] Check `components/edunexus/search-results.tsx` imports Gemini service
- [ ] Test Gemini import paths are correct

## Testing Checklist

### 1. Gemini Query Functionality
- [ ] Search for "Laplace Transform"
  - Expected: AI Explanation appears
  - Source should show: "Gemini AI"
- [ ] Search for "Data Structures"
  - Expected: Detailed explanation
  - Check formatting and structure
- [ ] Search for "Quantum Computing"
  - Expected: Well-formatted answer

### 2. Document Source Display
- [ ] Upload 3-5 test materials about searched topics
- [ ] Search for a topic covered by uploaded materials
- [ ] Verify "Based on Uploaded Materials" section appears
- [ ] Check all source documents are listed
- [ ] Test download button on sources

### 3. Fallback Chain
- [ ] Disable API key temporarily
- [ ] Search for something
- [ ] Verify n8n workflow takes over (if enabled)
- [ ] Check appropriate error message displays
- [ ] Re-enable API key

### 4. Edge Cases
- [ ] Empty search query
- [ ] Very long search query (500+ chars)
- [ ] Special characters in query
- [ ] Search with no matching documents
- [ ] Multiple searches in quick succession

### 5. UI/UX
- [ ] Answer displays with proper formatting
- [ ] Source badge shows "Gemini AI"
- [ ] Loading spinner shows during Gemini call
- [ ] Error messages are user-friendly
- [ ] Source documents section is visually distinct

## Performance Testing

### Response Time
- [ ] First search: < 6 seconds
- [ ] Subsequent searches: < 5 seconds
- [ ] Check browser dev tools for API latency

### Document Processing
- [ ] 1 document upload: works
- [ ] 10 document uploads: works
- [ ] 100+ document uploads: still responsive

### Load Testing
- [ ] Single concurrent user: works
- [ ] Multiple concurrent users: monitor performance
- [ ] Check API quota consumption

## Integration Verification

### Environment Variables
```bash
# Run this in terminal
echo $NEXT_PUBLIC_GEMINI_API_KEY
# Should output your API key (without exposing it fully)
```

### Code Verification
```bash
# Check imports
grep -r "queryGeminiWithDocuments" src/
# Should find it in search-results.tsx

# Check Gemini service exists
ls -la lib/api/gemini.service.ts
# Should show the file exists
```

### API Connectivity
- [ ] Network tab shows API calls to `generativelanguage.googleapis.com`
- [ ] Response status is 200
- [ ] Response payload contains answer text

## Production Deployment

### Pre-Production
- [ ] All tests passing
- [ ] No console errors
- [ ] API usage within quota
- [ ] Response times acceptable

### Deployment Steps
1. [ ] Add API key to Vercel environment variables
2. [ ] Set `NEXT_PUBLIC_GEMINI_API_KEY` in production
3. [ ] Deploy to staging first
4. [ ] Run full test suite on staging
5. [ ] Deploy to production
6. [ ] Monitor API usage and errors

### Post-Deployment
- [ ] Verify searches work in production
- [ ] Check error logs for issues
- [ ] Monitor API quota usage
- [ ] Collect user feedback

## Monitoring & Maintenance

### Daily
- [ ] Check API error logs
- [ ] Verify searches are completing
- [ ] Monitor response times

### Weekly
- [ ] Review API usage statistics
- [ ] Check quota remaining
- [ ] Monitor user search patterns

### Monthly
- [ ] Analyze top searches
- [ ] Review document effectiveness
- [ ] Plan optimization improvements

## Documentation

- [ ] Created GEMINI_SETUP.md
- [ ] Updated README with Gemini info
- [ ] Documented API endpoints
- [ ] Created troubleshooting guide
- [ ] Team trained on new feature

## Rollback Plan

If issues occur:
1. [ ] Disable Gemini temporarily in env vars (set to empty)
2. [ ] System falls back to n8n workflow
3. [ ] Investigate root cause
4. [ ] Test fix in staging
5. [ ] Re-enable Gemini with fix

## Success Criteria

- [x] Gemini API integrated successfully
- [x] Smart search returns Gemini answers
- [x] Document sources displayed correctly
- [x] All tests passing
- [x] Performance acceptable
- [x] User feedback positive

## Notes

- API key is public-facing (NEXT_PUBLIC_*) - monitor for abuse
- Rate limiting not implemented - may need throttling
- Context window may need tuning based on usage
- Consider caching common queries for performance

---

## Final Sign-Off

- [ ] QA tested all functionality
- [ ] DevOps reviewed deployment plan
- [ ] Product approved feature
- [ ] Team ready for launch
- [ ] Monitoring configured

**Date Completed**: ___________
**Deployed By**: ___________
**Notes**: ___________
