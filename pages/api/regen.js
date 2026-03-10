export const config = {
  api: { responseLimit: false },
};

const PLATFORM_LIMITS = {
  linkedin: 3000,
  twitter: 2800,
  instagram: 2200,
  email: 1500,
  youtube: 1000,
  tiktok: 800,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { platform, currentContent, instruction, tone, audience } = req.body;

  if (!currentContent || !instruction || !platform) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const limit = PLATFORM_LIMITS[platform] || 2000;

  const prompt = `You are an expert copywriter. You have written a ${platform} post and the user wants you to refine it.

CURRENT ${platform.toUpperCase()} CONTENT:
${currentContent}

USER INSTRUCTION: ${instruction}

TONE: ${tone || 'professional'}
AUDIENCE: ${audience || 'General professional audience'}
CHARACTER LIMIT: ${limit}

Rewrite the content following the user's instruction exactly. Keep the same platform format and style conventions for ${platform}. Stay within the character limit.

Return ONLY the refined content — no explanation, no preamble, no quotes around it. Just the content itself.`;

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
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Claude API error');

    const content = data.content[0].text.trim();
    return res.status(200).json({ content });
  } catch (err) {
    console.error('Regen error:', err);
    return res.status(500).json({ error: err.message || 'Regen failed' });
  }
}