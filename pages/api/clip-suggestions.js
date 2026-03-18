export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { transcript } = req.body;

  if (!transcript || transcript.trim().length < 100) {
    return res.status(400).json({ error: 'Transcript too short or missing' });
  }

  // Clean the transcript — strip timestamp lines and speaker labels to reduce noise
  const cleaned = transcript
    .split('\n')
    .map(line => line.trim())
    .filter(line => {
      if (!line) return false;
      // Remove lines that are purely timestamps like 00:00:50:19 - 00:01:10:23 or "Unknown"
      if (/^\d{2}:\d{2}:\d{2}[:\d\s\-]+\d{2}:\d{2}:\d{2}/.test(line)) return false;
      if (/^Unknown$/i.test(line)) return false;
      return true;
    })
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  const prompt = `You are a podcast content strategist specialising in short-form social media clips.

Analyse this podcast transcript and identify exactly 5 of the most powerful, emotionally engaging moments that would perform well as short-form clips on Instagram Reels, YouTube Shorts, and TikTok.

For each clip return:
- start_time: approximate time reference for where this clip starts (e.g. "05:15" or "early", "mid", "late" if no timestamps available)
- end_time: approximate time reference for where this clip ends
- title: a punchy, hook-driven title for the clip (max 10 words)
- hook: the first sentence that would appear as the caption hook (max 20 words, no hashtags)
- reason: one sentence explaining why this moment will perform well on social media
- transcript_excerpt: copy the exact spoken words from this moment verbatim, enough to cover roughly 30 to 60 seconds of speech

Focus on: personal revelations, surprising ironies, emotional turning points, raw honesty, or statements that challenge assumptions.

Respond ONLY with a valid JSON array of exactly 5 objects. No markdown fences, no backticks, no preamble, no trailing text. Start your response with [ and end with ].

Here is the transcript:

${cleaned.slice(0, 24000)}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 4096,
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('Gemini API error:', err);
      return res.status(500).json({ error: `Gemini API error: ${response.status}` });
    }

    const data = await response.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!raw) {
      console.error('Empty response from Gemini');
      return res.status(500).json({ error: 'No response from AI — please try again' });
    }

    // Extract JSON array robustly
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) {
      console.error('No JSON array found in response:', raw.slice(0, 500));
      return res.status(500).json({ error: 'Could not parse AI response — please try again' });
    }

    const clips = JSON.parse(match[0]);
    return res.status(200).json({ clips });

  } catch (err) {
    console.error('Error:', err.message);
    return res.status(500).json({ error: 'Failed to process transcript — please try again' });
  }
}