export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { transcript } = req.body;

  if (!transcript || transcript.trim().length < 100) {
    return res.status(400).json({ error: 'Transcript too short or missing' });
  }

  const prompt = `You are a podcast content strategist specialising in short-form social media clips.

Analyse this podcast transcript and identify exactly 5 of the most powerful, emotionally engaging moments that would perform well as short-form clips on Instagram Reels, YouTube Shorts, and TikTok.

For each clip return:
- start_time: the timestamp where the clip should begin (copy exactly from transcript, format HH:MM:SS)
- end_time: the timestamp where the clip should end (copy exactly from transcript, format HH:MM:SS)
- title: a punchy, hook-driven title for the clip (max 10 words)
- hook: the first sentence or phrase that would appear as the caption hook (max 20 words, no hashtags)
- reason: one sentence explaining why this moment will perform well on social media
- transcript_excerpt: copy the exact spoken words from the transcript that fall between the start and end timestamps. Include the full dialogue verbatim, including speaker names if present. This should be the actual words said, not a summary.

Focus on: personal revelations, surprising ironies, emotional turning points, counterintuitive insights, moments of raw honesty, or statements that challenge assumptions.

Respond ONLY with a valid JSON array of exactly 5 objects. No markdown, no backticks, no preamble. Example format:
[
  {
    "start_time": "00:30:13",
    "end_time": "00:30:46",
    "title": "From Rock Bottom to UFC in 13 Months",
    "hook": "13 months before signing with the UFC, he could not keep a needle out of his arm.",
    "reason": "Dramatic transformation story with a clear before and after — built for short-form virality.",
    "transcript_excerpt": "I was 9 and 1 at the time... 13 months exactly after getting sober, Dana White was there, and he signed me to the UFC that night."
  }
]

Here is the transcript:

${transcript.slice(0, 28000)}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 4096,
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('Gemini error:', err);
      return res.status(500).json({ error: 'Gemini API error' });
    }

    const data = await response.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const clean = raw.replace(/```json|```/g, '').trim();
    const clips = JSON.parse(clean);

    return res.status(200).json({ clips });
  } catch (err) {
    console.error('Parse or fetch error:', err);
    return res.status(500).json({ error: 'Failed to process transcript' });
  }
}