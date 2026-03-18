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

const STYLE_INSTRUCTIONS = {
  viral:         'Find the 5 moments with the absolute highest viral potential for short-form social media. Optimise purely for what stops the scroll, drives shares, and performs on Instagram Reels, TikTok and YouTube Shorts. No category constraints — just raw performance potential.',
  emotional:     'Find the 5 most emotionally powerful moments — peak vulnerability, raw feeling, human connection, grief, joy, breakthrough. These are the moments that make people stop and feel something.',
  actionable:    'Find the 5 moments that contain the most concrete, usable advice or insight. These clips should leave the viewer with something specific they can apply immediately.',
  controversial: 'Find the 5 most provocative, opinion-led moments — takes that will make people react, disagree, debate or share to argue about.',
  raw:           'Find the 5 most unfiltered, candid moments — where the guest drops their guard, admits something difficult, or speaks with unusual directness.',
  surprising:    'Find the 5 most unexpected moments — surprising facts, reversals of expectation, admissions the audience would not see coming, or revelations that reframe something.',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { transcript, clipStyle = 'viral', context = '', previousTitles = [] } = req.body;

  if (!transcript || transcript.trim().length < 100) {
    return res.status(400).json({ error: 'Transcript is too short or missing.' });
  }

  const cleaned   = cleanTranscript(transcript);
  const truncated = cleaned.slice(0, 90000);

  const avoidBlock = previousTitles.length > 0
    ? `\n\nIMPORTANT: Do NOT suggest any of these moments already shown:\n${previousTitles.map(t => `- ${t}`).join('\n')}\nFind 5 entirely different moments.`
    : '';

  const contextBlock = context ? `\n\nAdditional context: ${context}` : '';

  const styleInstruction = STYLE_INSTRUCTIONS[clipStyle] || STYLE_INSTRUCTIONS.viral;

  const prompt = `You are an expert short-form content strategist specialising in podcast clips. Infer the podcast name, guest, topic and tone directly from the transcript.${contextBlock}

CLIP STRATEGY: ${styleInstruction}${avoidBlock}

For each clip return:
- start_time: timestamp where the clip begins (from inline timestamps in the transcript, e.g. "05:15" — use "—" if none exist)
- end_time: timestamp where the clip ends
- title: punchy clip title, max 8 words
- hook: caption hook to stop the scroll, 1-3 sentences, no hashtags
- reason: 1-2 sentences on why this works as a clip
- transcript_excerpt: verbatim words spoken in this moment, 50-120 words

Respond ONLY with a valid JSON array of exactly 5 objects. Start with [ and end with ]. No markdown, no backticks, no preamble.

TRANSCRIPT:
${truncated}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
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
      console.error('Gemini API error:', err);
      return res.status(502).json({ error: 'Gemini API request failed. Please try again.' });
    }

    const data = await response.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!raw) {
      return res.status(502).json({ error: 'No response from Gemini. Please try again.' });
    }

    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) {
      console.error('No JSON array in response:', raw.slice(0, 500));
      return res.status(502).json({ error: 'Could not parse clip suggestions. Please try again.' });
    }

    const clips = JSON.parse(match[0]);
    return res.status(200).json({ clips });

  } catch (err) {
    console.error('Handler error:', err.message);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}