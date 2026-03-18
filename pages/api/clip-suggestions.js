function cleanTranscript(raw) {
  const lines = raw.split('\n');
  const cleaned = [];
  let pendingTimestamp = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const timestampOnly = /^[\[\(]?\d{1,2}:\d{2}(:\d{2})?(,\d+)?[\]\)]?\s*$/.test(line);
    if (timestampOnly) {
      pendingTimestamp = line.replace(/[\[\]\(\)]/g, '').split(',')[0].trim();
      continue;
    }

    const bareLabel = /^(Unknown|Speaker\s*\d*|Host|Guest|Interviewer|Interviewee|[A-Z][a-z]+):?\s*$/.test(line);
    if (bareLabel) continue;

    if (pendingTimestamp) {
      cleaned.push(`[${pendingTimestamp}] ${line}`);
      pendingTimestamp = null;
    } else {
      const inlineTs = line.match(/^(\d{1,2}:\d{2}(:\d{2})?)\s+(.*)/);
      if (inlineTs) {
        cleaned.push(`[${inlineTs[1]}] ${inlineTs[3]}`);
      } else {
        cleaned.push(line);
      }
    }
  }

  return cleaned.join('\n');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { transcript } = req.body;

  if (!transcript || transcript.trim().length < 100) {
    return res.status(400).json({ error: 'Transcript too short or missing' });
  }

  const cleaned = cleanTranscript(transcript);

  const prompt = `You are a podcast content strategist specialising in short-form social media clips.

Analyse this podcast transcript and identify exactly 5 of the most powerful, emotionally engaging moments that would perform well as short-form clips on Instagram Reels, YouTube Shorts, and TikTok.

For each clip return:
- start_time: timestamp where the clip begins — use the inline [MM:SS] timestamps from the transcript exactly. If no timestamps exist use "—"
- end_time: timestamp where the clip ends
- title: a punchy, hook-driven title for the clip (max 10 words)
- hook: the opening caption line (max 20 words, no hashtags)
- reason: one sentence explaining why this moment will perform well
- transcript_excerpt: copy the exact spoken words from this moment verbatim — enough to cover roughly 30 to 60 seconds of speech

Focus on: personal revelations, surprising ironies, emotional turning points, raw honesty, counterintuitive insights.

Respond ONLY with a valid JSON array of exactly 5 objects. Start with [ and end with ]. No markdown, no backticks, no preamble.

Here is the transcript:

${cleaned.slice(0, 90000)}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-haiku-4-5-20251001',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic API error:', err);
      return res.status(500).json({ error: 'API request failed — please try again' });
    }

    const data = await response.json();
    const raw  = data?.content?.[0]?.text || '';

    if (!raw) {
      return res.status(500).json({ error: 'No response from AI — please try again' });
    }

    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) {
      console.error('No JSON array in response:', raw.slice(0, 500));
      return res.status(500).json({ error: 'Could not parse AI response — please try again' });
    }

    const clips = JSON.parse(match[0]);
    return res.status(200).json({ clips });

  } catch (err) {
    console.error('Error:', err.message);
    return res.status(500).json({ error: 'Failed to process transcript — please try again' });
  }
}