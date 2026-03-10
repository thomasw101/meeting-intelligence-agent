export const config = {
  api: { responseLimit: false },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { platform, format, currentContent, instruction, tone, length, limit } = req.body;

  if (!currentContent || !instruction || !platform) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const toneGuide = {
    professional: 'Expert, authoritative, polished.',
    conversational: 'Warm, relatable, like talking to a smart friend.',
    bold: 'Direct, confident, slightly provocative.',
    educational: 'Clear, structured, informative.',
    witty: 'Clever, light humour, engaging.',
  };

  const prompt = `You are an expert copywriter. Refine this ${platform} ${format || 'post'} based on the user's instruction.

CURRENT CONTENT:
${currentContent}

USER INSTRUCTION: "${instruction}"

TONE: ${toneGuide[tone] || toneGuide.professional}
LENGTH PREFERENCE: ${length || 'medium'}
CHARACTER LIMIT: ${limit || 2000}

Apply the instruction precisely. Keep the same platform format and conventions for ${platform} ${format || ''}. Stay within the character limit.

Return ONLY the refined content — no explanation, no preamble, no quotes. Just the content.`;

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

    return res.status(200).json({ content: data.content[0].text.trim() });
  } catch (err) {
    console.error('Regen error:', err);
    return res.status(500).json({ error: err.message || 'Regen failed' });
  }
}