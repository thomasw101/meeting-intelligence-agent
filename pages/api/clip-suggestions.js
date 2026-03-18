const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Handles Premiere Pro CSV: "Speaker","HH:MM:SS:FF","HH:MM:SS:FF","Text"
// Also handles plain .txt transcripts passed through as-is
function parseCSVToTimedTranscript(raw) {
  const lines = raw.split('\n');
  const result = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Parse quoted CSV fields
    const fields = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < trimmed.length; i++) {
      const ch = trimmed[i];
      if (ch === '"') { inQuotes = !inQuotes; }
      else if (ch === ',' && !inQuotes) { fields.push(current.trim()); current = ''; }
      else { current += ch; }
    }
    fields.push(current.trim());

    // Need at least 4 fields
    if (fields.length < 4) continue;

    const startRaw = fields[1];
    const text     = fields[3];

    // Skip header row
    if (!text || startRaw.toLowerCase() === 'start time' || text.toLowerCase() === 'text') continue;
    // Skip bare speaker labels
    if (!text || text.trim().length < 3) continue;

    // Convert HH:MM:SS:FF → M:SS (drop frames, drop zero hours)
    const parts = startRaw.split(':');
    let formatted = '—';
    if (parts.length >= 3) {
      const h = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      const s = parts[2].padStart(2, '0');
      formatted = h > 0 ? `${h}:${String(m).padStart(2,'0')}:${s}` : `${m}:${s}`;
    }

    result.push(`[${formatted}] ${text}`);
  }

  return result.join('\n');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { transcript, isCSV = false } = req.body;

  if (!transcript || transcript.trim().length < 100) {
    return res.status(400).json({ error: 'Transcript too short or missing' });
  }

  // If the client signals it's a raw CSV, parse it server-side as a fallback
  // In practice the client page parses before sending, so this is a safety net
  const processed = transcript.slice(0, 90000);

  const hasTimestamps = /\[\d+:\d+\]/.test(processed);

  const prompt = `You are a podcast content strategist specialising in short-form social media clips.

Analyse this podcast transcript and identify exactly 5 of the most powerful, emotionally engaging moments that would perform well as short-form clips on Instagram Reels, YouTube Shorts, and TikTok.

${hasTimestamps
  ? 'The transcript contains inline timestamps in [M:SS] format. Use these EXACT timestamps for start_time and end_time — copy them verbatim from the transcript.'
  : 'This transcript has no timestamps. Use descriptive position references like "early in episode", "around halfway", "near the end" for start_time and end_time.'
}

For each clip return:
- start_time: ${hasTimestamps ? 'exact [M:SS] timestamp from the transcript where this moment begins — copy it exactly' : 'descriptive position reference'}
- end_time: ${hasTimestamps ? 'exact [M:SS] timestamp where this moment ends' : 'descriptive position reference'}
- title: a punchy, hook-driven title for the clip (max 10 words)
- hook: the opening caption line (max 20 words, no hashtags)
- reason: one sentence explaining why this moment will perform well
- transcript_excerpt: the exact spoken words from this moment — maximum 60 words

Focus on: personal revelations, surprising ironies, emotional turning points, raw honesty, counterintuitive insights.

Respond ONLY with a valid JSON array of exactly 5 objects. Start with [ and end with ]. No markdown, no backticks, no preamble.

TRANSCRIPT:
${processed}`;

  try {
    const response = await fetch(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 4096 },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Gemini API error:', err);
      return res.status(500).json({ error: 'API request failed — please try again' });
    }

    const data = await response.json();
    const raw  = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!raw) {
      return res.status(500).json({ error: 'No response from AI — please try again' });
    }

    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) {
      console.error('No JSON array in response:', raw.slice(0, 500));
      return res.status(500).json({ error: 'Could not parse AI response — please try again' });
    }

    const clips = JSON.parse(match[0]);
    return res.status(200).json({ clips, hasTimestamps });

  } catch (err) {
    console.error('Error:', err.message);
    return res.status(500).json({ error: 'Failed to process transcript — please try again' });
  }
}