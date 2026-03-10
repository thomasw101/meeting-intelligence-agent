export const config = {
  api: { responseLimit: false },
};

const TONE_GUIDE = {
  professional: 'Expert, authoritative, polished. No slang.',
  conversational: 'Warm, relatable, like talking to a smart friend.',
  bold: 'Direct, confident, slightly provocative. Strong opinions.',
  educational: 'Clear, structured, informative. Teach and explain.',
  witty: 'Clever, light humour, engaging. Smart but not try-hard.',
};

const LENGTH_GUIDE = {
  short: 'Keep it concise and punchy. Minimum viable content.',
  medium: 'Standard length for the platform and format.',
  long: 'Go deep. Use the full character allowance where appropriate.',
};

const FORMAT_INSTRUCTIONS = {
  linkedin: {
    'Post': 'Professional but personal. Start with a hook (no "I" as first word). Short paragraphs (1-3 lines). Add 3-5 hashtags at the end. End with a question or CTA.',
    'Article Intro': 'Write a compelling LinkedIn article introduction. Hook in first sentence. Set up the problem/topic. Preview what the reader will learn. End with a transition into the article body.',
    'Carousel Script': 'Write a LinkedIn carousel script. Format as slides: "Slide 1: [headline]\\n[body]\\n\\nSlide 2: [headline]\\n[body]" etc. 6-10 slides. First slide = hook. Last slide = CTA. Each slide should be punchy and self-contained.',
  },
  twitter: {
    'Single Post': 'One tweet, max 280 characters. Must be punchy, shareable, and standalone. Include 1-2 hashtags max.',
    'Thread': 'Write a thread of 5-8 tweets. Format as:\\n1/ [hook tweet]\\n\\n2/ [point]\\n\\n3/ [point]\\netc.\\nEach tweet max 280 chars. First tweet = strong hook. Last tweet = summary + follow CTA.',
  },
  instagram: {
    'Caption': 'Hook in first line (shows before "more"). Storytelling tone. Line breaks for readability. 5-10 hashtags at end separated by a line break. End with engagement question.',
    'Carousel Script': 'Write an Instagram carousel script. Format as slides: "Slide 1: [text]\\n\\nSlide 2: [text]" etc. 5-10 slides. Visual, punchy copy per slide. First slide = hook. Last slide = CTA or question.',
  },
  email: {
    'Newsletter': 'Write a newsletter section. Include Subject line (prefixed "Subject: "), Preview text (prefixed "Preview: "), then the body. Conversational, valuable. One clear CTA.',
    'Cold Outreach': 'Write a cold outreach email. Subject line first (prefixed "Subject: "). Short, personalised, direct. Problem-aware opener. Value prop in 1-2 sentences. Single CTA. No fluff.',
    'Follow-up': 'Write a follow-up email. Subject line first (prefixed "Subject: "). Reference a prior interaction. Brief value reminder. Low-pressure CTA. Warm and human.',
  },
  youtube: {
    'Description': 'SEO-optimised YouTube description. First 2-3 sentences are crucial (shown before fold). Cover what the video is about. Add a TIMESTAMPS section (with placeholder times). Add a RESOURCES section. Subscribe CTA. Relevant tags at bottom.',
    'Video Script': 'Write a video script/outline. Format as: [INTRO - hook], [SECTION 1 - topic], [SECTION 2 - topic], etc., [OUTRO - CTA]. Include speaking notes and on-screen text suggestions in brackets. Conversational tone.',
  },
  tiktok: {
    'Caption': 'Short, punchy TikTok caption. Hook in first line. Maximum 150 characters ideally. 3-5 trending hashtags. No long paragraphs.',
    'Video Script': 'Write a TikTok video script. Format: [HOOK - first 3 seconds], [BEAT 1], [BEAT 2], [BEAT 3], [CTA - last 5 seconds]. Use "[cut]" for scene changes. Include on-screen text in brackets. Fast-paced.',
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { content, url, platformConfigs, context } = req.body;

  if (!content && !url) return res.status(400).json({ error: 'No content or URL provided' });
  if (!platformConfigs || platformConfigs.length === 0) return res.status(400).json({ error: 'No platforms selected' });

  // Fetch URL if provided
  let sourceContent = content;
  let sourceTitle = '';
  let sourceDomain = '';

  if (url && !content) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LearnLab/1.0)' },
        signal: AbortSignal.timeout(8000),
      });
      const html = await response.text();
      sourceContent = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 6000);

      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch) sourceTitle = titleMatch[1].trim();
      try { sourceDomain = new URL(url).hostname.replace('www.', ''); } catch (_) {}
    } catch (err) {
      return res.status(400).json({ error: 'Could not fetch URL. Try pasting the content directly.' });
    }
  }

  // Build targeted platform instructions
  const platformInstructions = platformConfigs.map(p => {
    const formatInstr = FORMAT_INSTRUCTIONS[p.id]?.[p.format] || 'Repurpose this content appropriately for the platform.';
    const toneInstr = TONE_GUIDE[p.tone] || TONE_GUIDE.professional;
    const lengthInstr = LENGTH_GUIDE[p.length] || LENGTH_GUIDE.medium;
    return `### ${p.label} — ${p.format} (key: "${p.id}", char limit: ${p.limit})
Tone: ${toneInstr}
Length: ${lengthInstr}
Instructions: ${formatInstr}`;
  }).join('\n\n');

  const prompt = `You are an expert content strategist and copywriter. Repurpose the following content for multiple platforms simultaneously.

${context ? `CONTEXT: ${context}` : ''}
${sourceTitle ? `SOURCE TITLE: ${sourceTitle}` : ''}
${sourceDomain ? `SOURCE DOMAIN: ${sourceDomain}` : ''}

SOURCE CONTENT:
${sourceContent}

---

Generate outputs for the following platforms. Write each as if crafted specifically for that platform — not a copy-paste with formatting changes.

${platformInstructions}

---

Respond ONLY with a valid JSON object. No preamble, no markdown, no explanation.

{
  "title": "3-5 word summary of source content",
  "keyThemes": ["theme1", "theme2", "theme3"],
  "outputs": {
    ${platformConfigs.map(p => `"${p.id}": { "content": "full platform content", "hookLine": "opening hook line only", "charCount": 0 }`).join(',\n    ')}
  }
}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const message = await response.json();
    if (!response.ok) throw new Error(message.error?.message || 'Claude API error');

    const raw = message.content[0].text;
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(clean);

    // Recalculate char counts
    if (parsed.outputs) {
      for (const key of Object.keys(parsed.outputs)) {
        if (parsed.outputs[key]?.content) {
          parsed.outputs[key].charCount = parsed.outputs[key].content.length;
        }
      }
    }

    return res.status(200).json({ ...parsed, sourceTitle, sourceDomain });
  } catch (err) {
    console.error('Repurpose error:', err);
    if (err instanceof SyntaxError) {
      return res.status(500).json({ error: 'Failed to parse AI response. Please try again.' });
    }
    return res.status(500).json({ error: err.message || 'Generation failed' });
  }
}