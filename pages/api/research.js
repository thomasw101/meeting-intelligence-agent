export const config = {
  api: { responseLimit: false },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { targetName, targetCompany, linkedinUrl, companyUrl, calibration } = req.body;

  if (!targetName || !targetCompany) {
    return res.status(400).json({ error: 'Target name and company are required' });
  }

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) return res.status(500).json({ error: 'API key not configured' });

  try {
    const intel = {};
    const sourcesUsed = [];

    // ── 1. Fetch LinkedIn profile directly if URL provided ──
    if (linkedinUrl && linkedinUrl.startsWith('http')) {
      console.log('Fetching LinkedIn:', linkedinUrl);
      const liContent = await fetchPage(linkedinUrl);
      if (liContent && liContent.length > 100) {
        intel.linkedin = liContent.slice(0, 4000);
        sourcesUsed.push('LinkedIn profile (direct)');
      }
    }

    // ── 2. Fetch company website directly if URL provided ──
    if (companyUrl && companyUrl.startsWith('http')) {
      console.log('Fetching company site:', companyUrl);
      const siteContent = await fetchPage(companyUrl);
      if (siteContent && siteContent.length > 100) {
        intel.website = siteContent.slice(0, 4000);
        sourcesUsed.push('Company website (direct)');
      }
    }

    // ── 3. Web searches — always run these for news/context ──
    const searches = [
      `"${targetName}" "${targetCompany}"`,
      `"${targetCompany}" news 2025`,
      `"${targetCompany}" funding growth strategy`,
    ];

    // If no LinkedIn URL provided, add person-specific searches
    if (!linkedinUrl) {
      searches.push(`"${targetName}" career background`);
      searches.push(`"${targetName}" interview OR podcast OR speaker`);
    }

    const searchResults = await Promise.all(searches.map(q => searchDDG(q)));
    const combinedSearch = searchResults
      .map((r, i) => `SEARCH: "${searches[i]}"\n${r}`)
      .filter(r => !r.includes('No results'))
      .join('\n\n---\n\n');

    if (combinedSearch.length > 50) {
      intel.webSearch = combinedSearch.slice(0, 5000);
      sourcesUsed.push('Web search');
    }

    // ── 4. Assess data quality ──
    const hasDirectData = intel.linkedin || intel.website;
    const confidenceBase = hasDirectData ? 75 : 35;

    // ── 5. Claude synthesises everything ──
    const systemPrompt = `You are an elite pre-meeting intelligence analyst. You receive raw data scraped from LinkedIn profiles, company websites, and web searches, then synthesise it into a precise, actionable battlecard.

CRITICAL RULES:
- Only state facts you can infer from the data provided. Never fabricate details.
- If data is limited, say so honestly in the relevant fields — but still extract maximum value from what exists.
- Every insight must be filtered through the user's calibration profile — make it feel personal and relevant to THEIR meeting objective.
- Respond with ONLY a valid JSON object. No markdown, no explanation, no code fences.`;

    const userPrompt = `CALIBRATION PROFILE:
Role: ${calibration?.role || 'Not provided'}
Company: ${calibration?.company || 'Not provided'}
Meeting Type: ${calibration?.meetingType || 'Not provided'}
Context: ${calibration?.context || 'None'}

TARGET: ${targetName} at ${targetCompany}
URLs provided: ${linkedinUrl || 'none'} | ${companyUrl || 'none'}

─── RAW INTELLIGENCE ───

${intel.linkedin ? `LINKEDIN PROFILE DATA:\n${intel.linkedin}\n\n` : 'LINKEDIN: No direct data — working from web search only.\n\n'}
${intel.website ? `COMPANY WEBSITE DATA:\n${intel.website}\n\n` : `COMPANY WEBSITE: No direct data provided.\n\n`}
${intel.webSearch ? `WEB SEARCH RESULTS:\n${intel.webSearch}` : ''}

─── INSTRUCTIONS ───

Synthesise the above into this exact JSON structure:

{
  "person": {
    "name": "${targetName}",
    "role": "their exact role/title — from LinkedIn if available, inferred if not",
    "background": "2-3 sentences about who they are, career trajectory, what drives them",
    "personality_signals": ["signal from their content/style", "signal 2", "signal 3"]
  },
  "company": {
    "name": "${targetCompany}",
    "summary": "2-3 sentence company overview based on actual data",
    "size_stage": "headcount / funding stage / maturity — be specific if data supports it",
    "recent_news": ["specific news item 1", "specific news item 2", "specific news item 3"],
    "partnerships": ["partner 1 if found", "partner 2 if found"]
  },
  "pain_points": [
    { "pain": "specific pain point grounded in data", "evidence": "specific evidence from the intel gathered" },
    { "pain": "specific pain point", "evidence": "specific evidence" },
    { "pain": "specific pain point", "evidence": "specific evidence" }
  ],
  "talking_points": [
    { "point": "talking point tailored to THIS person and THIS meeting type", "why": "why it resonates given their specific situation" },
    { "point": "talking point", "why": "why it resonates" },
    { "point": "talking point", "why": "why it resonates" },
    { "point": "talking point", "why": "why it resonates" }
  ],
  "suggested_approach": {
    "opening": "Specific opening line or approach for the first 60 seconds — reference something real about them if possible",
    "angle": "The strategic angle given their role, company stage, and your meeting objective",
    "tone": "e.g. peer-to-peer, consultative, challenger, warm",
    "avoid": ["specific thing to avoid based on their profile", "specific thing to avoid"]
  },
  "questions_to_ask": [
    "Specific, intelligent question based on their actual situation?",
    "Question 2?",
    "Question 3?",
    "Question 4?"
  ],
  "risk_flags": [
    { "flag": "specific risk or likely objection", "mitigation": "how to handle it" },
    { "flag": "risk 2", "mitigation": "mitigation 2" }
  ],
  "data_quality": "${hasDirectData ? 'HIGH — direct URL data used' : 'MEDIUM — web search only, consider providing LinkedIn/company URLs for better results'}",
  "confidence_score": ${confidenceBase},
  "sources_used": ${JSON.stringify(sourcesUsed)}
}`;

    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 4000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!claudeRes.ok) {
      const err = await claudeRes.text();
      throw new Error(`Claude API error: ${err}`);
    }

    const claudeData = await claudeRes.json();
    const rawText = claudeData.content[0].text.trim();
    const cleaned = rawText.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
    const battlecard = JSON.parse(cleaned);

    return res.status(200).json({ battlecard, targetName, targetCompany });

  } catch (err) {
    console.error('Research error:', err);
    return res.status(500).json({ error: err.message || 'Research failed' });
  }
}

// ── Fetch any webpage and return clean text ──
async function fetchPage(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return '';
    const html = await res.text();

    // Strip scripts, styles, nav, footer noise
    const clean = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim();

    return clean;
  } catch (e) {
    console.log('Fetch failed for', url, e.message);
    return '';
  }
}

// ── DuckDuckGo search fallback ──
async function searchDDG(query) {
  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return 'No results';
    const data = await res.json();
    const parts = [];
    if (data.AbstractText) parts.push(data.AbstractText);
    if (data.Answer) parts.push(data.Answer);
    (data.RelatedTopics || []).slice(0, 6).forEach(t => {
      if (t.Text) parts.push(t.Text);
    });
    return parts.join('\n') || 'No results';
  } catch {
    return 'No results';
  }
}