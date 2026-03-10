export const config = {
  api: { responseLimit: false },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { content, url, platforms, tone, audience } = req.body;

  if (!content && !url) return res.status(400).json({ error: 'No content or URL provided' });
  if (!platforms || platforms.length === 0) return res.status(400).json({ error: 'No platforms selected' });

  // If URL provided, fetch it server-side
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
      // Strip HTML tags, get text
      sourceContent = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 6000);

      // Extract title
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch) sourceTitle = titleMatch[1].trim();

      // Get domain
      try { sourceDomain = new URL(url).hostname.replace('www.', ''); } catch (_) {}
    } catch (err) {
      return res.status(400).json({ error: 'Could not fetch URL. Try pasting the content directly.' });
    }
  }

  const platformInstructions = {
    linkedin: {
      label: 'LinkedIn Post',
      limit: 3000,
      instructions: 'Professional but personal. Start with a hook (no "I" as first word). Use short paragraphs (1-3 lines). Add 3-5 relevant hashtags at the end. Conversational yet authoritative. End with a question or CTA.'
    },
    twitter: {
      label: 'Twitter/X Thread',
      limit: 2800,
      instructions: 'Write a thread of 5-8 tweets. Format as: "1/ [hook tweet]\\n\\n2/ [point]\\n\\n3/ [point]" etc. Each tweet max 280 chars. First tweet must be a strong hook. Last tweet = summary + follow CTA. Use line breaks within tweets. No hashtags except maybe 1-2 on last tweet.'
    },
    instagram: {
      label: 'Instagram Caption',
      limit: 2200,
      instructions: 'Hook in first line (shows before "more"). Storytelling tone. Use line breaks for readability. 5-10 relevant hashtags at the end separated by a line break. Emojis used sparingly and purposefully. End with engagement question.'
    },
    email: {
      label: 'Email Newsletter',
      limit: 1500,
      instructions: 'Write a complete email newsletter section. Include: Subject line (on first line, prefixed "Subject: "), preview text (second line, prefixed "Preview: "), then the body. Conversational, direct, valuable. Short paragraphs. One clear CTA button text at the end.'
    },
    youtube: {
      label: 'YouTube Description',
      limit: 1000,
      instructions: 'First 2-3 sentences are crucial (shown before "show more"). Include what the video covers. Add timestamps placeholder section. Links/resources section. Subscribe CTA. Relevant tags at the bottom. SEO-optimised.'
    },
    tiktok: {
      label: 'TikTok/Reels Script',
      limit: 800,
      instructions: 'Write a video script. Format: [HOOK - first 3 seconds], [MAIN CONTENT - broken into beats], [CTA - last 5 seconds]. Use "[cut]" to indicate scene changes. Include on-screen text suggestions in brackets. Fast-paced, punchy. Hook must be attention-grabbing.'
    }
  };

  const selectedPlatformInstructions = platforms
    .filter(p => platformInstructions[p])
    .map(p => `### ${platformInstructions[p].label} (key: "${p}", max ${platformInstructions[p].limit} chars)
${platformInstructions[p].instructions}`)
    .join('\n\n');

  const toneGuide = {
    professional: 'Expert, authoritative, polished. No slang.',
    conversational: 'Warm, relatable, like talking to a smart friend.',
    bold: 'Direct, confident, slightly provocative. Strong opinions.',
    educational: 'Clear, structured, informative. Teach and explain.',
    witty: 'Clever, light humour, engaging. Smart but not try-hard.'
  };

  const prompt = `You are an expert content strategist and copywriter. Repurpose the following content for multiple platforms.

TONE: ${toneGuide[tone] || toneGuide.professional}
AUDIENCE: ${audience || 'General professional audience'}
${sourceTitle ? `SOURCE TITLE: ${sourceTitle}` : ''}
${sourceDomain ? `SOURCE DOMAIN: ${sourceDomain}` : ''}

SOURCE CONTENT:
${sourceContent}

---

Repurpose this content for the following platforms. Write each version as if it was crafted specifically for that platform — not just a copy-paste with formatting changes.

${selectedPlatformInstructions}

---

Respond ONLY with a valid JSON object. No preamble, no markdown backticks, no explanation. The JSON must have this exact structure:

{
  "title": "short 3-5 word title summarising the source content",
  "keyThemes": ["theme1", "theme2", "theme3"],
  "outputs": {
    ${platforms.map(p => `"${p}": { "content": "the full platform content here", "charCount": 0, "hookLine": "the opening hook line only" }`).join(',\n    ')}
  }
}

For charCount, calculate the actual character count of the content string.`;

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

    // Recalculate char counts accurately
    if (parsed.outputs) {
      for (const key of Object.keys(parsed.outputs)) {
        if (parsed.outputs[key]?.content) {
          parsed.outputs[key].charCount = parsed.outputs[key].content.length;
        }
      }
    }

    return res.status(200).json({
      ...parsed,
      sourceTitle,
      sourceDomain,
      extractedLength: sourceContent.length,
    });
  } catch (err) {
    console.error('Repurpose error:', err);
    if (err instanceof SyntaxError) {
      return res.status(500).json({ error: 'Failed to parse AI response. Please try again.' });
    }
    return res.status(500).json({ error: err.message || 'Generation failed' });
  }
}