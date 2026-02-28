export const config = {
  api: { responseLimit: false },
};

const LINKEDIN_PROFILE_DATASET = 'gd_l1viktl72bvl7bjuj0';
const LINKEDIN_POSTS_DATASET   = 'gd_lyy3tktm25m4avu1cz'; // LinkedIn posts by profile URL

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const {
    targetName, targetCompany,
    linkedinUrl, companyUrl,
    calibration, confirmed,
    cachedIntel,
  } = req.body;

  if (!targetName || !targetCompany) {
    return res.status(400).json({ error: 'Target name and company are required' });
  }

  const ANTHROPIC_API_KEY  = process.env.ANTHROPIC_API_KEY;
  const BRIGHTDATA_API_KEY = process.env.BRIGHTDATA_API_KEY;

  if (!ANTHROPIC_API_KEY) return res.status(500).json({ error: 'Anthropic API key not configured' });

  try {
    const intel        = cachedIntel ? { ...cachedIntel } : {};
    const sourcesUsed  = [];

    // ── 1. LinkedIn via Bright Data (if URL provided) ──
    if (linkedinUrl && linkedinUrl.startsWith('http') && BRIGHTDATA_API_KEY) {
      console.log('Fetching LinkedIn profile via Bright Data:', linkedinUrl);

      const [profileData, postsData] = await Promise.allSettled([
        brightDataScrape(LINKEDIN_PROFILE_DATASET, linkedinUrl, BRIGHTDATA_API_KEY),
        brightDataScrape(LINKEDIN_POSTS_DATASET,   linkedinUrl, BRIGHTDATA_API_KEY),
      ]);

      if (profileData.status === 'fulfilled' && profileData.value) {
        intel.linkedin = profileData.value;
        sourcesUsed.push('LinkedIn profile (Bright Data)');
      }

      if (postsData.status === 'fulfilled' && postsData.value) {
        intel.linkedinPosts = postsData.value;
        sourcesUsed.push('LinkedIn posts (Bright Data)');
      }
    }

    // ── 2. Person web search (if no LinkedIn URL) ──
    if (!linkedinUrl) {
      const personResults = await Promise.all([
        searchDDG(`"${targetName}" "${targetCompany}" site:linkedin.com`),
        searchDDG(`"${targetName}" "${targetCompany}"`),
        searchDDG(`"${targetName}" "${targetCompany}" role career background`),
      ]);
      const combined = personResults.filter(r => r.length > 30).join('\n\n');
      if (combined.length > 50) {
        intel.personSearch = combined.slice(0, 3000);
        sourcesUsed.push('Web search (person)');
      }
    }

    // ── 3. Company website (if URL provided) ──
    if (companyUrl && companyUrl.startsWith('http')) {
      const siteContent = await fetchPage(companyUrl);
      if (siteContent && siteContent.length > 100) {
        intel.website = siteContent.slice(0, 4000);
        sourcesUsed.push('Company website (direct)');
      }
    }

    // ── 4. Company news searches (always) ──
    const companyResults = await Promise.all([
      searchDDG(`"${targetCompany}" news 2024 2025`),
      searchDDG(`"${targetCompany}" funding growth strategy`),
    ]);
    const companyIntel = companyResults.filter(r => r.length > 30).join('\n\n');
    if (companyIntel.length > 50) {
      intel.companySearch = companyIntel.slice(0, 3000);
      sourcesUsed.push('Web search (company)');
    }

    // ── 5. No LinkedIn + not confirmed → quick ID check ──
    if (!linkedinUrl && !confirmed) {
      const idResult = await identifyPerson(targetName, targetCompany, intel, ANTHROPIC_API_KEY);
      return res.status(200).json({ needsConfirmation: true, identification: idResult, intel });
    }

    // ── 6. Generate full battlecard ──
    const hasLinkedIn   = !!(intel.linkedin);
    const hasWebsite    = !!(intel.website);
    const confidenceBase = hasLinkedIn ? 85 : hasWebsite ? 65 : 45;

    const battlecard = await generateBattlecard({
      targetName, targetCompany, calibration,
      intel, sourcesUsed, confidenceBase, ANTHROPIC_API_KEY,
    });

    return res.status(200).json({ battlecard, targetName, targetCompany });

  } catch (err) {
    console.error('Research error:', err);
    return res.status(500).json({ error: err.message || 'Research failed' });
  }
}

// ── Bright Data synchronous scrape ──
async function brightDataScrape(datasetId, url, apiKey) {
  try {
    const endpoint = `https://api.brightdata.com/datasets/v3/scrape?dataset_id=${datasetId}&format=json`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([{ url }]),
      signal: AbortSignal.timeout(30000), // 30s timeout for sync scrape
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`Bright Data error for ${datasetId}:`, errText);
      return null;
    }

    const data = await res.json();

    // Returns array — grab first record
    if (Array.isArray(data) && data.length > 0) return data[0];
    if (data && typeof data === 'object') return data;
    return null;

  } catch (err) {
    console.error('Bright Data fetch failed:', err.message);
    return null;
  }
}

// ── Quick person identification for confirmation step ──
async function identifyPerson(name, company, intel, apiKey) {
  const rawData = [intel.personSearch || '', intel.companySearch || ''].join('\n\n').slice(0, 3000);

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

Respond ONLY with a valid JSON object, no markdown, no code fences:
{
  "found": true,
  "name": "full name",
  "role": "their most likely current role/title — be specific",
  "company": "${company}",
  "summary": "one sentence about who they are and what they do",
  "confidence": "HIGH or MEDIUM or LOW"
}`,
      }],
    }),
  });

  const data = await res.json();
  const text = data.content[0].text.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');
  try {
    return JSON.parse(text);
  } catch {
    return { found: false, name, role: '', company, summary: 'Could not identify from web data.', confidence: 'LOW' };
  }
}

// ── Full battlecard generation ──
async function generateBattlecard({ targetName, targetCompany, calibration, intel, sourcesUsed, confidenceBase, ANTHROPIC_API_KEY }) {

  // Format LinkedIn profile data cleanly for the prompt
  const linkedinSection = intel.linkedin ? formatLinkedInProfile(intel.linkedin) : null;
  const postsSection    = intel.linkedinPosts ? formatLinkedInPosts(intel.linkedinPosts) : null;

  const systemPrompt = `You are an elite pre-meeting intelligence analyst. You receive structured data from LinkedIn profiles, posts, company websites, and web searches, then synthesise it into a precise, actionable battlecard filtered through the user's meeting objective.

RULES:
- Only state facts grounded in the provided data. Never fabricate.
- If data is thin on a field, extract maximum value from what exists and be honest.
- Every insight must be filtered through the calibration profile — make it feel personal.
- Respond with ONLY a valid JSON object. No markdown, no explanation, no code fences.`;

  const userPrompt = `CALIBRATION PROFILE:
Role: ${calibration?.role || 'Not provided'}
Company: ${calibration?.company || 'Not provided'}
Meeting Type: ${calibration?.meetingType || 'Not provided'}
Context: ${calibration?.context || 'None'}

TARGET: ${targetName} at ${targetCompany}

─── INTELLIGENCE GATHERED ───

${linkedinSection ? `LINKEDIN PROFILE:\n${linkedinSection}\n\n` : ''}
${postsSection ? `LINKEDIN POSTS (recent content they've published):\n${postsSection}\n\n` : ''}
${intel.personSearch ? `PERSON WEB DATA:\n${intel.personSearch}\n\n` : ''}
${intel.website ? `COMPANY WEBSITE:\n${intel.website.slice(0, 2000)}\n\n` : ''}
${intel.companySearch ? `COMPANY NEWS:\n${intel.companySearch}` : ''}

─── OUTPUT FORMAT ───

Return this exact JSON:
{
  "person": {
    "name": "${targetName}",
    "role": "exact current role from LinkedIn or best inference",
    "background": "2-3 sentences: who they are, career arc, what drives them — use LinkedIn data if available",
    "personality_signals": ["signal from posts/content/style", "signal 2", "signal 3"]
  },
  "company": {
    "name": "${targetCompany}",
    "summary": "2-3 sentence company overview",
    "size_stage": "specific headcount/funding stage if known",
    "recent_news": ["news item 1", "news item 2", "news item 3"],
    "partnerships": ["partner 1 if found", "partner 2 if found"]
  },
  "pain_points": [
    { "pain": "specific pain grounded in data", "evidence": "specific evidence from intel" },
    { "pain": "specific pain", "evidence": "specific evidence" },
    { "pain": "specific pain", "evidence": "specific evidence" }
  ],
  "talking_points": [
    { "point": "tailored talking point referencing something real about them", "why": "why it lands given their specific situation" },
    { "point": "talking point", "why": "why it resonates" },
    { "point": "talking point", "why": "why it resonates" },
    { "point": "talking point", "why": "why it resonates" }
  ],
  "suggested_approach": {
    "opening": "Specific opening for first 60 seconds — reference something real (a post they wrote, a company milestone, a shared connection)",
    "angle": "Strategic angle given their role, company stage, and your meeting objective",
    "tone": "e.g. peer-to-peer, consultative, challenger, warm",
    "avoid": ["specific thing to avoid based on their profile", "another thing to avoid"]
  },
  "questions_to_ask": [
    "Intelligent specific question based on their actual situation?",
    "Question 2?",
    "Question 3?",
    "Question 4?"
  ],
  "risk_flags": [
    { "flag": "specific risk or likely objection", "mitigation": "how to handle it" },
    { "flag": "risk 2", "mitigation": "mitigation 2" }
  ],
  "data_quality": "${linkedinSection ? 'HIGH — LinkedIn profile + posts data' : intel.website ? 'MEDIUM-HIGH — company website + web data' : 'MEDIUM — web search only'}",
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
  const data    = await claudeRes.json();
  const rawText = data.content[0].text.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
  return JSON.parse(rawText);
}

// ── Format LinkedIn profile object into readable text for Claude ──
function formatLinkedInProfile(profile) {
  if (!profile) return '';
  const lines = [];
  if (profile.name)            lines.push(`Name: ${profile.name}`);
  if (profile.headline)        lines.push(`Headline: ${profile.headline}`);
  if (profile.current_company) lines.push(`Current Company: ${profile.current_company}`);
  if (profile.city)            lines.push(`Location: ${profile.city}${profile.country_code ? ', ' + profile.country_code : ''}`);
  if (profile.about)           lines.push(`About: ${profile.about}`);
  if (profile.followers)       lines.push(`Followers: ${profile.followers}`);
  if (profile.connections)     lines.push(`Connections: ${profile.connections}`);

  if (profile.experience && Array.isArray(profile.experience)) {
    lines.push('\nExperience:');
    profile.experience.slice(0, 4).forEach(e => {
      lines.push(`  - ${e.title || ''} at ${e.company || ''} (${e.date_range || e.duration || ''})`);
      if (e.description) lines.push(`    ${e.description.slice(0, 200)}`);
    });
  }

  if (profile.education && Array.isArray(profile.education)) {
    lines.push('\nEducation:');
    profile.education.slice(0, 2).forEach(e => {
      lines.push(`  - ${e.degree || ''} ${e.field_of_study || ''} at ${e.school || ''}`);
    });
  }

  if (profile.skills && Array.isArray(profile.skills)) {
    lines.push(`\nSkills: ${profile.skills.slice(0, 10).join(', ')}`);
  }

  if (profile.certifications && Array.isArray(profile.certifications)) {
    lines.push(`\nCertifications: ${profile.certifications.slice(0, 3).map(c => c.name || c).join(', ')}`);
  }

  return lines.join('\n');
}

// ── Format LinkedIn posts into readable summary for Claude ──
function formatLinkedInPosts(posts) {
  if (!posts) return '';
  const postList = Array.isArray(posts) ? posts : (posts.posts || []);
  if (!postList.length) return '';

  return postList.slice(0, 5).map((p, i) => {
    const text    = p.text || p.content || p.post_text || '';
    const date    = p.date || p.posted_at || '';
    const likes   = p.likes || p.reactions || '';
    return `Post ${i + 1}${date ? ` (${date})` : ''}${likes ? ` — ${likes} reactions` : ''}:\n${text.slice(0, 400)}`;
  }).join('\n\n---\n\n');
}

// ── Fetch any webpage ──
async function fetchPage(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
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

// ── DuckDuckGo search ──
async function searchDDG(query) {
  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return '';
    const data = await res.json();
    const parts = [];
    if (data.AbstractText) parts.push(data.AbstractText);
    if (data.Answer)       parts.push(data.Answer);
    (data.RelatedTopics || []).slice(0, 8).forEach(t => { if (t.Text) parts.push(t.Text); });
    return parts.join('\n') || '';
  } catch { return ''; }
}