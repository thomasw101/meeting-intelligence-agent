export const config = {
  api: { responseLimit: false },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { targetName, targetCompany, linkedinUrl, companyUrl, calibration, confirmed } = req.body;

  if (!targetName || !targetCompany) {
    return res.status(400).json({ error: 'Target name and company are required' });
  }

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) return res.status(500).json({ error: 'API key not configured' });

  try {
    const intel = {};
    const sourcesUsed = [];

    // ── 1. LinkedIn — direct fetch if URL provided ──
    if (linkedinUrl && linkedinUrl.startsWith('http')) {
      const liContent = await fetchPage(linkedinUrl);
      if (liContent && liContent.length > 100) {
        intel.linkedin = liContent.slice(0, 4000);
        sourcesUsed.push('LinkedIn profile (direct)');
      }
    } else {
      // No LinkedIn URL — scrape Google for person data
      const personSearches = [
        `"${targetName}" "${targetCompany}" site:linkedin.com`,
        `"${targetName}" "${targetCompany}" role career`,
        `"${targetName}" "${targetCompany}"`,
      ];
      const personResults = await Promise.all(personSearches.map(q => searchGoogle(q)));
      const personIntel = personResults.filter(r => r.length > 30).join('\n\n');
      if (personIntel.length > 50) {
        intel.personSearch = personIntel.slice(0, 3000);
        sourcesUsed.push('Web search (person)');
      }
    }

    // ── 2. Company website — direct fetch if URL provided ──
    if (companyUrl && companyUrl.startsWith('http')) {
      const siteContent = await fetchPage(companyUrl);
      if (siteContent && siteContent.length > 100) {
        intel.website = siteContent.slice(0, 4000);
        sourcesUsed.push('Company website (direct)');
      }
    }

    // ── 3. Always run company/news searches ──
    const companySearches = [
      `"${targetCompany}" news 2024 2025`,
      `"${targetCompany}" funding growth strategy partnerships`,
    ];
    const companyResults = await Promise.all(companySearches.map(q => searchGoogle(q)));
    const companyIntel = companyResults.filter(r => r.length > 30).join('\n\n');
    if (companyIntel.length > 50) {
      intel.companySearch = companyIntel.slice(0, 3000);
      sourcesUsed.push('Web search (company)');
    }

    // ── 4. If no LinkedIn URL and not yet confirmed — run quick ID check ──
    if (!linkedinUrl && !confirmed) {
      const idResult = await identifyPerson(targetName, targetCompany, intel, ANTHROPIC_API_KEY);
      return res.status(200).json({
        needsConfirmation: true,
        identification: idResult,
        intel, // pass back so we don't re-fetch on confirm
      });
    }

    // ── 5. Full report generation ──
    const hasDirectData = !!(intel.linkedin || intel.website);
    const confidenceBase = intel.linkedin ? 80 : hasDirectData ? 65 : 45;

    const battlecard = await generateBattlecard({
      targetName, targetCompany, calibration, intel,
      sourcesUsed, confidenceBase, ANTHROPIC_API_KEY,
    });

    return res.status(200).json({ battlecard, targetName, targetCompany });

  } catch (err) {
    console.error('Research error:', err);
    return res.status(500).json({ error: err.message || 'Research failed' });
  }
}

// ── Quick person identification (pre-confirmation) ──
async function identifyPerson(name, company, intel, apiKey) {
  const rawData = [
    intel.personSearch || '',
    intel.companySearch || '',
  ].join('\n\n').slice(0, 3000);

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{
        role: 'user',
        content: `Based on this web data, identify ${name} at ${company}. 
        
Raw data:
${rawData}

Respond ONLY with a JSON object, no markdown:
{
  "found": true or false,
  "name": "full name",
  "role": "their most likely role/title",
  "company": "${company}",
  "summary": "one sentence about who they are",
  "confidence": "HIGH / MEDIUM / LOW"
}`
      }],
    }),
  });

  const data = await res.json();
  const text = data.content[0].text.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');
  try {
    return JSON.parse(text);
  } catch {
    return { found: false, name, role: 'Unknown', company, summary: 'Could not identify from web data.', confidence: 'LOW' };
  }
}

// ── Full battlecard generation ──
async function generateBattlecard({ targetName, targetCompany, calibration, intel, sourcesUsed, confidenceBase, ANTHROPIC_API_KEY }) {
  const systemPrompt = `You are an elite pre-meeting intelligence analyst. Synthesise raw data into a precise, actionable battlecard filtered through the user's calibration profile. Respond with ONLY a valid JSON object. No markdown, no explanation, no code fences.`;

  const userPrompt = `CALIBRATION PROFILE:
Role: ${calibration?.role || 'Not provided'}
Company: ${calibration?.company || 'Not provided'}
Meeting Type: ${calibration?.meetingType || 'Not provided'}
Context: ${calibration?.context || 'None'}

TARGET: ${targetName} at ${targetCompany}

─── RAW INTELLIGENCE ───
${intel.linkedin ? `LINKEDIN DATA:\n${intel.linkedin}\n\n` : ''}
${intel.personSearch ? `PERSON WEB DATA:\n${intel.personSearch}\n\n` : ''}
${intel.website ? `COMPANY WEBSITE:\n${intel.website}\n\n` : ''}
${intel.companySearch ? `COMPANY NEWS/WEB:\n${intel.companySearch}` : ''}

Return this exact JSON:
{
  "person": {
    "name": "${targetName}",
    "role": "exact role from data or best inference",
    "background": "2-3 sentences: who they are, trajectory, what drives them",
    "personality_signals": ["signal 1", "signal 2", "signal 3"]
  },
  "company": {
    "name": "${targetCompany}",
    "summary": "2-3 sentence overview based on actual data",
    "size_stage": "specific headcount/stage if known",
    "recent_news": ["news item 1", "news item 2", "news item 3"],
    "partnerships": ["partner 1", "partner 2"]
  },
  "pain_points": [
    { "pain": "specific pain grounded in data", "evidence": "specific evidence" },
    { "pain": "specific pain", "evidence": "specific evidence" },
    { "pain": "specific pain", "evidence": "specific evidence" }
  ],
  "talking_points": [
    { "point": "tailored to this person + meeting type", "why": "why it resonates" },
    { "point": "talking point", "why": "why it resonates" },
    { "point": "talking point", "why": "why it resonates" },
    { "point": "talking point", "why": "why it resonates" }
  ],
  "suggested_approach": {
    "opening": "Specific opening for first 60 seconds — reference something real about them",
    "angle": "Strategic angle given their role and your meeting objective",
    "tone": "e.g. peer-to-peer, consultative, challenger",
    "avoid": ["thing to avoid based on their profile", "thing to avoid"]
  },
  "questions_to_ask": [
    "Specific intelligent question?",
    "Question 2?",
    "Question 3?",
    "Question 4?"
  ],
  "risk_flags": [
    { "flag": "specific risk or likely objection", "mitigation": "how to handle it" },
    { "flag": "risk 2", "mitigation": "mitigation 2" }
  ],
  "data_quality": "${intel.linkedin ? 'HIGH — LinkedIn + web data' : intel.website ? 'MEDIUM-HIGH — company website + web data' : 'MEDIUM — web search only'}",
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

  if (!claudeRes.ok) throw new Error(`Claude API error: ${await claudeRes.text()}`);
  const data = await claudeRes.json();
  const text = data.content[0].text.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
  return JSON.parse(text);
}

// ── Fetch any webpage ──
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
    return html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  } catch { return ''; }
}

// ── Google search via DuckDuckGo ──
async function searchGoogle(query) {
  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return '';
    const data = await res.json();
    const parts = [];
    if (data.AbstractText) parts.push(data.AbstractText);
    if (data.Answer) parts.push(data.Answer);
    (data.RelatedTopics || []).slice(0, 8).forEach(t => { if (t.Text) parts.push(t.Text); });
    return parts.join('\n') || '';
  } catch { return ''; }
}